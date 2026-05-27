import { createSlice, current } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name : "chat",
    initialState: {
        chats : [],
        currentChatId : null,
        isLoading : false,
        error : false
    },
    reducers:{
        createNewChat: (state,action)=>{
            const {chatId,title} = action.payload;
            state.chats.push({
                id: chatId,
                title,
                messages: [],
                lastUpdated: new Date().toISOString(),
              });
            // state.currentChatId = chatId
        },
        addNewMessage : (state,action)=> {
            const {chatId,content,role} = action.payload
            state.chats[chatId].messages.push({content,role})
        },

        setChats : (state,action)=>{
            state.chats = action.payload
        },
        setCurrentChatId : (state,action) => {
            state.currentChatId = action.payload
        },
        setLoading : (state,action) => {
            state.isLoading = action.payload
        },
        setError : (state,action) => {
            state.error = action.payload
        }
    }
})
export const {setChats,setCurrentChatId,setLoading,setError,createNewChat,addNewMessage} = chatSlice.actions
export default chatSlice.reducer

/**
 * chats = {
    "Docker and AWS" : {
        messages : [
            {
                role : "user",
                content : "What is Docker?"
            },{
                role : "ai",
                content : "Docker is a platform for developers..."
            }
        ],
        id : "Docker and AWS",
        lastUpdated : "2026-05-26T11:37:38.507+00:00"

    }
}
 */
