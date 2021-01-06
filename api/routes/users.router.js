import { Router } from 'express'
import { usersController } from '../controllers/users.controller.js'
import { sessionsController } from '../controllers/sessions.controller.js'
const usersRouter = Router()

usersRouter.post('/', usersController.createUser)
usersRouter.get('/:id', sessionsController.verifyUser, usersController.getUser)

export { usersRouter }
