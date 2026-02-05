import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Calculator from './pages/Calculator.tsx'
import SavedLoans from './pages/SavedLoans.tsx'
import { Toaster } from './components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Calculator />} />
        <Route path="/loan/:id" element={<Calculator />} />
        <Route path="/saved" element={<SavedLoans />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </StrictMode>,
)
