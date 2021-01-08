import { notesDao } from '../dao/notes.dao.js'

class notesController {
  static async createNote (req, res) {
    try {
      const result = await notesDao.createNote(req.body)
      if (result.success) {
        res.json(result)
      } else {
        res.json({ result })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }

  static async getNote (req, res) {
    try {
      if (req.user.notes.includes(req.params.id)) {
        const note = await notesDao.getNote(req.params.id)
        res.json(Note[0])
      } else {
        res.json({ error: 'Not authorized' })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }

  static async getNotes (req, res) {
    try {
      const notes = await notesDao.getnotes(req.user.notes)
      res.json(notes)
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }

  static async updateNote (req, res) {
    try {
      if (req.params.id === req.Note_id) {
        const param = {}
        if (req.body.email) param.email = req.body.email
        if (req.body.password) {
          param.password = await bcrypt.hash(req.body.password, 10)
        }
        const result = await notesDao.updateNote(req.Note_id, param)
        res.json(result)
      } else {
        res.json({ error: 'Not authorized' })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }

  static async deleteNote (req, res) {
    try {
      if (req.params.id === req.Note_id) {
        const notes = await notesDao.deleteNote(req.Note_id)
        res.json({ notes, sessions })
      } else {
        res.json({ error: 'Not authorized' })
      }
    } catch (err) {
      res.json({ error: err.toString() })
    }
  }
}

export { notesController }
