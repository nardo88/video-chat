import { useCallback, useEffect, useRef, useState } from 'react'
// @ts-ignore
import freeice from 'freeice'
import { useStateWithCallback } from './useStateWithCallback'
import { ACTIONS } from '@socket/events'
import socket from '@socket/index'

export const LOCAL_VIDEO = 'LOCAL_VIDEO'

export interface IOptions {
  video: boolean
  audio: boolean
  name: string
}

export interface IClient {
  peerId: string
  name: string
}

interface IDesctopShare {
  track: MediaStreamTrack
  trackId: string
  peerId: string
}

export function useWebRTC(
  roomId: string,
  options: IOptions
): {
  clients: IClient[]
  provideMediaRef: (id: string, node: HTMLVideoElement | null) => void
  toggleMic: (val: boolean) => void
  toggleCamera: (val: boolean) => void
  shareDesctop: () => void
  stopSharing: () => void
  isMute: boolean
  disableVideo: boolean
  desctopShare: null | IDesctopShare
} {
  // вписок всех клиентов
  const [clients, setClients] = useStateWithCallback([])
  const [isMute, setIsMute] = useStateWithCallback(options?.audio || false)
  const [disableVideo, setDisableVideo] = useStateWithCallback(
    options?.video || false
  )
  // состояние для потока демонстрации рабочего стола
  const [desctopShare, setDesctopShare] = useState<null | IDesctopShare>(null)

  // тут мы проверяем, если в списке клиентом нового клиента еще нет, то мы его добавляем в список
  const addNewClient = useCallback(
    (client: IClient, cb: () => void) => {
      const { peerId } = client

      setClients((list: IClient[]) => {
        if (!list.find((c) => c.peerId === peerId)) {
          return [...list, client]
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
  const toggleMic = (val: boolean) => {
    setIsMute(val, () => {
      localMediaStreem.current!.getAudioTracks()[0].enabled = isMute
    })
  }
  // функция отключения камеры
  const toggleCamera = (val: boolean) => {
    setDisableVideo(val, () => {
      localMediaStreem.current!.getVideoTracks()[0]!.enabled = disableVideo
    })
  }
  // функция демонстрации экрана
  const shareDesctop = () => {
    if (localMediaStreem.current) {
      navigator.mediaDevices.getDisplayMedia().then(async (data) => {
        const track = data.getTracks()[0]
        localMediaStreem.current!.addTrack(track)

        for (const peer in peerConnections.current) {
          peerConnections.current[peer].addTrack(
            track,
            localMediaStreem!.current as MediaStream
          )

          const offer = await peerConnections.current[peer].createOffer()
          peerConnections.current[peer]!.setLocalDescription(offer)
          socket.emit(ACTIONS.START_SHARE_DESCTOP, {
            peerId: peer,
            trackId: track.id,
            sessionDescription: offer,
            type: 'offer',
          })
        }

        setDesctopShare({
          track,
          trackId: track.id,
          peerId: LOCAL_VIDEO,
        })

        track.onended = async () => {
          const track = localMediaStreem.current!.getTracks()[2]
          localMediaStreem.current?.removeTrack(track)

          for (const peer in peerConnections.current) {
            const offer = await peerConnections.current[peer].createOffer()
            peerConnections.current[peer]!.setLocalDescription(offer)
            socket.emit(ACTIONS.STOP_SHARE_DESCTOP, {
              peerId: peer,
              sessionDescription: offer,
              type: 'offer',
            })
          }
          setDesctopShare(null)
        }
      })
    }
  }

  const stopSharing = async () => {
    if (desctopShare) {
      desctopShare.track.stop()
      const track = localMediaStreem
        .current!.getTracks()
        .find((i) => i.id === desctopShare.trackId) as MediaStreamTrack
      localMediaStreem.current?.removeTrack(track)

      for (const peer in peerConnections.current) {
        const offer = await peerConnections.current[peer].createOffer()
        peerConnections.current[peer]!.setLocalDescription(offer)
        socket.emit(ACTIONS.STOP_SHARE_DESCTOP, {
          peerId: peer,
          sessionDescription: offer,
          type: 'offer',
        })
      }

      setDesctopShare(null)
    }
  }
  async function startShare({
    peerId,
    trackId,
    sessionDescription,
    type,
  }: {
    peerId: string
    trackId: string
    sessionDescription: any
    type: 'offer' | 'answer'
  }) {
    peerConnections.current[peerId]!.setRemoteDescription(sessionDescription)

    if (type === 'offer') {
      const answer = await peerConnections.current[peerId].createAnswer()
      peerConnections.current[peerId].setLocalDescription(answer)
      socket.emit(ACTIONS.START_SHARE_DESCTOP, {
        peerId,
        trackId,
        sessionDescription: answer,
        type: 'answer',
      })

      if (peerMediaElements!.current[peerId]) {
        const media = peerMediaElements!.current[peerId]
          ?.srcObject as MediaStream

        setDesctopShare({
          peerId,
          track: media.getTracks().pop() as MediaStreamTrack,
          trackId,
        })
      }
    }
  }
  useEffect(() => {
    socket.on(ACTIONS.START_SHARE_DESCTOP, startShare)
  }, [])

  async function stopShare({
    peerId,
    sessionDescription,
    type,
  }: {
    peerId: string
    sessionDescription: any
    type: 'offer' | 'answer'
  }) {
    peerConnections.current[peerId]!.setRemoteDescription(sessionDescription)
    setDesctopShare(null)
    if (type === 'offer') {
      const answer = await peerConnections.current[peerId].createAnswer()
      peerConnections.current[peerId].setLocalDescription(answer)
      socket.emit(ACTIONS.STOP_SHARE_DESCTOP, {
        peerId,
        sessionDescription: answer,
        type: 'answer',
      })
    }
  }
  useEffect(() => {
    socket.on(ACTIONS.STOP_SHARE_DESCTOP, stopShare)
  }, [])

  // Функция добавления нового пира (клиента с настройками)
  async function handleNewPeer({
    peerId,
    createOffer,
    name,
  }: {
    peerId: string
    name: string
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
    peerConnections.current[peerId].ontrack = ({ streams }) => {
      const [remoteStream] = streams

      tracksNumber++
      // только в случае если количество треков равно 2 только тогда мы добавляем клиента
      if (tracksNumber === 2) {
        // добавляем в состояние нового клиента
        remoteStream.getVideoTracks()[0].enabled = disableVideo
        remoteStream.getAudioTracks()[0].enabled = isMute
        tracksNumber = 0

        addNewClient({ peerId, name: name || 'Неивестный бобер' }, () => {
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
        name: options.name,
      })
    }
  }
  // логика добавления нового пира
  useEffect(() => {
    // слушаем событие которое генерирует сервер
    socket.on(ACTIONS.ADD_PEER, handleNewPeer)

    return () => {
      socket.off(ACTIONS.ADD_PEER)
    }
  }, [])

  // функция которая принимает sessionDescription (для получения чужого видео потока)
  async function setRemoteVideo({
    peerId,
    sessionDescription: remoteDescription,
    name,
  }: {
    peerId: string
    sessionDescription: any
    name: string
  }) {
    // записивываем в setRemoteDescription но через конструктор (для кроссбраузерности)
    await peerConnections.current[peerId]?.setRemoteDescription(
      new RTCSessionDescription(remoteDescription)
    )

    setClients((prev: IClient[]) =>
      prev.map((client) =>
        client.peerId === peerId ? { ...client, name } : client
      )
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
        name: options.name,
      })
    }
  }

  // добавим слушатели на получени session_description (offer)
  useEffect(() => {
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

      setClients((prev: IClient[]) => prev.filter((c) => c.peerId !== peerId))
    }
    socket.on(ACTIONS.REMOVE_PEER, handleRemovePeer)

    return () => {
      socket.off(ACTIONS.REMOVE_PEER)
    }
  }, [])
  async function startCapture() {
    // записываем в ref ссылку на видеопоток от веб камеры + микрофон
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 640,
        height: 480,
      },
      audio: true,
    })

    mediaStream.getAudioTracks()[0].enabled = !isMute
    mediaStream.getVideoTracks()[0].enabled = !disableVideo

    localMediaStreem.current = mediaStream
    // после того как мы захватили видеопоток, нам надо добавить пользователя
    addNewClient({ peerId: LOCAL_VIDEO, name: options.name }, () => {
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

  // логика установки webRTC соединения
  useEffect(() => {
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
  return {
    clients,
    provideMediaRef,
    toggleMic,
    toggleCamera,
    isMute,
    disableVideo,
    shareDesctop,
    desctopShare,
    stopSharing,
  }
}
