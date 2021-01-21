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

  static async createUser (user, userAgent) {
    try {
      const session = usersDao.newSession(userAgent)
      const result = await usersDao.collection.insertOne({
        ...user,
        sessions: [session]
      })
      if (result.insertedCount === 1) {
        delete result.ops[0].password
        return result.ops[0]
      } else {
        return { error: 'An error occured while creating the user' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async createSession (_id, userAgent) {
    try {
      const session = usersDao.newSession(userAgent)
      const user = await usersDao.collection.findOneAndUpdate({ _id },{ 
        $push: {sessions: session }
      },{
        returnOriginal: false,
        projection: { sessions: { $elemMatch: { 
          _id: session._id } }, 
          password: 0 }
      })
      if (user.value) {
        return user.value
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
        returnOriginal: false,
        projection: { sessions: { $elemMatch: { 
          _id: bson.ObjectId.createFromHexString(session_id) } }, 
          password: 0 }
      })
      if(user.value){
        return user.value
      } else {
        return { error: 'Requested session not found' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async deleteSession (_id, session_id) {
    try {
      const result = await usersDao.collection.updateOne({ _id }, 
      { $pull: { sessions: { 
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

  static async getUserByEmail(email){
    try {
      const user = await usersDao.collection.findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') }
      }, 
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

  static async updateUser(_id, param, session_id){
    try {
      delete param.roles
      const result = await usersDao.collection.findOneAndUpdate({ _id }, 
        { $set: param }, { 
          returnOriginal: false,
          projection: { sessions: { $elemMatch: { 
            _id: session_id } }, 
            password: 0 }
        })
      if (result.value) {
        return result.value
      } else {
        return { error: 'An error occured while updating the user' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async deleteUser(_id){
    try {
      const result = await usersDao.collection.deleteOne({ _id })
      if (result.deletedCount === 1) {
        return { success: 'Succesfully deleted user' }
      } else {
        return { error: 'An error occured while deleting the user' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async linkNote(_id, noteId, tags){
    try {
      const user = await usersDao.collection.findOneAndUpdate({ _id },{ 
        $push: {
          notes: bson.ObjectId.createFromHexString(noteId.toString()),
          tags: { $each: tags }
        }
      },{
        returnOriginal: false,
        projection: { sessions: 0, password: 0 }
      })
      if (user.value) {
        return user.value
      } else {
        return { error: 'Error linking note to user' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async unlinkNote(_id, noteId, tags){
    try {
      const user = await usersDao.collection.findOneAndUpdate({ _id },{ 
        $pull: { notes: noteId },
        $set: { tags }
      },{
        returnOriginal: false,
        projection: { sessions: 0, password: 0 }
      })
      if (user.value) {
        return user.value
      } else {
        return { error: 'Error unlinking note from user' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }
}

export { usersDao }
