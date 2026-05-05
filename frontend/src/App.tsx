import './App.css'
import { Theme } from "@radix-ui/themes"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { 
  Dashboard, 
  AuthPage, 
  TransactionPage,
  TransactionCreate
} from './pages'
import { AuthProvider } from './context/auth.context'
function App() {
  return (
    <Theme>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/transactions" element={<TransactionPage />} />
            <Route path="/transactions/create" element={<TransactionCreate />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </Theme>
  )
}

export default App
