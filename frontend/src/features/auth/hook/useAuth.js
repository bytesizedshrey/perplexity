import {useDispatch, useDispatch} from 'react-redux'
import {register,login,getMe} from '../service/auth.api'
import {setUser,setLoading,setError} from '../auth.slice'

export function useAuth(){
    const useDispatch = useDispatch()

    async function handleRegister({email,name,password}) {
        try{
            dispatch(setLoading(true))
            const data = await register ({email,username,password})
        } catch(error){
            dispatch(setError(error.response?.data?.message || 'Registration Failed'))
        } finally{
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({email,password}) {
        try{
            dispatch(setLoading(true))
            const data = await login ({email,password})
            dispatch(setUser(data.user))
        } catch(error){
            dispatch(setError(error.response?.data?.message || 'Login Failed'))
        } finally{
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try{
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch(err){
            dispatch(setError(error.response?.data?.message || 'Fetch Data Failed'))
        } finally {
            dispatch(setLoading(false))
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe
    }
}