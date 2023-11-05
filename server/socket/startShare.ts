import { ACTIONS } from '@actions/index'
import { Server, Socket } from 'socket.io'

interface IData {
  trackId: string
  peerId: string
  sessionDescription: any
  type: 'offer' | 'answer'
}

export function startShare(socket: Socket, io: Server) {
  return (data: IData) => {
    const { peerId, trackId, sessionDescription, type } = data
    // итерируемся по массиву с пользователями комнаты
    io.to(peerId).emit(ACTIONS.START_SHARE_DESCTOP, {
      peerId: socket.id, // id текущего сокета
      trackId,
      sessionDescription,
      type,
    })
  }
}
