import { filesDao } from '../dao/files.dao'
import { notesDao } from '../dao/notes.dao'
import { Request, Response } from 'express'
import Busboy from 'busboy'
import { Readable } from 'stream'
import { ObjectId } from 'bson'

class filesController {
  static createFile (req : Request, res : Response) {
    try {
      let fileId : ObjectId | string
      const busboy = new Busboy({ headers: req.headers })
      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (req.user._id) {
          fileId = filesDao.createFile(file as Readable, filename, req.user._id)
        }
      })
      busboy.on('finish', async () => {
        if (typeof fileId !== 'string') {
          const note = await notesDao.addFile(req.params.id, fileId, req.user.notes)
          if (note.error) {
            res.status(400).json(note)
          } else {
            res.status(200).json({ ...note, file_id: fileId })
          }
        } else {
          res.status(400).json({ error: fileId })
        }
      })
      req.pipe(busboy)
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async getFile (req : Request, res : Response) {
    try {
      if (req.user._id) {
        const downloadStream = await filesDao.getFile(req.params.id, req.user._id)
        if (typeof downloadStream === 'string') {
          res.json({ error: downloadStream })
        } else {
          res.set('content-type', 'application/octet-stream')
          res.set('accept-ranges', 'bytes')

          downloadStream.on('data', (chunk : any) => {
            res.write(chunk)
          })

          downloadStream.on('error', () => {
            res.sendStatus(404)
          })

          downloadStream.on('end', () => {
            res.end()
          })
        }
      }
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }

  static async deleteFile (req : Request, res : Response) {
    try {
      if (req.user._id) {
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
      }
    } catch (err : any) {
      res.status(400).json({ error: err.toString() })
    }
  }
}

export { filesController }
