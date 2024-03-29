import { Router } from 'express'
import { filesController } from '../controllers/files.controller'
import { sessionsController } from '../controllers/sessions.controller'
const filesRouter = Router()

filesRouter.post('/:id', sessionsController.verifyUser, filesController.createFile)
filesRouter.get('/:id', sessionsController.verifyUser, filesController.getFile)
filesRouter.delete('/:id', sessionsController.verifyUser, filesController.deleteFile)

export { filesRouter }
