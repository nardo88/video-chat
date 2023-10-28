import { useParams } from 'react-router'
import { useState } from 'react'
import { ComeIn } from '@components/ComeIn/ComeIn'
import { VideoChat } from '@components/VideoChat/VideoChat'
import cls from './Room.module.scss'
import { IOptions } from '@hooks/useWebRTC'

export const Room = () => {
  // Получаем id комнаты
  const { id } = useParams()
  const [isShow, setIsShow] = useState(false)
  const [options, setOptions] = useState<IOptions>({
    video: true,
    audio: true,
    name: '',
  })

  return (
    <div className={cls.room}>
      {!isShow && (
        <ComeIn
          options={options}
          setOptions={setOptions}
          setIsShow={setIsShow}
        />
      )}
      {isShow && id && <VideoChat roomId={id} options={options} />}
    </div>
  )
}
