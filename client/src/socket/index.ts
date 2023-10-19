import { io } from 'socket.io-client'

const socket = io('http://localhost:5000', {
  timeout: 10000,
  transports: ['websocket'],
})

export default socket
