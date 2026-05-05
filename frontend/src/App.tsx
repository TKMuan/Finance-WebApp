import './App.css'
import { Theme } from "@radix-ui/themes"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Dashboard } from './pages/Dashboard'

function App() {
  return (
    <Theme>
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </Theme>
  )
}

export default App
