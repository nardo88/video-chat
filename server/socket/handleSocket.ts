import { ACTIONS } from '@actions/index'
import { Server, Socket } from 'socket.io'
import { joinSocket } from './joinSocket'
import { leaveRoom } from '@utils/leaveRoom'
import { relaySdp } from './relaSdp'
import { shareRoomsInfo } from '@utils/shareRoomsInfo'
import { relayIceCandidate } from './relayIceCandidate'

export function handleSocket(socket: Socket, io: Server) {
  // при подключении нового клиента обновляем всем список доступных комнат
  shareRoomsInfo(io)
  // вешаем слушатель на подключение нового пользователя
  socket.on(ACTIONS.JOIN, joinSocket(socket, io))
  // добавим логику выхода из комнаты
  socket.on(ACTIONS.LEAVE, leaveRoom(io, socket))
  socket.on('disconnecting', leaveRoom(io, socket))
  // когда на сервер передали SDP данные
  socket.on(ACTIONS.RELAY_SDP, relaySdp(socket, io))
  // обработаем событие когда поступил ICE кандидат
  socket.on(ACTIONS.RELAY_ICE, relayIceCandidate(socket, io))
}
