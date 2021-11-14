import { usersDao } from '../dao/users.dao'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Request, Response, NextFunction } from 'express'
import { roles } from '../types'
import { ObjectId } from 'mongodb'

class sessionsController {
  static async login (req : Request, res : Response) {
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
        if (match && req.headers['user-agent']) {
          const user = await usersDao.createSession(result._id,
            req.headers['user-agent'])
          if (typeof user === 'string') {
            res.status(400).json({ error: user })
          } else if (user._id && user.sessions) {
            const token = await sessionsController.generateToken(user._id, user.sessions[0]._id)
            if (token && typeof token !== 'string' && token.error) {
              return res.status(401).json({ error: token.error })
            } else if (token && typeof token === 'string') {
              res.set('x-access-token', token)
            }
            res.status(200).json(user)
          }
        } else {
          res.status(401).json({ error: 'Invalid credentials' })
        }
      }
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async generateToken (userId : ObjectId, sessionId : ObjectId) {
    try {
      let token
      if (process.env.SECRET) {
        token = jwt.sign({ user_id: userId.toString(), session_id: sessionId.toString() },
          process.env.SECRET,
          { expiresIn: '7d' })
      }
      return token
    } catch (err: any) {
      return { error: err.toString() }
    }
  }

  static async verifyUser (req : Request, res : Response, next : NextFunction) {
    try {
      const token = req.headers['x-access-token']
      let decoded
      if (typeof token === 'string' && process.env.SECRET) {
        decoded = jwt.verify(token, process.env.SECRET)
        if (typeof decoded !== 'string') {
          const user = await usersDao.getSession(decoded.user_id, decoded.session_id)
          if (typeof user === 'string') {
            res.status(401).json({ error: 'Cannot authenticate user' })
          } else if (user.sessions &&
            new Date(user.sessions[0].expiry).valueOf() > Date.now()) {
            req.user = user
            next()
          } else {
            res.status(401).json({ error: 'Cannot authenticate user' })
          }
        } else {
          res.status(400).json({ error: decoded })
        }
      } else {
        res.status(401).json({ error: 'JsonWebTokenError: jwt must be provided' })
      }
    } catch (err : any) {
      res.status(401).json({ error: err.toString() })
    }
  }

  static async verifyAdmin (req : Request, res : Response, next : NextFunction) {
    try {
      if (req.user && req.user.roles && req.user.roles.includes(roles.admin)) {
        next()
      } else {
        res.status(401).json({ error: 'Not authorized. Must be admin' })
      }
    } catch (err : any) {
      res.status(401).json({ error: err.toString() })
    }
  }

  static async logout (req : Request, res : Response) {
    try {
      if (req.user._id) {
        const result = await usersDao.deleteSession(req.user._id, req.params.id)
        if (result.error) {
          res.status(400).json({ error: result.error })
        } else {
          res.status(200).json({ success: 'Succesfully logged out the user' })
        }
      }
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }
}

export { sessionsController }
