import { ACTIONS } from '@actions/index'
import { Server, Socket } from 'socket.io'

interface ICongig {
  isMute: boolean
  roomId: string
}

export function toggleMic(socket: Socket, io: Server) {
  return (config: ICongig) => {
    const { isMute, roomId } = config
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
    clients.forEach((clientId) => {
      io.to(clientId).emit(ACTIONS.SET_MIC_STATUS, {
        peerId: socket.id, // id текущего сокета
        isMute, // создание offer не нужно
      })
    })
  }
}
