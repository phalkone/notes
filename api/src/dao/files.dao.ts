import { GridFSBucket, ObjectId, GridFSBucketReadStream } from 'mongodb'
import { Readable } from 'stream'

class filesDao {
  static bucket : GridFSBucket

  static setFSBucket (bucket: GridFSBucket) {
    filesDao.bucket = bucket
  }

  static createFile (readable : Readable, filename : string, userId : ObjectId) : ObjectId | string {
    try {
      const uploadStream = filesDao.bucket.openUploadStream(filename, {
        metadata: { user_id: userId }
      })
      readable.pipe(uploadStream)
      return uploadStream.id
    } catch (err : any) {
      return err.toString()
    }
  }

  static async getFile (id : string, userId : ObjectId) : Promise<string | GridFSBucketReadStream> {
    try {
      const _id = ObjectId.createFromHexString(id)
      const file = filesDao.bucket.find({ _id, 'metadata.user_id': userId })
      if ((await file.count()) === 0) {
        return 'File not found or not authorized'
      } else {
        return filesDao.bucket.openDownloadStream(_id)
      }
    } catch (err : any) {
      return err.toString()
    }
  }

  static async deleteFile (id : string, userId : ObjectId) {
    try {
      const _id = ObjectId.createFromHexString(id)
      const file = filesDao.bucket.find({ _id, 'metadata.user_id': userId })
      if ((await file.count()) === 0) {
        return { error: 'File not found or not authorized' }
      } else {
        await filesDao.bucket.delete(_id)
        return { success: 'File deleted' }
      }
    } catch (err : any) {
      return { error: err.toString() }
    }
  }

  static async deleteUsersFiles (userId : ObjectId) {
    try {
      const files = filesDao.bucket.find({ 'metadata.user_id': userId })
      await files.forEach((file) => {
        filesDao.bucket.delete(file._id)
      })
      return { success: 'User files have been deleted' }
    } catch (err : any) {
      return { error: err.toString() }
    }
  }
}

export { filesDao }
