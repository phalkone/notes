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
        user_id: user_id, expiry
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
      const session = await sessionsDao.collection.findOne({ 
        _id: bson.ObjectId.createFromHexString(id)
      })
      if(session.user_id.toString() === user_id){
        return session
      } else {
        return { error: 'Requested sessions does not match with user'}
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
        return true
      } else {
        return { error: 'Error deleting session' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }
}

export { sessionsDao }
