import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';


const Protected = ({children}) => {
    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    if(loading){
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-black text-neutral-500 font-mono text-xs uppercase tracking-widest select-none dot-matrix-bg">
                <div className="scanning-line"></div>
                <div className="z-10 animate-pulse">// AUTHORIZING_SESSION...</div>
            </div>
        )
    }
    if(!user){
        return <Navigate to='/login' replace/>
    }

  return children
}

export default Protected