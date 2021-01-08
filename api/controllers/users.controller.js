import { usersDao } from '../dao/users.dao.js'
import { sessionsController } from './sessions.controller.js'
import bcrypt from 'bcryptjs'

const passwordRegex = /(?=(.*[0-9]))(?=.*[!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}/

class usersController {
  static async createUser (req, res) {
    const email = req.body.email
    if (!passwordRegex.test(req.body.password)) {
      return res.json({
        error: 'Password should have 1 lowercase letter, ' +
        '1 uppercase letter, 1 number and be at least 8 characters long'
      })
    }
    try {
      const password = await bcrypt.hash(req.body.password, 10)
      const user = await usersDao.createUser({
        email, password, roles: ['user']
      }, req.headers['user-agent'])
      if (user._id) {
        const token = await sessionsController.generateToken(user._id, user.sessions_id)
        if (token.error) return res.json({ error: token.error })
        res.set('x-access-token', token)
        res.json(user)
      } else if (user.error) {
        let error = user.error
        switch (user.error.code) {
          case 11000:
            error = 'Email already registed'
            break
          case 121:
            error = 'Document failed validation'
            break
          default:
            error = `MongoError ${user.code}`
        }
        res.json({ error })
      } else {
        res.json({ user })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }

  static async getUser (req, res) {
    try {
      if (req.params.id === req.user._id) {
        res.json(req.user)
      } else {
        res.json({ error: 'Not authorized' })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }

  static async getUsers (req, res) {
    try {
      const users = await usersDao.getUsers(req.query)
      res.json(users)
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }

  static async updateUser (req, res) {
    try {
      if (req.params.id === req.user._id) {
        const param = {}
        if (req.body.email) param.email = req.body.email
        if (req.body.password && passwordRegex.test(req.body.password)) {
          param.password = await bcrypt.hash(req.body.password, 10)
        }
        const result = await usersDao.updateUser(req.user._id, param)
        res.json(result)
      } else {
        res.json({ error: 'Not authorized' })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }

  static async deleteUser (req, res) {
    try {
      if (req.params.id === req.user._id) {
        const result = await usersDao.deleteUser(req.user._id)
        res.json(result)
      } else {
        res.json({ error: 'Not authorized' })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }
}

export { usersController }
