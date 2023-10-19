import { FC, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import socket from '@socket/index'
import { ACTIONS } from '@socket/events'
import { v4 } from 'uuid'
import cls from './Main.module.scss'

interface MainProps {
  className?: string
}

export const Main: FC<MainProps> = () => {
  // создадим состояние где будем хранить доступные комнаты
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<string[]>([])
  const rootNode = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // при входе на страницу мы будем подписываться
    socket.on(ACTIONS.SHARE_ROOMS, ({ rooms }) => {
      if (rootNode.current) setRooms(rooms)
    })
  }, [])
  return (
    <div ref={rootNode}>
      <h1>Доступные комнаты</h1>
      <ul className={cls.roomList}>
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
