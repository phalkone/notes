import bson from 'bson'

class notesDao {
  static collection

  static setCollection (coll) {
    notesDao.collection = coll
  }

  static async createNote (note) {
    try {
      const result = await notesDao.collection.insertOne(note)
      if (result.insertedCount === 1) {
        return { success: 'Succesfully added note' }
      } else {
        return { error: 'An error occured while creating the note' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async getNote(id){
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
            'foreignField': 'note_id', 
            'as': 'sessions'
          }
        } , {
          '$project': {
            'password': 0
          }
        }
      ]
      const cursor = await notesDao.collection.aggregate(pipeline)
      const note = await cursor.toArray()
      return note[0]
    } catch (err) {
      console.log(err)
      return { error: err.toString() }
    }
  }

  static async getNotes(params){
    try {
      const limit = + params.max_page || 20
      const skip = params.page * params.max_page || 0
      const query = {}
      if(params.email) query.email = params.email
      if(params.roles) query.roles = params.roles
      const cursor = await notesDao.collection.find(query)
        .sort({ email: 1 }).skip(skip).limit(limit)
      return await cursor.toArray()
    } catch (err) {
      console.log(err)
      return { error: err.toString() }
    }
  }

  static async updateNote(id, param){
    try {
      const result = await notesDao.collection.updateOne({
        '_id': bson.ObjectId.createFromHexString(id)
      }, { $set: param })
      if (result.modifiedCount === 1) {
        return { success: 'Succesfully updated note' }
      } else {
        return { error: 'An error occured while updating the note' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async deleteNote(id){
    try {
      const result = await notesDao.collection.deleteOne({
        '_id': bson.ObjectId.createFromHexString(id)
      })
      if (result.deletedCount === 1) {
        return { success: 'Succesfully deleted note' }
      } else {
        return { error: 'An error occured while deleting the note' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }
}

export { notesDao }
