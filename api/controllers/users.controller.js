import { usersDao } from '../dao/users.dao.js'
import { sessionsDao } from '../dao/sessions.dao.js'
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
      const result = await usersDao.createUser({ email, password, roles: ['user'] })
      if (result.success) {
        res.json(result)
      } else if (result.error) {
        let error = result.error
        switch (result.error.code) {
          case 11000:
            error = 'Email already registed'
            break
          case 121:
            error = 'Document failed validation'
            break
          default:
            error = `MongoError ${result.code}`
        }
        res.json({ error })
      } else {
        res.json({ result })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }

  static async getUser (req, res) {
    try {
      if (req.params.id === req.user._id) {
        const user = await usersDao.getUser(req.user._id)
        res.json(user)
      } else {
        req.json({ error: 'Not authorized' })
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
        req.json({ error: 'Not authorized' })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }

  static async deleteUser (req, res) {
    try {
      if (req.params.id === req.user._id) {
        const users = await usersDao.deleteUser(req.user._id)
        const sessions = await sessionsDao.deleteUserSessions(req.user._id)
        res.json({ users, sessions })
      } else {
        req.json({ error: 'Not authorized' })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }
}

export { usersController }
