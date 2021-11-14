import { Collection, ObjectId } from 'mongodb'
import parser from 'ua-parser-js'
import { User, Session } from '../types'

class usersDao {
  static collection : Collection

  static setCollection (coll : Collection) {
    usersDao.collection = coll
  }

  static newSession (userAgent : string) : Session {
    const expiry = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
    const ua = parser(userAgent)
    const session = {
      _id: new ObjectId(),
      last_access: new Date(),
      user_agent: `${ua.os.name} - ${ua.browser.name}`,
      expiry
    }
    return session
  }

  static async createUser (user : User) : Promise<string | ObjectId> {
    try {
      const result = await usersDao.collection.insertOne(user)
      if (result.acknowledged) {
        return result.insertedId
      } else {
        return 'An error occured while creating the user'
      }
    } catch (err : any) {
      return err.toString()
    }
  }

  static async createSession (_id : ObjectId, userAgent : string) : Promise<string | User> {
    try {
      const session = usersDao.newSession(userAgent)
      const newSession : any = { sessions: session }
      const user = await usersDao.collection.findOneAndUpdate({ _id }, {
        $push: newSession
      }, {
        projection: {
          sessions: 0,
          password: 0
        }
      })
      if (user.value) {
        user.value.sessions = [session]
        return user.value as User
      } else {
        return 'Error creating new session'
      }
    } catch (err : any) {
      return err.toString()
    }
  }

  // eslint-disable-next-line camelcase
  static async getSession (id: string, session_id: string) : Promise<User | string> {
    try {
      const user = await usersDao.collection.findOneAndUpdate({
        _id: ObjectId.createFromHexString(id)
      }, {
        $set: { 'sessions.$[elem].last_access': new Date() }
      }, {
        arrayFilters: [{ 'elem._id': ObjectId.createFromHexString(session_id) }],
        projection: {
          sessions: {
            $elemMatch: { _id: ObjectId.createFromHexString(session_id) }
          },
          password: 0
        },
        returnDocument: 'after'
      })
      if (user.value) {
        return user.value as User
      } else {
        return 'Requested session not found'
      }
    } catch (err : any) {
      return err.toString()
    }
  }

  // eslint-disable-next-line camelcase
  static async deleteSession (_id : ObjectId, session_id : string) {
    try {
      const result = await usersDao.collection.updateOne({ _id },
        {
          $pull: {
            sessions: {
              _id: ObjectId.createFromHexString(session_id)
            }
          }
        })
      if (result.modifiedCount === 1) {
        return { success: 'Succesfully deleted session' }
      } else {
        return { error: 'Error deleting session' }
      }
    } catch (err : any) {
      return { error: err.toString() }
    }
  }

  static async getUserByEmail (email : string) {
    try {
      const user = await usersDao.collection.findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') }
      },
      { projection: { password: 1 } })
      return user
    } catch (err : any) {
      return { error: err.toString() }
    }
  }

  static async getUsers (params : any) {
    try {
      const limit = +params.max_page || 20
      const skip = params.page * params.max_page || 0
      const query : { email? : string, roles? : string[]} = {}
      if (params.email) query.email = params.email
      if (params.roles) query.roles = params.roles
      const cursor = usersDao.collection.find(query)
        .sort({ email: 1 }).skip(skip).limit(limit)
      return await cursor.toArray()
    } catch (err : any) {
      return { error: err.toString() }
    }
  }

  // eslint-disable-next-line camelcase
  static async updateUser (_id : ObjectId, param : any, session_id : ObjectId) {
    try {
      delete param.roles
      const result = await usersDao.collection.findOneAndUpdate({ _id },
        { $set: param }, {
          projection: {
            sessions: {
              $elemMatch: { _id: session_id }
            },
            password: 0
          },
          returnDocument: 'after'
        })
      if (result.value) {
        return result.value
      } else {
        return { error: 'An error occured while updating the user' }
      }
    } catch (err : any) {
      return { error: err.toString() }
    }
  }

  static async deleteUser (_id : ObjectId) {
    try {
      const result = await usersDao.collection.deleteOne({ _id })
      if (result.deletedCount === 1) {
        return { success: 'Succesfully deleted user' }
      } else {
        return { error: 'An error occured while deleting the user' }
      }
    } catch (err : any) {
      return { error: err.toString() }
    }
  }

  static async linkNote (_id : ObjectId, noteId: ObjectId, tags: string[]) {
    try {
      const note : any = { notes: noteId }
      const user = await usersDao.collection.findOneAndUpdate({ _id }, {
        $push: {
          ...note,
          tags: { $each: tags }
        }
      }, {
        projection: { sessions: 0, password: 0 },
        returnDocument: 'after'
      })
      if (user.value) {
        return user.value
      } else {
        return { error: 'Error linking note to user' }
      }
    } catch (err : any) {
      return { error: err.toString() }
    }
  }

  static async unlinkNote (_id : ObjectId, noteId : ObjectId, tags: string[]) {
    try {
      const note : any = { notes: noteId }
      const user = await usersDao.collection.findOneAndUpdate({ _id }, {
        $pull: note,
        $set: { tags }
      }, {
        projection: { sessions: 0, password: 0 },
        returnDocument: 'after'
      })
      if (user.value) {
        return user.value
      } else {
        return { error: 'Error unlinking note from user' }
      }
    } catch (err : any) {
      return { error: err.toString() }
    }
  }
}

export { usersDao }
