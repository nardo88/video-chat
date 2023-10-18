import { FC } from 'react'
import cls from './App.module.scss'

interface AppProps {
  className?: string
}

export const App: FC<AppProps> = () => {
  return <div className={cls.app}></div>
}
