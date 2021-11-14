import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { usersRouter } from './routes/users.router'
import { notesRouter } from './routes/notes.router'
import { sessionsRouter } from './routes/sessions.router'
import { filesRouter } from './routes/files.router'

// Cross plaftorm origin calls to API
const corsOptions = {
  origin: /^https?:\/\/localhost:?[0-9]*$/,
  optionsSuccessStatus: 200,
  exposedHeaders: 'x-access-token'
}

// Define express app with middleware
const app = express()
app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// For logging purposes
app.use(morgan('dev'))

// Routes
app.use('/files', filesRouter)
app.use('/users', usersRouter)
app.use('/notes', notesRouter)
app.use('/sessions', sessionsRouter)

// Route not found
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

export { app }
