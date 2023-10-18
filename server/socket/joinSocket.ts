// опишем логику, что будет происходить когда пользователь будет присоединяться

import { ACTIONS } from '@actions/index'
import { shareRoomsInfo } from '@utils/shareRoomsInfo'
import { Server, Socket } from 'socket.io'

interface IConfig {
  room: string
}
export function joinSocket(socket: Socket, io: Server) {
  return (config: IConfig) => {
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
      io.to(clientId).emit(ACTIONS.ADD_PEER, {
        peerId: socket.id, // id текущего сокета
        createOffer: false, // создание offer не нужно
      })
      // текущему сокеты
      socket.emit(ACTIONS.ADD_PEER, {
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
    shareRoomsInfo(io)
  }
}
