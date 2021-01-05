import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import { usersRouter } from './routes/users.router.js'

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

// Routes
app.use('/users', usersRouter)

// Route not found
app.use('*', (req, res) => {
  res.send('404')
})

export { app }
