import { FC } from 'react'
import { Route, Routes } from 'react-router'
import { Main } from '@components/Main/Main'
import { Room } from '@components/Room/Room'
import { NotFoundPage } from '@components/NotFoundPage/NotFoundPage'
import './App.module.scss'

interface AppProps {
  className?: string
}

export const App: FC<AppProps> = () => {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/room/:id" element={<Room />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
