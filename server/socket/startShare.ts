import { ACTIONS } from '@actions/index'
import { Server, Socket } from 'socket.io'

interface IData {
  trackId: string
  roomId: string
}

export function startShare(socket: Socket, io: Server) {
  return (data: IData) => {
    const { roomId, trackId } = data
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
    // итерируемся по массиву с пользователями комнаты
    clients.forEach((clientId) => {
      // и каждому пользователю емитим событие
      io.to(clientId).emit(ACTIONS.START_SHARE_DESCTOP, {
        peerId: socket.id, // id текущего сокета
        trackId,
      })
    })
  }
}
