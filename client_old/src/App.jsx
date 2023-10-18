import { Route, Routes } from 'react-router'
import './App.css'
import { Main } from './components/Main/Main'
import { NotFoundPage } from './components/NotFoundPage/NotFoundPage'
import { Room } from './components/Room/Room'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/room/:id" element={<Room />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
