import bson from 'bson'

class filesDao {
  static bucket

  static setFSBucket(bucket) {
    filesDao.bucket = bucket
  }

  static createFile (readable, filename, userId) {
    try {
      const uploadStream = filesDao.bucket.openUploadStream(filename, {
        metadata: { user_id: userId }
      })
      readable.pipe(uploadStream)
      return uploadStream.id
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async getFile(id, userId){
    try {
      const _id = bson.ObjectId.createFromHexString(id)
      const file = filesDao.bucket.find({ _id , 'metadata.user_id' : userId })
      if ((await file.count()) === 0) {
        return { error: 'File not found or not authorized' }
      } else {
        return filesDao.bucket.openDownloadStream(_id)
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async deleteFile(id, userId){
    try {
      const _id = bson.ObjectId.createFromHexString(id)
      const file = filesDao.bucket.find({ _id , 'metadata.user_id' : userId })
      if ((await file.count()) === 0) {
        return { error: 'File not found or not authorized' }
      } else {
        await filesDao.bucket.delete(_id)
        return { success: 'File deleted' }
      }
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async deleteUsersFiles(userId){
    try {
      const files = filesDao.bucket.find({ 'metadata.user_id' : userId })
      await files.forEach(async (file) => {
        await filesDao.bucket.delete(file._id)
      })
      return { success: 'User files have been deleted' }
    } catch (err) {
      return { error: err.toString() }
    }
  }
}

export { filesDao }
