const path = require('path')
const express = require('express')
const { createServer } = require('http')
const io = require('socket.io')
const socketEvents = require('./actions')

const app = express()
const server = createServer(app)
const socket = io(server)

// создадим функцию, которая будет возвращать комнаты
function getClientRooms() {
  // из самого сокета получаем список комнат
  // rooms имеет структуру map
  const { rooms } = socket.sockets.adapter

  // возвращаем массив с ключами коллекции map
  return Array.from(rooms.keys())
}

// эти комнаты нам надо передать пользователю, который подключился к сокету
function shareRoomsInfo() {
  socket.emit(socketEvents.SHARE_ROOMS, {
    rooms: getClientRooms(),
  })
}

socket.on('connection', (socket) => {
  console.log('socket connected')
  shareRoomsInfo()
})

server.listen('5000', () => {
  console.log('Server started')
})
