import { usersDao } from '../dao/users.dao.js'
import { notesDao } from '../dao/notes.dao.js'
import { sessionsController } from './sessions.controller.js'
import bcrypt from 'bcryptjs'

const passwordRegex = /(?=(.*[0-9]))(?=.*[!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}/
const passwordValid = 'Password should have 1 lowercase letter, ' +
  '1 uppercase letter, 1 number and be at least 8 characters long'

class usersController {
  static async createUser (req, res) {
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
      const user = await usersDao.createUser({
        email, password, roles: ['user'], tags: [], notes: []
      }, req.headers['user-agent'])
      if (user._id) {
        const token = await sessionsController.generateToken(user._id, user.sessions[0]._id)
        if (token.error) return res.status(401).json({ error: token.error })
        res.set('x-access-token', token)
        res.status(200).json(user)
      } else {
        res.status(400).json(user)
      }
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async getUser (req, res) {
    try {
      if (req.params.id === req.user._id.toString()) {
        res.status(200).json(req.user)
      } else {
        res.status(401).json({ error: 'Not authorized' })
      }
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async getUsers (req, res) {
    try {
      const users = await usersDao.getUsers(req.query)
      res.status(200).json(users)
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async updateUser (req, res) {
    try {
      if (req.params.id === req.user._id.toString()) {
        const param = {}
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
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async deleteUser (req, res) {
    try {
      if (req.params.id === req.user._id.toString()) {
        const notes = await notesDao.deleteUsersNotes(req.user.notes)
        const user = await usersDao.deleteUser(req.user._id)
        if (user.success && notes.success) {
          res.status(200).json(user)
        } else {
          res.status(400).json({ error: 'Not able to delete user' })
        }
      } else {
        res.status(401).json({ error: 'Not authorized' })
      }
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }
}

export { usersController }
