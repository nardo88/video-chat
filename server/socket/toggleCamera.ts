toggleCamera

import { ACTIONS } from '@actions/index'
import { Server, Socket } from 'socket.io'

interface ICongig {
  disableVideo: boolean
  roomId: string
}

export function toggleCamera(socket: Socket, io: Server) {
  return (config: ICongig) => {
    const { disableVideo, roomId } = config
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
    clients.forEach((clientId) => {
      io.to(clientId).emit(ACTIONS.SET_CAMERA_STATUS, {
        peerId: socket.id, // id текущего сокета
        disableVideo, // создание offer не нужно
      })
    })
  }
}
