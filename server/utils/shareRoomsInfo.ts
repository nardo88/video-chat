import { ACTIONS } from '@actions/index'
import { Server } from 'socket.io'
import { getClientRooms } from './getClientRooms'

export function shareRoomsInfo(io: Server) {
  io.emit(ACTIONS.SHARE_ROOMS, {
    rooms: getClientRooms(io),
  })
}
