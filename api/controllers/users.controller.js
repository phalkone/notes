import { usersDao } from '../dao/users.dao.js'
import { sessionsDao } from '../dao/sessions.dao.js'
import bcrypt from 'bcryptjs'

class usersController {
  static async createUser (req, res) {
    const email = req.body.email
    const passwordRegex = /(?=(.*[0-9]))(?=.*[!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}/
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
      if (req.params.id === req.user_id) {
        const user = await usersDao.getUser(req.user_id)
        res.json(user[0])
      } else {
        req.json({ error: 'Not authorized' })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }

  // TODO add getAllUsers

  static async updateUser (req, res) {
    try {
      if (req.params.id === req.user_id) {
        const param = {}
        if (req.body.email) param.email = req.body.email
        if (req.body.password) {
          param.password = await bcrypt.hash(req.body.password, 10)
        }
        const result = await usersDao.updateUser(req.user_id, param)
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
      if (req.params.id === req.user_id) {
        const users = await usersDao.deleteUser(req.user_id)
        const sessions = await sessionsDao.deleteUserSessions(req.user_id)
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
