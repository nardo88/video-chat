export enum ACTIONS {
  // событие когда мы присоединились в комнату
  JOIN = 'join',
  // когда мы покинули комнату
  LEAVE = 'leave',
  // поделиться комнатами
  SHARE_ROOMS = 'share-rooms',
  // когда мы подключаем новый peer (новое соединение между клиентами)
  ADD_PEER = 'add-peer',
  // когда мы удаляем peer (соединение между клиентами)
  REMOVE_PEER = 'remove-peer',
  // когда мы будем передавать sdp данные (медиа стримы)
  RELAY_SDP = 'relay-sdp',
  // когда мы будем передавать ice кандидатов (физические подключения)
  RELAY_ICE = 'relay-ice',
  // реакция на появление кандидата
  ICE_CANDIDATE = 'ice-candidate',
  // когда нам придет новая сессия и нам надо будет ее у себя использовать
  SESSION_DESCRIPTION = 'session-description',
  // начинаем шаринг экрана
  START_SHARE_DESCTOP = 'start-share-desctop',
  STOP_SHARE_DESCTOP = 'stop-share-desctop',
}
