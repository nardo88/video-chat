import { ACTIONS } from '@actions/index'
import { Server, Socket } from 'socket.io'

interface IData {
  peerId: string
  sessionDescription: {
    type: 'offer' | 'answer'
    sdp: any // мета данные peer-а
  }
}

// описываем логику когда на сервер передали SDP данные
export function relaySdp(socket: Socket, io: Server) {
  return (data: IData) => {
    const { peerId, sessionDescription } = data
    // еогда мы получили SDP данные, мы конкретному пользователю отправляем session description
    io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
      // от кого пришел SESSION_DESCRIPTION
      peerId: socket.id,
      // сам offer
      sessionDescription,
    })
  }
}
