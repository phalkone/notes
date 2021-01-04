import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'

// Cross plaftorm origin calls to API
const corsOptions = {
  origin: /localhost:(8081:8444)/,
  optionsSuccessStatus: 200
}

// Define express app with middleware
const app = express('')
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// For logging purposes
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json('Test of http(s) server')
})

export { app }
