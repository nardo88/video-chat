import { ACTIONS } from '@actions/index'
import { Server, Socket } from 'socket.io'
import { joinSocket } from './joinSocket'
import { leaveRoom } from '@utils/leaveRoom'

export function handleSocket(socket: Socket, io: Server) {
  // вешаем слушатель на подключение нового пользователя
  socket.on(ACTIONS.JOIN, joinSocket(socket, io))
  // добавим логику выхода из комнаты
  socket.on(ACTIONS.LEAVE, leaveRoom(io, socket))
  socket.on('disconnecting', leaveRoom(io, socket))
}
