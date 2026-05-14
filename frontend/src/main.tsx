import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@radix-ui/themes/styles.css'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider} from "@tanstack/react-query"

const query = new QueryClient()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={query}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
