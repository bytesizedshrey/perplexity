import { useDispatch } from "react-redux";
import { register, login, getMe } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";

export function useAuth() {
    const dispatch = useDispatch(); // fixed

    async function handleRegister({ fullname, email, username, password }) {
        try {
            dispatch(setLoading(true));

            const data = await register({
                fullname,
                email,
                username,
                password,
            });

            dispatch(setUser(data.user));
        } catch (error) {
            dispatch(
                setError(
                    error.response?.data?.message ||
                    "Registration Failed"
                )
            );
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true));

            const data = await login({
                email,
                password,
            });

            dispatch(setUser(data.user));
        } catch (error) {
            dispatch(
                setError(
                    error.response?.data?.message ||
                    "Login Failed"
                )
            );
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true));

            const data = await getMe();

            dispatch(setUser(data.user));
        } catch (error) { // fixed err -> error
            dispatch(
                setError(
                    error.response?.data?.message ||
                    "Fetch Data Failed"
                )
            );
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
    };
}