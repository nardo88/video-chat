const path = require('path')
const express = require('express')
const { createServer } = require('http')
const socketIo = require('socket.io')
const { version, validate } = require('uuid')
const socketEvents = require('./actions')

const app = express()
const server = createServer(app)
const io = socketIo(server)

// создадим функцию, которая будет возвращать комнаты
function getClientRooms() {
  // из самого сокета получаем список комнат
  // rooms имеет структуру map
  const { rooms } = io.sockets.adapter

  // возвращаем массив с ключами коллекции map. Тут что бы исключить комнаты который создаем сам сокетio мы отфильтруем комнаты, id которых были созданы с помощью библиотеки uuid v4
  return Array.from(rooms.keys()).filter(
    (roomId) => validate(roomId) && version(roomId) === 4
  )
}

// эти комнаты нам надо передать пользователю, который подключился к сокету
function shareRoomsInfo() {
  io.emit(socketEvents.SHARE_ROOMS, {
    rooms: getClientRooms(),
  })
}

io.on('connection', (socket) => {
  shareRoomsInfo()

  // опишем логику, что будет происходить когда пользователь будет присоединяться
  socket.on(socketEvents.JOIN, (config) => {
    // получаем id комнаты
    const { room: roomId } = config
    // у текущего соединения получаем те комнаты к которым он присоединен
    const { rooms: joinedRooms } = socket

    // если мы уже присоединены к комнате, то выдаем сообщение
    if (Array.from(joinedRooms).includes(roomId)) {
      return console.warn(`Already joined to ${roomId}`)
    }

    // получаем список всех пользователей комнаты
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
    // итерируемся по массиву с пользователями комнаты
    clients.forEach((clientId) => {
      // и каждому пользователю емитим событие
      io.to(clientId).emit(socketEvents.ADD_PEER, {
        peerId: socket.id, // id текущего сокета
        createOffer: false, // создание offer не нужно
      })
      // текущему сокеты
      socket.emit(socketEvents.ADD_PEER, {
        peerId: clientId,
        createOffer: true, // так как оффер должна создавать только та сторона, которая подключается к комнате. Те кто уже в комнате, они будут у себя просто добавлять нового пользователя к пирам
      })

      /*
      тот кто создал комнату он ничего не будет делать, так как в комнате никого еще нет. А когда зайдет второй, то первый уже находящийся в комнате получит новый пир, а тот кто зашел, тот создаст оффер для тех кто уде в комнате
      
      */
    })

    // после того как мы обменялись пирами текущий пользователь присоединяется к комнате
    socket.join(roomId)
    // после чего делимся со всем о том что у нас получилась новая коната
    shareRoomsInfo()
  })

  // функция выхода из комнаты
  function leaveRoom() {
    // получим список комнат из соединения
    const { rooms } = socket

    // получим список пользователей в комнатах
    Array.from(rooms).forEach((roomId) => {
      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
      clients.forEach((clientId) => {
        // каждому пользователю эмитим событие, для того что бы клиент исключил наш пир из списка
        io.to(clientId).emit(socketEvents.REMOVE_PEER, {
          peerId: socket.id,
        })

        // так же для текущего сокета вызывваем события, что бы удалить пиры других клиентов комнаты из которой он выходит
        socket.emit(socketEvents.REMOVE_PEER, {
          peerId: clientId,
        })
      })

      // ну и покидаем комнату
      socket.leave(roomId)
    })

    shareRoomsInfo()
  }

  // добавим логику выхода из комнаты
  socket.on(socketEvents.LEAVE, leaveRoom)
  socket.on('disconnecting', leaveRoom)
})

server.listen('5000', () => {
  console.log('Server started')
})
