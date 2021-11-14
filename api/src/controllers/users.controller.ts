import { usersDao } from '../dao/users.dao'
import { notesDao } from '../dao/notes.dao'
import { filesDao } from '../dao/files.dao'
import { sessionsController } from './sessions.controller'
import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import { roles } from '../types'

const passwordRegex = /(?=(.*[0-9]))(?=.*[!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}/
const passwordValid = 'Password should have 1 lowercase letter, ' +
  '1 uppercase letter, 1 number and be at least 8 characters long'

class usersController {
  static async createUser (req : Request, res : Response) {
    const email = req.body.email
    if (!email) return res.status(400).json({ error: 'Please provide email' })
    if (!req.body.password) return res.status(400).json({ error: 'Please provide password' })
    if (!passwordRegex.test(req.body.password)) {
      return res.status(400).json({
        error: passwordValid
      })
    }
    try {
      const password = await bcrypt.hash(req.body.password, 10)
      const userAgent = req.headers['user-agent'] ? req.headers['user-agent'] : 'unknown'
      const session = usersDao.newSession(userAgent)
      const user = await usersDao.createUser({
        email, password, roles: [roles.user], tags: [], notes: [], sessions: [session]
      })
      if (typeof user !== 'string') {
        const token = await sessionsController.generateToken(user, session._id)
        if (token && typeof token !== 'string' && token.error) {
          return res.status(401).json({ error: token.error })
        } else if (token && typeof token === 'string') {
          res.set('x-access-token', token)
          res.status(200).json({
            _id: user, email, roles: [roles.user], tags: [], notes: [], sessions: [session]
          })
        }
      } else {
        res.status(400).json({ error: user })
      }
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async getUser (req : Request, res : Response) {
    try {
      if (req.user._id && req.params.id === req.user._id.toString()) {
        res.status(200).json(req.user)
      } else {
        res.status(401).json({ error: 'Not authorized' })
      }
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async getUsers (req : Request, res : Response) {
    try {
      const users = await usersDao.getUsers(req.query)
      res.status(200).json(users)
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async updateUser (req : Request, res : Response) {
    try {
      if (req.user._id && req.params.id === req.user._id.toString()) {
        const param : any = {}
        if (req.body.email) param.email = req.body.email
        if (req.body.password && passwordRegex.test(req.body.password)) {
          param.password = await bcrypt.hash(req.body.password, 10)
        } else if (req.body.password) {
          return res.status(400).json({ error: passwordValid })
        }
        if (Object.keys(param).length === 0) {
          return res.status(400).json({ error: 'Please provide paramters to update' })
        }
        const result = await usersDao.updateUser(req.user._id, param, req.user.sessions[0]._id)
        if (result.error) {
          res.status(400).json(result)
        } else {
          res.status(200).json(result)
        }
      } else {
        res.status(401).json({ error: 'Not authorized' })
      }
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async deleteUser (req : Request, res : Response) {
    try {
      if (req.user._id && req.params.id === req.user._id.toString()) {
        const notes = await notesDao.deleteUsersNotes(req.user.notes)
        const files = await filesDao.deleteUsersFiles(req.user._id)
        const user = await usersDao.deleteUser(req.user._id)
        if (user.success && notes.success && files.success) {
          res.status(200).json(user)
        } else {
          res.status(400).json({ error: 'Not able to delete user' })
        }
      } else {
        res.status(401).json({ error: 'Not authorized' })
      }
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }
}

export { usersController }
