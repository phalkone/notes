import { Router } from 'express'
import { notesController } from '../controllers/notes.controller.js'
import { sessionsController } from '../controllers/sessions.controller.js'
const notesRouter = Router()

notesRouter.post('/', sessionsController.verifyUser, notesController.createNote)
notesRouter.get('/', sessionsController.verifyUser, notesController.getNotes)
notesRouter.get('/:id', sessionsController.verifyUser, notesController.getNote)
notesRouter.put('/:id', sessionsController.verifyUser, notesController.updateNote)
notesRouter.delete('/:id', sessionsController.verifyUser, notesController.deleteNote)

export { notesRouter }
