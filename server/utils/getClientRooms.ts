import { Server } from 'socket.io'
import { validate, version } from 'uuid'

// функция, которая будет возвращать комнаты
export function getClientRooms(io: Server) {
  // из самого сокета получаем список комнат
  // rooms имеет структуру map
  const { rooms } = io.sockets.adapter

  // возвращаем массив с ключами коллекции map. Тут что бы исключить комнаты который создаем сам сокетio мы отфильтруем комнаты, id которых были созданы с помощью библиотеки uuid v4
  return Array.from(rooms.keys()).filter(
    (roomId) => validate(roomId) && version(roomId) === 4
  )
}
