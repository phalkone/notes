import { Router } from 'express'
import { sessionsController } from '../controllers/sessions.controller'
const sessionsRouter = Router()

sessionsRouter.post('/', sessionsController.login)
sessionsRouter.delete('/:id', sessionsController.verifyUser, sessionsController.logout)

export { sessionsRouter }
