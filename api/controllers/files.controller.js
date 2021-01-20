import { filesDao } from '../dao/files.dao.js'
import { notesDao } from '../dao/notes.dao.js'
import Busboy from 'busboy'

class filesController {
  static createFile (req, res) {
    try {
      const busboy = new Busboy({ headers: req.headers })
      busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        this.fileId = filesDao.createFile(file, filename, req.user._id)
      })
      busboy.on('finish', async function () {
        const note = await notesDao.addFile(req.params.id, this.fileId, req.user.notes)
        if (note.error) {
          res.status(400).json(note)
        } else {
          res.status(200).json({ ...note, file_id: this.fileId })
        }
      })
      req.pipe(busboy)
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async getFile (req, res) {
    try {
      const downloadStream = await filesDao.getFile(req.params.id, req.user._id)
      if (downloadStream.error) {
        res.json(downloadStream)
      } else {
        res.set('content-type', 'application/octet-stream')
        res.set('accept-ranges', 'bytes')

        downloadStream.on('data', (chunk) => {
          res.write(chunk)
        })

        downloadStream.on('error', () => {
          res.sendStatus(404)
        })

        downloadStream.on('end', () => {
          res.end()
        })
      }
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async deleteFile (req, res) {
    try {
      const file = await filesDao.deleteFile(req.params.id, req.user._id)
      if (file.error) {
        res.status(400).json(file)
      } else {
        const notes = await notesDao.deleteFile(req.params.id, req.user.notes)
        if (notes.error) {
          res.status(400).json(file)
        } else {
          res.status(200).json(notes)
        }
      }
    } catch (err) {
      res.status(400).json({ error: err.toString() })
    }
  }
}

export { filesController }
