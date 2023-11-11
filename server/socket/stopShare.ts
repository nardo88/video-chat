import { ACTIONS } from '@actions/index'
import { Server, Socket } from 'socket.io'

interface IData {
  trackId: string
  peerId: string
  sessionDescription: any
  type: 'offer' | 'answer'
}

export function stopShare(socket: Socket, io: Server) {
  return (data: IData) => {
    const { peerId, sessionDescription, type } = data
    // итерируемся по массиву с пользователями комнаты
    io.to(peerId).emit(ACTIONS.STOP_SHARE_DESCTOP, {
      peerId: socket.id, // id текущего сокета
      sessionDescription,
      type,
    })
  }
}
