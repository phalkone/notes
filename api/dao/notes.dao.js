import bson from 'bson'

class notesDao {
  static collection

  static setCollection (coll) {
    notesDao.collection = coll
  }

  static async createNote (noteParams) {
    try {
      const params = {
        ...noteParams,
        updated_on: new Date(),
        created_on: new Date()
      }
      const note = await notesDao.collection.insertOne(params)
      if (note.insertedCount === 1) {
        return note.ops[0]
      } else {
        return { error: 'An error occured while creating the note' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async getNote(userNotes, id){
    try {
      const note = await notesDao.collection.findOne(
        { $and: [ { _id: bson.ObjectId.createFromHexString(id) },
        {_id: { $in: userNotes }}]}
      )
      return note
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async getNotes(ids, params){
    try {
      const limit = + params.max_page || 20
      const skip = params.page * params.max_page || 0

      const pipeline = []
      if(params.title) pipeline.push({ $match: { $text: { $search: params.title }}})
      pipeline.push({ $match: { _id: { $in: ids }}})
      if(params.favorite) pipeline.push({ $match: { 
        favorite: params.favorite === 'true' }})
      if(params.tags) pipeline.push({ $match: { tags: { $all : params.tags.split(',') }}})
      pipeline.push({ $sort: { updated_on: 1 }})
      pipeline.push({ $skip: skip })
      pipeline.push({ $limit: limit })
      const cursor = await notesDao.collection.aggregate(pipeline)
      const results = await cursor.toArray()
      return results
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async getTags(ids){
    try {
      const pipeline = []
      pipeline.push({ $match: { _id: { $in: ids }}})
      pipeline.push({ $unwind: { path: '$tags' }})
      pipeline.push({ $group: { _id: null, tags: { $addToSet: '$tags' }}})
      
      const cursor = await notesDao.collection.aggregate(pipeline)
      const results = await cursor.toArray()
      return results[0].tags.sort()
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async updateNote(userNotes, id, param){
    try {
      const result = await notesDao.collection.findOneAndUpdate(
        { $and: [ { _id: bson.ObjectId.createFromHexString(id) },
          { _id: { $in: userNotes }}]}
      , { 
        $set: param,
        $currentDate: { updated_on: true }
      }, {returnOriginal: false})
      if (result.value) {
        return result.value
      } else {
        return { error: 'An error occured while updating the note' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async addFile(noteId, fileId, userNotes){
    try {
      const result = await notesDao.collection.findOneAndUpdate(
        { $and: [ { _id: bson.ObjectId.createFromHexString(noteId) },
          { _id: { $in: userNotes }}]}
      , { 
        $push: { files: fileId },
        $currentDate: { updated_on: true }
      }, {returnOriginal: false})
      if (result.value) {
        return result.value
      } else {
        return { error: 'An error occured while updating the note' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async deleteFile(fileId, userNotes){
    try {
      const result = await notesDao.collection.findOneAndUpdate(
        { $and: [ { files: bson.ObjectId.createFromHexString(fileId) },
          { _id: { $in: userNotes }}]}
      , { 
        $pull: { files: bson.ObjectId.createFromHexString(fileId) },
        $currentDate: { updated_on: true }
      }, {returnOriginal: false})
      if (result.erorr) {
        return { error: 'An error occured while updating the note' }
      } else {
        return result.value
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async deleteUsersNotes(userNotes){
    try {
      console.log(userNotes)
      const result = await notesDao.collection.deleteMany({
        _id: { $in: userNotes}
      })
      if (result.deletedCount === userNotes.length) {
        return { success: 'Deleted all the user\'s notes' }
      } else {
        return { error: 'An error occured while deleting the note' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async deleteNote(userNotes, id){
    try {
      const result = await notesDao.collection.findOneAndDelete(
        { $and: [ { _id: bson.ObjectId.createFromHexString(id) },
        { _id: { $in: userNotes }}]}
      )
      if (result.ok === 1) {
        return result.value
      } else {
        return { error: 'An error occured while deleting the note' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }
}

export { notesDao }
