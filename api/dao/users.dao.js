import bson from 'bson'

class usersDao {
  static collection

  static setCollection (coll) {
    usersDao.collection = coll
  }

  static async createUser (user) {
    try {
      const result = await usersDao.collection.insertOne(user)
      if (result.insertedCount === 1) {
        return { succes: 'Succesfully added user' }
      } else {
        return { error: 'An error occured while creating the user' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async getUser(id){
    try {
      const pipeline = [
        {
          '$match': {
            '_id': bson.ObjectId.createFromHexString(id)
          }
        }, {
          '$limit': 1
        }, {
          '$lookup': {
            'from': 'sessions', 
            'localField': '_id', 
            'foreignField': 'user_id', 
            'as': 'sessions'
          }
        }
      ]
      const cursor = await usersDao.collection.aggregate(pipeline)
      return await cursor.toArray()
    } catch (err) {
      console.log(err)
      return { error: err.toString() }
    }
  }

  static async getUserByEmail(email){
    try {
      const user = await usersDao.collection.findOne({ email })
      return user
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async updateUser(id, param){
    try {
      const result = await usersDao.collection.findOneAndUpdate({
        '_id': bson.ObjectId.createFromHexString(id)
      }, param)
      if (result.updatedCount === 1) {
        return { succes: 'Succesfully updated user' }
      } else {
        return { error: 'An error occured while creating the user' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async deleteUser(id){
    try {
      const result = await usersDao.collection.findOneAndDelete({
        '_id': bson.ObjectId.createFromHexString(id)
      })
      if (result.deletedCount === 1) {
        return { succes: 'Succesfully deleted user' }
      } else {
        return { error: 'An error occured while creating the user' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }
}

export { usersDao }
