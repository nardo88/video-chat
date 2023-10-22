import { useNavigate, useParams } from 'react-router'
import { LOCAL_VIDEO, useWebRTC } from '../../hooks/useWebRTC'
import cls from './Room.module.scss'
import { useState } from 'react'
import { Muted } from '@components/icons/Muted'
import { classNames } from '@helpers/classNames'
import { UnMute } from '@components/icons/UnMute'

export const Room = () => {
  // Получаем id комнаты
  const { id: roomId } = useParams()
  const [isMute, setIsMute] = useState(false)
  // получаем список всех наших клиентов
  const { clients, provideMediaRef, toggleMic } = useWebRTC(roomId)
  const navigate = useNavigate()

  const changeMicStatus = () => {
    toggleMic(!isMute)
    setIsMute(!isMute)
  }
  return (
    <div>
      <button style={{ marginBottom: '30px' }} onClick={() => navigate('/')}>
        Leave
      </button>
      <ul>
        {clients.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div className={cls.wrapper}>
        {clients.map((clientId) => (
          <div key={clientId} className={cls.video}>
            <p className={cls.videoInfo}>{clientId}</p>
            <video
              className="video"
              ref={(instanse) => provideMediaRef(clientId, instanse)}
              autoPlay
              playsInline
              muted={clientId === LOCAL_VIDEO}
            />
          </div>
        ))}
      </div>
      <div className={cls.constrolBlock}>
        <button
          onClick={changeMicStatus}
          className={classNames(cls.btn, {}, [
            isMute ? cls.mute : cls.unmutes,
          ])}>
          {isMute ? <Muted /> : <UnMute />}
        </button>
      </div>
    </div>
  )
}
