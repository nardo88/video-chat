import { useNavigate, useParams } from 'react-router'
import { LOCAL_VIDEO, useWebRTC } from '../../hooks/useWebRTC'
import './Room.css'

export const Room = () => {
  // Получаем id комнаты
  const { id: roomId } = useParams()
  // получаем список всех наших клиентов
  const { clients, provideMediaRef } = useWebRTC(roomId)
  const navigate = useNavigate()
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
      <div className="video__wrapper">
        {clients.map((clientId) => (
          <div key={clientId} className="video__item">
            <video
              className="video"
              ref={(instanse) => {
                provideMediaRef(clientId, instanse)
              }}
              autoPlay
              playsInline
              muted={clientId === LOCAL_VIDEO}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
