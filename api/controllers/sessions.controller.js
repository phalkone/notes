import { usersDao } from '../dao/users.dao.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

class sessionsController {
  static async login (req, res) {
    try {
      const email = req.body.email
      if (!email) return res.status(400).json({ error: 'Please provide email' })
      const password = req.body.password
      if (!password) return res.status(400).json({ error: 'Please provide password' })
      const result = await usersDao.getUserByEmail(email)
      if (!result) {
        res.status(400).json({ error: 'User not found' })
      } else {
        const match = await bcrypt.compare(password, result.password)
        if (match) {
          const user = await usersDao.createSession(result._id,
            req.headers['user-agent'])
          if (user.error) {
            res.status(400).json(user)
          } else {
            const token = await sessionsController.generateToken(user._id, user.session._id)
            if (token.error) return res.status(401).json({ error: token.error })
            res.set('x-access-token', token)
            res.status(200).json(user)
          }
        } else {
          res.status(401).json({ error: 'Invalid credentials' })
        }
      }
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async generateToken (user_id, session_id) {
    try {
      const token = await jwt.sign({ user_id, session_id },
        process.env.SECRET, { expiresIn: '7d' })
      return token
    } catch (err) {
      return { error: err.toString() }
    }
  }

  static async verifyUser (req, res, next) {
    try {
      const token = req.headers['x-access-token']
      const decoded = await jwt.verify(token, process.env.SECRET)
      const user = await usersDao.getSession(decoded.user_id, decoded.session_id)
      if (user.session &&
          new Date(user.session.expiry).valueOf() > Date.now()) {
        req.user = user
        next()
      } else {
        res.status(401).json({ error: 'Cannot authenticate user' })
      }
    } catch (err) {
      res.status(401).json({ error: err.toString() })
    }
  }

  static async verifyAdmin (req, res, next) {
    try {
      if (req.user.roles.includes('admin')) {
        next()
      } else {
        res.status(401).json({ error: 'Not authorized. Must be admin' })
      }
    } catch (err) {
      res.status(401).json({ error: err.toString() })
    }
  }

  static async logout (req, res) {
    try {
      const session_id = req.params.id
      const result = await usersDao.deleteSession(req.user._id, session_id)
      if (result.error) {
        res.status(400).json({ error: result.error })
      } else {
        res.status(200).json({ success: 'Succesfully logged out the user' })
      }
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }
}

export { sessionsController }
