import { Router } from 'express'
import { usersController } from '../controllers/users.controller'
import { sessionsController } from '../controllers/sessions.controller'
const usersRouter = Router()

usersRouter.post('/', usersController.createUser)
usersRouter.get('/', sessionsController.verifyUser, sessionsController.verifyAdmin, usersController.getUsers)
usersRouter.get('/:id', sessionsController.verifyUser, usersController.getUser)
usersRouter.put('/:id', sessionsController.verifyUser, usersController.updateUser)
usersRouter.delete('/:id', sessionsController.verifyUser, usersController.deleteUser)

export { usersRouter }
