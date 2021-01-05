import { Router } from 'express'
import { usersController } from '../controllers/users.controller.js'
const usersRouter = Router()

usersRouter.post('/', usersController.createUser)

export { usersRouter }
