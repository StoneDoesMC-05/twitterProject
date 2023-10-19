import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
const app = express()
const PORT = 3000
databaseService.connect()
app.use(express.json())
app.get('/', (req, res) => {
  res.send('hello world')
})

app.use('/users', usersRouter)
//localHost:3000/api/tweets

app.listen(PORT, () => {
  console.log(`Server này đang chạy trên post ${PORT}`)
})
