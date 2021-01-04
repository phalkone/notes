import { config } from 'dotenv'
import http from 'http'
import https from 'https'
import { app } from './app.js'
import { readFileSync } from 'fs'

// Configure .env use
config()

// https key and certificate file
const options = {
  key: readFileSync(process.env.HTTPS_KEY),
  cert: readFileSync(process.env.HTTPS_CERT)
}

// Start http and https server
https.createServer(options, app).listen(8443)
http.createServer(options, app).listen(8080)
