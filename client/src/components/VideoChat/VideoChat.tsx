import { FC } from 'react'
import cls from './VideoChat.module.scss'
import { classNames } from '@helpers/classNames'
import { useWebRTC, LOCAL_VIDEO, IOptions } from '@hooks/useWebRTC'
import { useNavigate } from 'react-router'
import { UnMute } from '@components/icons/UnMute'
import { Camera } from '@components/icons/Camera'
import { Exit } from '@components/icons/Exit'

interface VideoChatProps {
  className?: string
  roomId: string
  options: IOptions
}

export const VideoChat: FC<VideoChatProps> = (props) => {
  const { className, roomId, options } = props
  // получаем список всех наших клиентов
  const {
    clients,
    provideMediaRef,
    toggleMic,
    toggleCamera,
    disableVideo,
    isMute,
  } = useWebRTC(roomId, options)
  const navigate = useNavigate()

  const changeMicStatus = () => {
    toggleMic(!isMute)
  }
  const changeCameraStatus = () => {
    toggleCamera(!disableVideo)
  }
  return (
    <div className={classNames(cls.VideoChat, {}, [className])}>
      <div className={cls.wrapper}>
        {clients.map((client) => (
          <div key={client.peerId} className={cls.video}>
            <p className={cls.videoInfo}>{client.name}</p>
            <video
              className="video"
              ref={(instanse) => provideMediaRef(client.peerId, instanse)}
              autoPlay
              playsInline
              muted={client.peerId === LOCAL_VIDEO}
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
