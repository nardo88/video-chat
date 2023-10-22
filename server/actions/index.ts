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
  // отключение микрофона
  TOOGLE_MIC = 'toggle_mic',
  //принимаем статус микрофона
  SET_MIC_STATUS = 'set_mic_status',
  // отключение камеры
  TOOGLE_CAMERA = 'toggle_camera',
  //принимаем статус камеры
  SET_CAMERA_STATUS = 'set_camera_status',
}
