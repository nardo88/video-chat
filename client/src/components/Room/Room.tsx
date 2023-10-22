import { useNavigate, useParams } from 'react-router'
import { LOCAL_VIDEO, useWebRTC } from '../../hooks/useWebRTC'
import { useState } from 'react'
import { classNames } from '@helpers/classNames'
import { UnMute } from '@components/icons/UnMute'
import { Camera } from '@components/icons/Camera'
import cls from './Room.module.scss'
import { Exit } from '@components/icons/Exit'

export const Room = () => {
  // Получаем id комнаты
  const { id: roomId } = useParams()
  const [isMute, setIsMute] = useState(false)
  const [disableVideo, setDisableVideo] = useState(false)
  // получаем список всех наших клиентов
  const { clients, provideMediaRef, toggleMic, toggleCamera } =
    useWebRTC(roomId)
  const navigate = useNavigate()

  const changeMicStatus = () => {
    toggleMic(!isMute)
    setIsMute(!isMute)
  }
  const changeCameraStatus = () => {
    setDisableVideo(!disableVideo)
    toggleCamera(!disableVideo)
  }
  return (
    <div className={cls.room}>
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
            isMute ? cls.disabled : cls.enabled,
          ])}>
          <UnMute />
        </button>
        <button
          onClick={changeCameraStatus}
          className={classNames(cls.btn, {}, [
            disableVideo ? cls.disabled : cls.enabled,
          ])}>
          <Camera />
        </button>
        <button
          className={classNames(cls.btn, {}, [cls.exitBtn])}
          onClick={() => navigate('/')}>
          <Exit />
        </button>
      </div>
    </div>
  )
}
