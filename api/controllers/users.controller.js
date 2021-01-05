import { usersDao } from '../dao/users.dao.js'
import bcrypt from 'bcryptjs'

class usersController {
  static async createUser (req, res) {
    const email = req.body.email
    const passwordRegex = /(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}/
    if (!passwordRegex.test(req.body.password)) {
      return res.json({ error: 'Password should have 1 lowercase letter, 1 uppercase letter, 1 number and be at least 8 characters long' })
    }
    try {
      const password = await bcrypt.hash(req.body.password, 10)
      const result = await usersDao.createUser({ email, password, roles: ['user'] })
      if (result.succes) {
        res.json(result)
      } else if (result.name === 'MongoError') {
        let error
        switch (result.code) {
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
      res.json(err)
    }
  }
}

export { usersController }
