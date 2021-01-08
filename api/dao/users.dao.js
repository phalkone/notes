import bson from 'bson'
import parser from 'ua-parser-js'

class usersDao {
  static collection

  static setCollection (coll) {
    usersDao.collection = coll
  }

  static newSession(userAgent) {
    const expiry = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
    const ua = parser(userAgent) 
    const session = { 
      _id: new bson.ObjectId(),
      last_access: new Date(),
      user_agent: `${ua.os.name} - ${ua.browser.name}`,
      expiry
    }
    return session
  }

  static sanitizeUser(user, session){
    delete user.password
    delete user.sessions
    user.session = session
    user.session._id = user.session._id.toHexString()
    user._id = user._id.toString()
    return user
  }

  static async createUser (user, userAgent) {
    try {
      const session = usersDao.newSession(userAgent)
      const result = await usersDao.collection.insertOne({
        ...user,
        sessions: [session]
      })
      if (result.insertedCount === 1) {
        return usersDao.sanitizeUser(result.ops[0], session)
      } else {
        return { error: 'An error occured while creating the user' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async createSession (id, userAgent) {
    try {
      const session = usersDao.newSession(userAgent)
      const user = await usersDao.collection.findOneAndUpdate({
        _id: bson.ObjectId.createFromHexString(id.toString())
       },{ 
        $push: {sessions: session }
      },{
        returnOriginal: false
      })
      if (user.value) {
        return usersDao.sanitizeUser(user.value, session)
      } else {
        return { error: 'Error creating new session' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async getSession(id, session_id){
    try {
      const user = await usersDao.collection.findOneAndUpdate({ 
        _id: bson.ObjectId.createFromHexString(id)
      },{
        $currentDate: { "sessions.$[elem].last_access": true }
      }, {
        arrayFilters: [{ "elem._id": bson.ObjectId.createFromHexString(session_id) }],
        returnOriginal: false
      })
      if(user.value){
        const session = user.value.sessions.filter((session) => {
          return session._id.toString() === session_id.toString()
        })[0]
        return usersDao.sanitizeUser(user.value, session)
      } else {
        return { error: 'Requested session not found' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async deleteSession (id, session_id) {
    try {
      const result = await usersDao.collection.updateOne({
        '_id': bson.ObjectId.createFromHexString(id)
      }, { $pull: { sessions: { 
        '_id': bson.ObjectId.createFromHexString(session_id) 
      }}})
      if (result.modifiedCount === 1) {
        return { success: 'Succesfully deleted session' }
      } else {
        return { error: 'Error deleting session' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async getUser(id){
    try {
      const user = await usersDao.collection.findOne({
        _id: bson.ObjectId.createFromHexString(id),
      }, { password: 0 })
      return user
    } catch (err) {
      console.log(err)
      return { error: err.toString() }
    }
  }

  static async getUserByEmail(email){
    try {
      const user = await usersDao.collection.findOne({ email }, 
        { projection: { password: 1 } })
      return user
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async getUsers(params){
    try {
      const limit = + params.max_page || 20
      const skip = params.page * params.max_page || 0
      const query = {}
      if(params.email) query.email = params.email
      if(params.roles) query.roles = params.roles
      const cursor = await usersDao.collection.find(query)
        .sort({ email: 1 }).skip(skip).limit(limit)
      return await cursor.toArray()
    } catch (err) {
      console.log(err)
      return { error: err.toString() }
    }
  }

  static async updateUser(id, param){
    try {
      const result = await usersDao.collection.updateOne({
        '_id': bson.ObjectId.createFromHexString(id)
      }, { $set: param })
      if (result.modifiedCount === 1) {
        return { success: 'Succesfully updated user' }
      } else {
        return { error: 'An error occured while updating the user' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async deleteUser(id){
    try {
      const result = await usersDao.collection.deleteOne({
        '_id': bson.ObjectId.createFromHexString(id)
      })
      if (result.deletedCount === 1) {
        return { success: 'Succesfully deleted user' }
      } else {
        return { error: 'An error occured while deleting the user' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }
}

export { usersDao }
