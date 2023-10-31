import { ACTIONS } from '@actions/index'
import { Server, Socket } from 'socket.io'

interface IData {
  peerId: string
  sessionDescription: {
    type: 'offer' | 'answer'
    sdp: any // мета данные peer-а
  }
  name: string
}

// описываем логику когда на сервер передали SDP данные
export function relaySdp(socket: Socket, io: Server) {
  return (data: IData) => {
    const { peerId, sessionDescription, name } = data
    // когда мы получили SDP данные, мы конкретному пользователю отправляем session description
    io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
      // от кого пришел SESSION_DESCRIPTION
      peerId: socket.id,
      // сам offer
      sessionDescription,
      // имя пользователя
      name,
    })
  }
}
