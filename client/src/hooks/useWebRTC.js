import { useEffect, useRef } from "react";
import { useStateWithCallback } from "./useStateWithCallback";

export function useWebRTC(roomId){
    // вписок всех клиентов
    const [clients, setClients] = useStateWithCallback([])
    // место где будем хранить все peerConnection
    const peerConnections = useRef({})
    // ссылка на медиастрим текущего пользователя (тот кто открыл браузер)
    const localMediaStreem = useRef(null)
    // ссылки на все peer medial элементы (т.е. видео элементы других пользователей)
    const perrMediaElements = useRef({})

    // логика установки webRTC соединения
    useEffect(() => {
        // 37:45
    }, [roomId])
}