import { ACTIONS } from '@actions/index'
import { Server, Socket } from 'socket.io'

interface IData {
  peerId: string
  iceCandidate: object
}

export const relayIceCandidate = (socket: Socket, io: Server) => {
  return (data: IData) => {
    const { peerId, iceCandidate } = data

    io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
      peerId: socket.id,
      iceCandidate,
    })
  }
}
