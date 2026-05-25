import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true, // typo fixed
});

// register
const register = async ({ email, username, password }) => {
    const response = await api.post("/api/auth/register", {
        email,
        username,
        password,
    });
    return response.data;
};

// login
const login = async ({ email, password }) => {
    const response = await api.post("/api/auth/login", {
        email,
        password,
    });
    return response.data;
};

// get current user
const getMe = async () => {
    const response = await api.get("/api/auth/get-me"); // changed to GET
    return response.data;
};

export { register, login, getMe };