import { useCallback, useEffect, useRef, useState } from 'react'

// напишем хук который будет работать как useState но дополнительно он будет принимать callback который после того как состояние было изменено, он будет запускать переданный ему callback
export const useStateWithCallback = (initialState: any) => {
  type IState = ReturnType<typeof initialState>
  type Func = (v?: IState) => void

  // функция принимает изначальное состояние
  const [state, setState] = useState(initialState)
  // ссылка где будем хранить callback
  const cbRef = useRef<Func | null>(null)
  // функция для изменения состояния принимает новое состояние и callback
  const updateState = useCallback((newState: IState, cb: Func) => {
    // calcback мы записываем в ref
    cbRef.current = cb
    // после чего изменяем состояние
    setState((prev: IState) =>
      typeof newState === 'function' ? newState(prev) : newState
    )
  }, [])

  useEffect(() => {
    // тут подписываемся на изменение состояния и если callback был передан, то мы его один раз вызываем и удаляем из ref
    if (cbRef.current) {
      cbRef.current(state)
      cbRef.current = null
    }
  }, [state])

  return [state, updateState]
}
/*
ПРИМЕР
const [state, setState] = useStateWithCallback(0)

setState(2, () => {
    console.log('состояние изменилось');
})

setState((prev) => prev++, () => {
    console.log('состояние изменилось');
})
*/
