import { FC, useEffect, useRef } from 'react'
import cls from './VideoChat.module.scss'
import { classNames } from '@helpers/classNames'
import { useWebRTC, LOCAL_VIDEO, IOptions } from '@hooks/useWebRTC'
import { useNavigate } from 'react-router'
import { UnMute } from '@components/icons/UnMute'
import { Camera } from '@components/icons/Camera'
import { Exit } from '@components/icons/Exit'
import { Share } from '@components/icons/Share'

interface VideoChatProps {
  className?: string
  roomId: string
  options: IOptions
}

export const VideoChat: FC<VideoChatProps> = (props) => {
  const { className, roomId, options } = props
  const desctop = useRef<HTMLVideoElement>(null)
  // получаем список всех наших клиентов
  const {
    clients,
    provideMediaRef,
    toggleMic,
    toggleCamera,
    disableVideo,
    isMute,
    shareDesctop,
    desctopShare,
    stopSharing,
  } = useWebRTC(roomId, options)
  const navigate = useNavigate()

  const changeMicStatus = () => {
    toggleMic(!isMute)
  }
  const changeCameraStatus = () => {
    toggleCamera(!disableVideo)
  }

  useEffect(() => {
    if (desctop.current && desctopShare) {
      desctop.current.srcObject = new MediaStream([desctopShare.track])
    }
  }, [desctopShare])
  return (
    <div className={classNames(cls.VideoChat, {}, [className])}>
      <div className={cls.content}>
        <div className={cls.userListWrapper}>
          <ul className={cls.userList}>
            {clients.map((user) => (
              <li key={user.peerId} className={cls.userItem}>
                <span
                  className={classNames(cls.userName, {
                    [cls.local]: user.peerId === 'LOCAL_VIDEO',
                  })}>
                  {user.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className={cls.shareSection}>
          {desctopShare && (
            <div className={cls.desctop}>
              <video
                className="video"
                ref={desctop}
                autoPlay
                playsInline
                muted={true}
              />
            </div>
          )}
          {!desctopShare && (
            <div className={cls.emptyDesctop}>
              {clients.find((u) => u.peerId === 'LOCAL_VIDEO')?.name || ''}
            </div>
          )}
        </div>
        <div className={cls.cameraListWapper}>
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
        {!desctopShare ? (
          <button
            onClick={shareDesctop}
            className={classNames(cls.btn, {}, [cls.shareBtn])}>
            <Share />
          </button>
        ) : desctopShare.peerId === 'LOCAL_VIDEO' ? (
          <button
            onClick={stopSharing}
            className={classNames(cls.btn, {}, [cls.shareBtn])}>
            stop
          </button>
        ) : null}
      </div>
    </div>
  )
}
