const socketEvents = {
  JOIN: 'join', // событие когда мы присоединились в комнату
  LEAVE: 'leave', // когда мы покинули комнату
  SHARE_ROOMS: 'share-rooms', // поделиться комнатами
  ADD_PEER: 'add-peer', // когда мы подключаем новый peer (новое соединение между клиентами)
  REMOVE_PEER: 'remove-peer', // когда мы удаляем peer (соединение между клиентами)
  RELAY_SDP: 'relay-sdp', // когда мы будем передавать sdp данные (медиа стримы)
  RELAY_ICE: 'relay-ice', // когда мы будем передавать ice кандидатов (физические подключения)
  ICE_CANDIDATE: 'ise-candidate', // реакция на появление кандидата
  SESSION_DESCRIPTION: 'session-description', // когда нам придет новая сессия и нам надо будет ее у себя использовать
}
module.exports = socketEvents
