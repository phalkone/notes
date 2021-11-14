import dotenv from 'dotenv'
import https from 'https'
import path from 'path'
import { readFileSync } from 'fs'
import { MongoClient, GridFSBucket } from 'mongodb'
import { app } from './app'
import { usersDao } from './dao/users.dao'
import { notesDao } from './dao/notes.dao'
import { filesDao } from './dao/files.dao'

// Configure .env use
dotenv.config()

// Connect with MongoDB
const client = process.env.DB_URI ? new MongoClient(process.env.DB_URI) : null

async function run () {
  if (client) {
    try {
      await client.connect()
      await client.db('notes').command({ ping: 1 })
      console.log('Connected to db')
      usersDao.setCollection(client.db('notes').collection('users'))
      notesDao.setCollection(client.db('notes').collection('notes'))
      filesDao.setFSBucket(new GridFSBucket(client.db('notes')))
    } catch (e) {
      console.log(e)
    }
  }
}
run().catch(console.dir)

// https key and certificate file
let options = {}
if (process.env.HTTPS_KEY && process.env.HTTPS_CERT) {
  options = {
    key: readFileSync(path.resolve(__dirname, process.env.HTTPS_KEY)),
    cert: readFileSync(path.resolve(__dirname, process.env.HTTPS_CERT))
  }
}

// Start http and https server
https.createServer(options, app).listen(process.env.PORT_HTTPS, () => {
  console.log(`HTTPS server listening on ${process.env.PORT_HTTPS}`)
})
app.listen(process.env.PORT, () => {
  console.log(`HTTP server listening on ${process.env.PORT}`)
})
