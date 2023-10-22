import { useCallback, useEffect, useRef } from 'react'
// @ts-ignore
import freeice from 'freeice'
import { useStateWithCallback } from './useStateWithCallback'
import { ACTIONS } from '@socket/events'
import socket from '@socket/index'

export const LOCAL_VIDEO = 'LOCAL_VIDEO'

export function useWebRTC(roomId?: string): {
  clients: string[]
  provideMediaRef: (id: string, node: HTMLVideoElement | null) => void
  toggleMic: (isMuted: boolean) => void
  toggleCamera: (isMuted: boolean) => void
} {
  // вписок всех клиентов
  const [clients, setClients] = useStateWithCallback([])

  // тут мы проверяем, если в списке клиентом нового клиента еще нет, то мы его добавляем в список
  const addNewClient = useCallback(
    (newClient: string, cb: () => void) => {
      setClients((list: string[]) => {
        if (!list.includes(newClient)) {
          return [...list, newClient]
        }
        return list
      }, cb)
    },
    [setClients]
  )

  // место где будем хранить все peerConnection
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({})
  // ссылка на медиастрим текущего пользователя (тот кто открыл браузер)
  const localMediaStreem = useRef<null | MediaStream>(null)
  // ссылки на все peer medial элементы (т.е. видео элементы (тег video) других пользователей)
  const peerMediaElements = useRef<Record<string, HTMLVideoElement | null>>({
    [LOCAL_VIDEO]: null,
  })

  // функция выключения микрофона
  const toggleMic = (isMute: boolean) => {
    socket.emit(ACTIONS.TOOGLE_MIC, { isMute, roomId })
  }
  const toggleCamera = (disableVideo: boolean) => {
    localMediaStreem.current!.getVideoTracks()[0]!.enabled = !disableVideo
    socket.emit(ACTIONS.TOOGLE_CAMERA, { disableVideo, roomId })
  }

  useEffect(() => {
    const setMicStatus = (options: { peerId: string; isMute: boolean }) => {
      const { isMute, peerId } = options
      if (peerMediaElements.current[peerId]) {
        const mediaStreem = peerMediaElements.current[peerId]
          ?.srcObject as MediaStream
        const audioTrack = mediaStreem!.getAudioTracks()[0]
        audioTrack.enabled = !isMute
      }
    }

    // слушаем событие которое генерирует сервер
    socket.on(ACTIONS.SET_MIC_STATUS, setMicStatus)

    return () => {
      socket.off(ACTIONS.SET_MIC_STATUS)
    }
  }, [])

  useEffect(() => {
    const setCameraStatus = (options: {
      peerId: string
      disableVideo: boolean
    }) => {
      const { disableVideo, peerId } = options
      if (peerMediaElements.current[peerId]) {
        const mediaStreem = peerMediaElements.current[peerId]
          ?.srcObject as MediaStream
        const audioTrack = mediaStreem!.getVideoTracks()[0]
        audioTrack.enabled = !disableVideo
      }
    }

    // слушаем событие которое генерирует сервер
    socket.on(ACTIONS.SET_CAMERA_STATUS, setCameraStatus)

    return () => {
      socket.off(ACTIONS.SET_CAMERA_STATUS)
    }
  }, [])

  // логика добавления нового пира
  useEffect(() => {
    // Функция добавления нового пира (клиента с настройками)
    async function handleNewPeer({
      peerId,
      createOffer,
    }: {
      peerId: string
      createOffer: any
    }) {
      // если мы уже подключены к пиру то ничего не делаем
      if (peerId in peerConnections.current) {
        return console.warn('already connected to peerId' + ' ' + peerId)
      }
      // в противном случае создаем peerConnection
      peerConnections.current[peerId] = new RTCPeerConnection({
        // передаем iceServers - который вернет мета данные пользователя
        // freeice - предоставляет адреса STUN серверов
        iceServers: freeice(),
      })
      // создаем слушатель на событие onicecandidate
      peerConnections.current[peerId].onicecandidate = (event) => {
        // если кандидат есть, то нам надо поделиться им со всеми
        if (event.candidate) {
          socket.emit(ACTIONS.RELAY_ICE, {
            peerId,
            iceCandidate: event.candidate,
          })
        }
      }

      // нам должны приходить два трека в медиа потоке (аудио и видео) мы будет отображать только тех у кого именно две дорожки
      let tracksNumber = 0
      // подписываем на событие которое срабатывает когда нам приходит новый трек (стримы)
      peerConnections.current[peerId].ontrack = ({
        streams: [remoteStream],
      }) => {
        tracksNumber++
        // только в случае если количество треков равно 2 только тогда мы добавляем клиента
        if (tracksNumber === 2) {
          // добавляем в состояние нового клиента
          tracksNumber = 0
          addNewClient(peerId, () => {
            peerMediaElements.current[peerId]!.srcObject = remoteStream
          })
        } else {
          // FIX LONG RENDER IN CASE OF MANY CLIENTS
          let settled = false
          const interval = setInterval(() => {
            if (peerMediaElements.current[peerId]) {
              peerMediaElements.current[peerId]!.srcObject = remoteStream
              settled = true
            }

            if (settled) {
              clearInterval(interval)
            }
          }, 1000)
        }
      }

      // теперь надо добавить наш медиастрим к нашему экземпляру peer соединения
      if (localMediaStreem.current) {
        localMediaStreem.current.getTracks().forEach((track) => {
          if (localMediaStreem.current) {
            peerConnections.current[peerId].addTrack(
              track,
              localMediaStreem.current
            )
          }
        })
      }
      // если надо создать offer
      if (createOffer) {
        // создаем offer
        const offer = await peerConnections.current[peerId].createOffer()
        // устанавливаем его в localDescription
        await peerConnections.current[peerId].setLocalDescription(offer)
        // отправляем SDP данные сокету
        socket.emit(ACTIONS.RELAY_SDP, {
          peerId,
          sessionDescription: offer,
        })
      }
    }
    // слушаем событие которое генерирует сервер
    socket.on(ACTIONS.ADD_PEER, handleNewPeer)

    return () => {
      socket.off(ACTIONS.ADD_PEER)
    }
  }, [])

  // добавим слушатели на получени session_description (offer)
  useEffect(() => {
    // функция которая принимает sessionDescription (для получения чужого видео потока)
    async function setRemoteVideo({
      peerId,
      sessionDescription: remoteDescription,
    }: {
      peerId: string
      sessionDescription: any
    }) {
      // записивываем в setRemoteDescription но через конструктор (для кроссбраузерности)
      await peerConnections.current[peerId]?.setRemoteDescription(
        new RTCSessionDescription(remoteDescription)
      )

      // если это offer то нам надо создать ответ (answer)
      if (remoteDescription.type === 'offer') {
        const answer = await peerConnections.current[peerId].createAnswer()
        // и устанавливаем ответ как localDescription
        peerConnections.current[peerId].setLocalDescription(answer)
        // и отправляем его в сокет
        socket.emit(ACTIONS.RELAY_SDP, {
          peerId,
          sessionDescription: answer,
        })
      }
    }

    socket.on(ACTIONS.SESSION_DESCRIPTION, setRemoteVideo)

    return () => {
      socket.off(ACTIONS.SESSION_DESCRIPTION)
    }
  }, [])

  // опишем логику получения нового ICE кандидата
  useEffect(() => {
    socket.on(ACTIONS.ICE_CANDIDATE, ({ peerId, iceCandidate }) => {
      peerConnections.current[peerId].addIceCandidate(
        new RTCIceCandidate(iceCandidate)
      )
    })

    return () => {
      socket.off(ACTIONS.ICE_CANDIDATE)
    }
  }, [])

  // опишем логику когда клиент покинул комнату
  useEffect(() => {
    const handleRemovePeer = ({ peerId }: { peerId: string }) => {
      if (peerConnections.current[peerId]) {
        peerConnections.current[peerId].close()
      }
      delete peerConnections.current[peerId]
      delete peerMediaElements.current[peerId]

      setClients((prev: string[]) => prev.filter((c) => c !== peerId))
    }
    socket.on(ACTIONS.REMOVE_PEER, handleRemovePeer)

    return () => {
      socket.off(ACTIONS.REMOVE_PEER)
    }
  }, [])

  // логика установки webRTC соединения
  useEffect(() => {
    async function startCapture() {
      // записываем в ref ссылку на видеопоток от веб камеры + микрофон
      localMediaStreem.current = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
        },
        audio: true,
      })
      // после того как мы захватили видеопоток, нам надо добавить пользователя
      addNewClient(LOCAL_VIDEO, () => {
        const localVideoElement = peerMediaElements.current[LOCAL_VIDEO]
        // если видео тег нашего медиапотока есть, то мы должны:
        if (localVideoElement) {
          // отключить у себя звук, что бы мы не слышали сами себя
          localVideoElement.volume = 0
          // передать медиастрим в качестве src
          localVideoElement.srcObject = localMediaStreem.current
        }
      })
    }

    startCapture()
      .then(() => {
        if (roomId) socket.emit(ACTIONS.JOIN, { room: roomId })
      })
      .catch((e) => {
        console.error('Error to get UserMedia', e)
      })

    // логика выхода из комнаты
    return () => {
      // останваливаем захват медиа
      if (localMediaStreem.current)
        localMediaStreem.current.getTracks().forEach((track) => track.stop())
      socket.emit(ACTIONS.LEAVE)
    }
  }, [roomId, addNewClient])

  // функция которая добавляет медиа элемент в perrMediaElements
  // clientId - id клиента
  // instanse - node element (тег video)
  const provideMediaRef = useCallback(
    (id: string, node: HTMLVideoElement | null) => {
      if (node) {
        peerMediaElements.current[id] = node
      }
    },
    []
  )

  // экспортируем наших клиентов
  return { clients, provideMediaRef, toggleMic, toggleCamera }
}
