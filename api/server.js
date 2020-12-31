require('dotenv').config()
const express = require('express')
const http = require('http')
const https = require('https')
const fs = require('fs')
const cors = require('cors')

const corsOptions = {
  origin: /localhost:(8081:8444)/,
  optionsSuccessStatus: 200
}

const app = express('')
app.use(cors(corsOptions))

app.get('/', (req, res) => {
  res.json('Test of http(s) server')
})

const options = {
  key: fs.readFileSync(process.env.HTTPS_KEY),
  cert: fs.readFileSync(process.env.HTTPS_CERT)
}

https.createServer(options, app).listen(8443)
http.createServer(options, app).listen(8080)
