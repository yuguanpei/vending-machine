import HomePage from './components/HomePage'
import AdminPanel from './components/AdminPanel/AdminPanel'
import useAppStore from './stores/appStore'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const { isAdminPanelOpen } = useAppStore()

  return (
    <div className="App">
      <Toaster position="top-center" />
      {isAdminPanelOpen ? <AdminPanel /> : <HomePage />}
    </div>
  )
}

export default App
