import { ACTIONS } from '@actions/index'
import { Server, Socket } from 'socket.io'
import { validate, version } from 'uuid'
import { shareRoomsInfo } from './shareRoomsInfo'

// функция выхода из комнаты
export function leaveRoom(io: Server, socket: Socket) {
  return () => {
    // получим список комнат из соединения
    const { rooms } = socket

    // получим список пользователей в комнатах
    Array.from(rooms)
      .filter((roomId) => validate(roomId) && version(roomId) === 4)
      .forEach((roomId) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        clients.forEach((clientId) => {
          // каждому пользователю эмитим событие, для того что бы клиент исключил наш пир из списка
          io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
            peerId: socket.id,
          })

          // так же для текущего сокета вызывваем события, что бы удалить пиры других клиентов комнаты из которой он выходит
          socket.emit(ACTIONS.REMOVE_PEER, {
            peerId: clientId,
          })
        })

        // ну и покидаем комнату
        socket.leave(roomId)
      })

    shareRoomsInfo(io)
  }
}
