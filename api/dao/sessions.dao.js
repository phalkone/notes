import bson from 'bson'

class sessionsDao {
  static collection

  static setCollection (coll) {
    sessionsDao.collection = coll
  }

  static async createSession (user_id) {
    try {
      const expiry = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
      const result = await sessionsDao.collection.insertOne({ 
        user_id: user_id, 
        last_access: new Date(),
        expiry
      })
      if (result.insertedCount === 1) {
        return { id: result.insertedId }
      } else {
        return { error: 'Error creating new session' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async getSession(id, user_id){
    try {
      const session = await sessionsDao.collection.findOneAndUpdate({ 
        _id: bson.ObjectId.createFromHexString(id),
        user_id: bson.ObjectId.createFromHexString(user_id)
      }, {
        $currentDate: { last_access: true }
      })
      if(session.value){
        return session.value
      } else {
        return { error: 'Requested session not found or not matching with user' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async deleteSession (id, user_id) {
    try {
      const result = await sessionsDao.collection.deleteOne({
        _id: bson.ObjectId.createFromHexString(id),
        user_id: bson.ObjectId.createFromHexString(user_id)
      })
      if (result.deletedCount === 1) {
        return { success: 'Succesfully deleted session' }
      } else {
        return { error: 'Error deleting session' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async deleteUserSessions (user_id) {
    try {
      const result = await sessionsDao.collection.deleteMany({
        user_id: bson.ObjectId.createFromHexString(user_id)
      })
      if (result.deletedCount >= 1) {
        return { success: 'Succesfully deleted sessions' }
      } else {
        return { error: 'Error deleting session' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }
}

export { sessionsDao }
