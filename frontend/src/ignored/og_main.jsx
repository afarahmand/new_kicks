import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import NewApp from './NewApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NewApp />
  </StrictMode>,
)
