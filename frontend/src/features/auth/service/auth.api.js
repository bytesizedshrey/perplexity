import axios from "axios";

const api = axios.create({
    baseURL : "http://localhost:3000",
    withCredentails : true,
})

const async function register({email,username,password}){
    const response = await api.post("/api/auth/register",{email,username,password})
    return response.data
}
const async function login({email,password}){
    const response = await api.post("/api/auth/login",{email,password})
    return response.data
}
const async function getMe(){
    const response = await api.post("/api/auth/get-me")
    return response.data
}