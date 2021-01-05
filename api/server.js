import dotenv from 'dotenv'
import http from 'http'
import https from 'https'
import { app } from './app.js'
import { readFileSync } from 'fs'
import mongodb from 'mongodb'
import { usersDao } from './dao/users.dao.js'
const { MongoClient } = mongodb

// Configure .env use
dotenv.config()

// Connect with MongoDB
const client = new MongoClient(
  process.env.DB_URI, { useUnifiedTopology: true }
)
async function run () {
  try {
    await client.connect()
    await client.db('notes').command({ ping: 1 })
    console.log('Connected to db')
    usersDao.setCollection(client.db('notes').collection('users'))
  } catch (e) {
    console.log(e)
  }
}
run().catch(console.dir)

// https key and certificate file
const options = {
  key: readFileSync(process.env.HTTPS_KEY),
  cert: readFileSync(process.env.HTTPS_CERT)
}

// Start http and https server
https.createServer(options, app).listen(process.env.PORT_HTTPS)
http.createServer(options, app).listen(process.env.PORT)
