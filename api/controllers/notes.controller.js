import { notesDao } from '../dao/notes.dao.js'
import { usersDao } from '../dao/users.dao.js'

class notesController {
  static async createNote (req, res) {
    try {
      if (!req.body.title && !req.body.body && !req.body.tags) {
        return res.status(400).json({ error: 'Fill in the required fields' })
      }
      req.body.favorite = req.body.favorite || false
      if (typeof req.body.favorite === 'string') {
        req.body.favorite = req.body.favorite === 'true'
      }
      const note = await notesDao.createNote(req.body)
      if (note.error) {
        res.status(400).json({ error: note.error })
      } else {
        note.tags = note.tags || []
        const newTags = note.tags.filter((tag) => !req.user.tags.includes(tag))
        const user = await usersDao.linkNote(req.user._id, note._id, newTags)
        if (user.error) {
          res.status(400).json({ user })
        } else {
          res.status(200).json({ note, user })
        }
      }
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async getNote (req, res) {
    try {
      const note = await notesDao.getNote(req.user.notes, req.params.id)
      if (!note || note.error) {
        res.status(400).json({ error: 'Note not found or not authorised' })
      } else {
        res.status(200).json(note)
      }
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async getNotes (req, res) {
    try {
      const notes = await notesDao.getNotes(req.user.notes, req.query)
      res.status(200).json(notes)
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async updateNote (req, res) {
    try {
      req.body.favorite = req.body.favorite || false
      if (typeof req.body.favorite === 'string') {
        req.body.favorite = req.body.favorite === 'true'
      }
      const note = await notesDao.updateNote(req.user.notes, req.params.id, req.body)
      if (note.error) {
        res.status(400).json(note)
      } else {
        const tags = await notesDao.getTags(req.user.notes)
        const user = await usersDao.updateUser(req.user._id, { tags }, req.user.sessions[0]._id)
        if (user.error) {
          res.status(400).json({ user })
        } else {
          res.status(200).json({ note, user })
        }
      }
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async deleteNote (req, res) {
    try {
      const note = await notesDao.deleteNote(req.user.notes, req.params.id)
      if (note.error) {
        res.status(400).json(note)
      } else {
        const tags = await notesDao.getTags(req.user.notes)
        const user = await usersDao.unlinkNote(req.user._id, note._id, tags)
        if (user.error) {
          res.status(400).json({ user })
        } else {
          res.status(200).json({ user })
        }
      }
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }
}

export { notesController }
