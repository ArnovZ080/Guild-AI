import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AppV2 from './v2/AppV2.jsx'
import './index.css'

const urlParams = new URLSearchParams(window.location.search)
const useV2 = urlParams.get('v2') === '1'
const pathIsV2 = window.location.pathname.startsWith('/v2')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {useV2 || pathIsV2 ? <AppV2 /> : <App />}
  </StrictMode>,
)
