import { useNavigate, useParams } from 'react-router'
import { LOCAL_VIDEO, useWebRTC } from '../../hooks/useWebRTC'
import { classNames } from '@helpers/classNames'
import { UnMute } from '@components/icons/UnMute'
import { Camera } from '@components/icons/Camera'
import cls from './Room.module.scss'
import { Exit } from '@components/icons/Exit'
import { ChangeEvent, useState } from 'react'

export const Room = () => {
  // Получаем id комнаты
  const { id: roomId } = useParams()
  const [isShow, setIsShow] = useState(false)
  const [options, setOptions] = useState({
    video: true,
    audio: true,
  })
  const [name, setName] = useState('')
  const [error, setError] = useState<null | string>(null)

  // получаем список всех наших клиентов
  const {
    clients,
    provideMediaRef,
    toggleMic,
    toggleCamera,
    disableVideo,
    isMute,
  } = useWebRTC(roomId)
  const navigate = useNavigate()

  const changeMicStatus = () => {
    toggleMic(!isMute)
  }
  const changeCameraStatus = () => {
    toggleCamera(!disableVideo)
  }

  const joinHandler = () => {
    setError(null)
    if (!name.trim()) {
      return setError('Необходимо указать имя')
    }
    toggleCamera(options.video)
    toggleMic(options.audio)
    setIsShow(true)
  }
  return (
    <div className={cls.room}>
      {!isShow && (
        <div>
          <h2 className={cls.title}>присоединиться к видеовстрече</h2>
          <div className={cls.constrolBlock}>
            <button
              onClick={() =>
                setOptions((prev) => ({ ...prev, audio: !prev.audio }))
              }
              className={classNames(cls.btn, {}, [
                options.audio ? cls.disabled : cls.enabled,
              ])}>
              <UnMute />
            </button>
            <button
              onClick={() =>
                setOptions((prev) => ({ ...prev, video: !prev.video }))
              }
              className={classNames(cls.btn, {}, [
                options.video ? cls.disabled : cls.enabled,
              ])}>
              <Camera />
            </button>
          </div>
          <div className={cls.nameWrapper}>
            <p className={cls.subTitle}>Укажите свое имя</p>
            <input
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              className={classNames(cls.inputName, { [cls.error]: !!error })}
            />
            {error && <p className={cls.errorText}>{error}</p>}
            <button onClick={joinHandler} className={cls.joinBtn}>
              Присоединиться
            </button>
          </div>
        </div>
      )}
      {isShow && (
        <>
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
        </>
      )}
    </div>
  )
}
