import { notesDao } from '../dao/notes.dao'
import { usersDao } from '../dao/users.dao'
import { Request, Response } from 'express'
import { Note } from '../types'
import { ObjectId } from 'bson'

class notesController {
  static async createNote (req : Request, res : Response) {
    try {
      if (!req.body.title && !req.body.body && !req.body.tags) {
        return res.status(400).json({ error: 'Fill in the required fields' })
      }
      req.body.favorite = req.body.favorite || false
      if (typeof req.body.favorite === 'string') {
        req.body.favorite = req.body.favorite === 'true'
      }
      const newNote = req.body as Note
      const note = await notesDao.createNote(newNote)
      if (typeof note === 'string') {
        res.status(400).json({ error: note })
      } else {
        newNote.tags = newNote.tags || []
        const newTags = newNote.tags.filter((tag : any) => !req.user.tags.includes(tag))
        if (req.user._id) {
          const user = await usersDao.linkNote(req.user._id, note, newTags)
          if (user.error) {
            res.status(400).json({ user })
          } else {
            res.status(200).json({
              note: {
                ...newNote,
                _id: note,
                updated_on: new Date(),
                created_on: new Date()
              },
              user
            })
          }
        }
      }
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async getNote (req : Request, res : Response) {
    try {
      const note = await notesDao.getNote(req.user.notes, req.params.id)
      if (!note || typeof note === 'string') {
        res.status(400).json({ error: 'Note not found or not authorised' })
      } else {
        res.status(200).json(note)
      }
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async getNotes (req : Request, res : Response) {
    try {
      const notes = await notesDao.getNotes(req.user.notes, req.query)
      res.status(200).json(notes)
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async updateNote (req : Request, res : Response) {
    try {
      req.body.favorite = req.body.favorite || false
      if (typeof req.body.favorite === 'string') {
        req.body.favorite = req.body.favorite === 'true'
      }
      req.body.updated_on = new Date()
      const note = await notesDao.updateNote(req.user.notes, req.params.id, req.body)
      if (note.error) {
        res.status(400).json(note)
      } else {
        const tags = await notesDao.getTags(req.user.notes)
        if (req.user._id && req.user.sessions) {
          const session = req.user.sessions && req.user.sessions[0]._id ? req.user.sessions[0]._id : new ObjectId()
          const user = await usersDao.updateUser(req.user._id, { tags }, session)
          if (user.error) {
            res.status(400).json({ user })
          } else {
            res.status(200).json({ note, user })
          }
        }
      }
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async deleteNote (req : Request, res : Response) {
    try {
      const note = await notesDao.deleteNote(req.user.notes, req.params.id)
      if (typeof note === 'string') {
        res.status(400).json({ error: note })
      } else {
        const tags = await notesDao.getTags(req.user.notes)
        if (req.user._id) {
          const user = await usersDao.unlinkNote(req.user._id, note._id, tags)
          if (user.error) {
            res.status(400).json({ user })
          } else {
            res.status(200).json({ user })
          }
        }
      }
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }
}

export { notesController }
