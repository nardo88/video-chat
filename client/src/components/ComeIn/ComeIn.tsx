import { ChangeEvent, Dispatch, FC, SetStateAction, useState } from 'react'
import cls from './ComeIn.module.scss'
import { IOptions } from '@components/Room/Room'
import { classNames } from '@helpers/classNames'
import { UnMute } from '@components/icons/UnMute'
import { Camera } from '@components/icons/Camera'

interface ComeInProps {
  options: IOptions
  setOptions: Dispatch<SetStateAction<IOptions>>
  setIsShow: Dispatch<SetStateAction<boolean>>
}

export const ComeIn: FC<ComeInProps> = (props) => {
  const { options, setOptions, setIsShow } = props
  const [error, setError] = useState<null | string>(null)

  const joinHandler = () => {
    setError(null)
    if (!options.name.trim()) {
      return setError('Необходимо указать имя')
    }
    setIsShow(true)
  }
  return (
    <div>
      <h2 className={cls.title}>присоединиться к видеовстрече</h2>
      <div className={cls.constrolBlock}>
        <button
          onClick={() =>
            setOptions((prev) => ({ ...prev, audio: !prev.audio }))
          }
          className={classNames(cls.btn, {}, [
            options.audio ? cls.disabled : cls.enabled,
          ])}>
          <UnMute />
        </button>
        <button
          onClick={() =>
            setOptions((prev) => ({ ...prev, video: !prev.video }))
          }
          className={classNames(cls.btn, {}, [
            options.video ? cls.disabled : cls.enabled,
          ])}>
          <Camera />
        </button>
      </div>
      <div className={cls.nameWrapper}>
        <p className={cls.subTitle}>Укажите свое имя</p>
        <input
          value={options.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setOptions((prev) => ({ ...prev, name: e.target.value }))
          }
          className={classNames(cls.inputName, { [cls.error]: !!error })}
        />
        {error && <p className={cls.errorText}>{error}</p>}
        <button onClick={joinHandler} className={cls.joinBtn}>
          Присоединиться
        </button>
      </div>
    </div>
  )
}
