import { useParams } from 'react-router'
import { useWebRTC } from '../../hooks/useWebRTC'

export const Room = () => {
  // Получаем id комнаты
  const { id: roomId } = useParams()

  useWebRTC(roomId)
  return <div>Room</div>
}
