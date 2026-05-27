import { useDispatch } from "react-redux";
import { sendMessage } from "../service/chat.api.js";
import { initializeSocketConnection } from "../service/chat.socket.js";
import { addNewMessage, setChats, setCurrentChatId, setError, setLoading, createNewChat } from "../chat.slice.js";



export const useChat = () => {
    const dispatch = useDispatch()

    async function handleSendMessage({message, chatId}){
        try {
            dispatch(setLoading(true))
            const data = await sendMessage({message,chatId})
            const {chat,aiMessage} = data

            dispatch(createNewChat({
                chatId : chat._id,
                title : chat.title,
            }))
            
            dispatch(addNewMessage({
                chatId : chat._id,
                content : message,
                role : 'user',
            }))
            dispatch(setCurrentChatId(chat._id))
            dispatch(setLoading(false))
        } catch (error) {
            console.error("Error sending message:", error)
            dispatch(setError(true))
            dispatch(setLoading(false))
        }
    }

    return {
        initializeSocketConnection,
        handleSendMessage
    };
};