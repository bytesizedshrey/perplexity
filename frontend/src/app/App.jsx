import { useEffect } from 'react'
import {RouterProvider} from 'react-router'
import { router } from './app.routes'
import { useAuth } from '../features/auth/hook/useAuth';



const App = () => {
  const { handleGetMe } = useAuth()
  useEffect(()=>{
    handleGetMe()
  }, [handleGetMe])
  return (
    <div>
      <RouterProvider router={router}/>
    </div>
  )
}

export default App