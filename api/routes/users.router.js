import { Router } from 'express'
import { usersController } from '../controllers/users.controller.js'
import { sessionsController } from '../controllers/sessions.controller.js'
const usersRouter = Router()

usersRouter.post('/', usersController.createUser)
usersRouter.get('/:id', sessionsController.verifyUser, usersController.getUser)
usersRouter.put('/:id', sessionsController.verifyUser, usersController.updateUser)
usersRouter.delete('/:id', sessionsController.verifyUser, usersController.deleteUser)

export { usersRouter }
