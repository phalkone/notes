import { Collection, ObjectId } from 'mongodb'
import { Note } from '../types'

class notesDao {
  static collection : Collection

  static setCollection (coll : Collection) {
    notesDao.collection = coll
  }

  static async createNote (noteParams : Note) : Promise<ObjectId | string> {
    try {
      const params = {
        ...noteParams,
        updated_on: new Date(),
        created_on: new Date()
      }
      const note = await notesDao.collection.insertOne(params)
      if (note.acknowledged) {
        return note.insertedId
      } else {
        return 'An error occured while creating the note'
      }
    } catch (err : any) {
      return err.toString()
    }
  }

  static async getNote (userNotes: ObjectId[], id : string) {
    try {
      const note = await notesDao.collection.findOne(
        {
          $and: [{ _id: ObjectId.createFromHexString(id) },
            { _id: { $in: userNotes } }]
        }
      )
      return note as Note
    } catch (err : any) {
      return err.toString()
    }
  }

  static async getNotes (ids: ObjectId[], params : any) {
    try {
      const limit = +params.max_page || 20
      const skip = params.page * params.max_page || 0

      const pipeline = []
      if (params.title) pipeline.push({ $match: { $text: { $search: params.title } } })
      pipeline.push({ $match: { _id: { $in: ids } } })
      if (params.favorite) {
        pipeline.push({
          $match: { favorite: params.favorite === 'true' }
        })
      }
      if (params.tags) pipeline.push({ $match: { tags: { $all: params.tags.split(',') } } })
      pipeline.push({ $sort: { updated_on: 1 } })
      pipeline.push({ $skip: skip })
      pipeline.push({ $limit: limit })
      const cursor = notesDao.collection.aggregate(pipeline)
      const results = await cursor.toArray()
      return results
    } catch (err : any) {
      return { error: err.toString() }
    }
  }

  static async getTags (ids: ObjectId[]) {
    try {
      const pipeline = []
      pipeline.push({ $match: { _id: { $in: ids } } })
      pipeline.push({ $unwind: { path: '$tags' } })
      pipeline.push({ $group: { _id: null, tags: { $addToSet: '$tags' } } })

      const cursor = notesDao.collection.aggregate(pipeline)
      const results = await cursor.toArray()
      return results[0].tags.sort()
    } catch (err : any) {
      return { error: err.toString() }
    }
  }

  static async updateNote (userNotes: ObjectId[], id: string, param: any) {
    try {
      const result = await notesDao.collection.findOneAndUpdate(
        {
          $and: [{ _id: ObjectId.createFromHexString(id) },
            { _id: { $in: userNotes } }]
        }
        , {
          $set: param
        }, {
          returnDocument: 'after'
        })
      if (result.value) {
        return result.value
      } else {
        return { error: 'An error occured while updating the note' }
      }
    } catch (err : any) {
      return { error: err.toString() }
    }
  }

  static async addFile (noteId: string, fileId: ObjectId, userNotes: ObjectId[]) {
    try {
      const newFile : any = { files: fileId }
      const result = await notesDao.collection.findOneAndUpdate(
        {
          $and: [{ _id: ObjectId.createFromHexString(noteId) },
            { _id: { $in: userNotes } }]
        }
        , {
          $push: newFile
        })
      if (result.value) {
        return result.value
      } else {
        return { error: 'An error occured while updating the note' }
      }
    } catch (err : any) {
      return { error: err.toString() }
    }
  }

  static async deleteFile (fileId: string, userNotes: ObjectId[]) {
    try {
      const removeFile : any = { files: fileId }
      const result = await notesDao.collection.findOneAndUpdate(
        {
          $and: [{ files: fileId },
            { _id: { $in: userNotes } }]
        }
        , {
          $pull: removeFile
        })
      if (result.value) {
        return result.value
      } else {
        return { error: 'An error occured while updating the note' }
      }
    } catch (err : any) {
      return { error: err.toString() }
    }
  }

  static async deleteUsersNotes (userNotes: ObjectId[]) {
    try {
      console.log(userNotes)
      const result = await notesDao.collection.deleteMany({
        _id: { $in: userNotes }
      })
      if (result.deletedCount === userNotes.length) {
        return { success: 'Deleted all the user\'s notes' }
      } else {
        return { error: 'An error occured while deleting the note' }
      }
    } catch (err : any) {
      return { error: err.toString() }
    }
  }

  static async deleteNote (userNotes: ObjectId[], id: string) {
    try {
      const result = await notesDao.collection.findOneAndDelete(
        {
          $and: [{ _id: ObjectId.createFromHexString(id) },
            { _id: { $in: userNotes } }]
        }
      )
      if (result.ok === 1) {
        return result.value
      } else {
        return 'An error occured while deleting the note'
      }
    } catch (err : any) {
      return err.toString()
    }
  }
}

export { notesDao }
