import { useEffect, useState } from 'react'
import socket from '../../socket'
import { socketEvents } from '../../socket/events'
import { useNavigate } from 'react-router-dom'
import { v4 } from 'uuid'

export const Main = () => {
  // создадим состояние где будем хранить доступные комнаты
  const [rooms, setRooms] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // при входе на страницу мы будем подписываться
    socket.on(socketEvents.SHARE_ROOMS, ({ rooms }) => {
      setRooms(rooms)
    })
  }, [])
  return (
    <div>
      <h1>Доступные комнаты</h1>
      <ul>
        {rooms.map((roomId) => (
          <li key={roomId}>
            {roomId}{' '}
            <button onClick={() => navigate(`/room/${roomId}`)}>
              Войти в комнату
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate(`/room/${v4()}`)}>Создать комнату</button>
    </div>
  )
}
