import 'module-alias/register'
import path from 'path'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { handleSocket } from '@socket/handleSocket'

const PORT = 5000
const app = express()

const publicPath = path.join(__dirname, 'build')
app.use(express.static(publicPath))

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  },
  serveClient: false,
})

io.on('connection', (socket) => {
  handleSocket(socket, io)
})

server.listen(PORT, () => {
  console.log('Server started')
})
