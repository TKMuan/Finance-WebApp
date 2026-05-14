import './App.css'
import { Theme } from "@radix-ui/themes"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { 
  Dashboard, 
  AuthPage, 
  TransactionPage,
  TransactionCreate,
  GroupingPage,
  GroupingCreate,
  MethodCreate,
  MethodsPage
} from './pages'
import { AuthProvider } from './context'

import { ProtectedRoutes } from './utils'

function App() {
  return (
    <Theme>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
              <Route path="/transactions" element={<TransactionPage />} />
              <Route path="/transactions/create" element={<TransactionCreate />} />
              <Route path="/grouping/create" element={<GroupingCreate />} />
              <Route path="/grouping" element={<GroupingPage />} />
              <Route path="/methods/create" element={<MethodCreate />} />
              <Route path="/methods" element={<MethodsPage />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/*" element={<Dashboard />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </Theme>
  )
}

export default App
