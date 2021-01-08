import { sessionsDao } from '../dao/sessions.dao.js'
import { usersDao } from '../dao/users.dao.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

class sessionsController {
  static async login (req, res) {
    const email = req.body.email
    const password = req.body.password
    const user = await usersDao.getUserByEmail(email)
    if (!user) {
      res.json({ error: 'User not found' })
    } else {
      bcrypt.compare(password, user.password)
        .then(async (result) => {
          if (result) {
            const session = await sessionsDao.createSession(user._id)
            if (session.error) {
              res.json({ error: session.error })
            } else {
              jwt.sign({ user_id: user._id, session_id: session.id },
                process.env.SECRET, { expiresIn: '7d' }, async (err, token) => {
                  if (err) return res.json({ error: err })
                  res.set('x-access-token', token)
                  res.json({ user, session_id: session.id })
                })
            }
          } else {
            res.json({ error: 'Password incorrect' })
          }
        })
        .catch((err) => {
          res.json({ error: err.toString() })
        })
    }
  }

  static async verifyUser (req, res, next) {
    try {
      const token = req.headers['x-access-token']
      const decoded = await jwt.verify(token, process.env.SECRET)
      const session = await sessionsDao.getSession(decoded.session_id, decoded.user_id)
      if (session.expiry && new Date(session.expiry).valueOf() > Date.now()) {
        req.user = await usersDao.getUser(decoded.user_id)
        next()
      } else {
        res.json({ error: 'Session does not exist or has expired' })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }

  static async verifyAdmin (req, res, next) {
    try {
      const result = await usersDao.isAdmin(req.user._id)
      if (result) {
        next()
      } else {
        res.json({ error: 'Not authorized. Must be admin' })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }

  static async logout (req, res) {
    try {
      const session_id = req.params.id
      const result = await sessionsDao.deleteSession(session_id, req.user._id)
      if (result.error) {
        res.json({ error: result.error })
      } else {
        res.json({ success: 'Succesfully logged out the user' })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }
}

export { sessionsController }
