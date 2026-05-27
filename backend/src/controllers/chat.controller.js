import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import {
  generateResponse,
  generateChatTitle,
} from "../services/ai.service.js";

export async function sendMessage(req, res) {
  try {
    const { message, chat: chatId } = req.body;

    let title = null;
    let chat = null;

    // Create new chat if no chatId
    if (!chatId) {
      title = await generateChatTitle(message);

      chat = await chatModel.create({
        user: req.user.id,
        title,
      });
    } else {
      // Existing chat
      chat = await chatModel.findById(chatId);

      if (!chat) {
        return res.status(404).json({
          message: "Chat not found",
        });
      }
    }

    // Get previous messages
    const messages = await messageModel.find({
      chat: chat._id || chatId
    });

    console.log(messages)

    // Generate AI response
    const result = await generateResponse(message, messages);

    // Save user message
    const userMessage = await messageModel.create({
      chat: chat._id || chatId,
      content: message,
      sender: "user",
    });

    // Save AI message
    const aiMessage = await messageModel.create({
      chat: chat._id,
      content: result.content,
      sender: "ai", // use this if schema enum = ["user", "assistant"]
    });

    return res.status(201).json({
      success: true,
      aiMessage: result.content,
      searchData: result.searchData,
      title: chat.title,
      chat,
      userMessage,
      aiMessageDoc: aiMessage,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function getChats(req , res) {
    const user = req.user

    const chats = await chatModel.find({user : user.id})

    res.status(200).json({
        message : 'chats retrieved successfully.',chats
    })
}

export async function getMessages(req,res) {
    const {chatId} = req.params

    const chat = await chatModel.findOne({
        _id: chatId,
        user : req.user.id
    })

    if(!chat){
        return res.status(404).json({
            message : 'chat not found'
        })
    }
    const messages = await messageModel.find({chat : chatId})

    res.status(200).json({
        message : "message retrieved successfully",
        messages
    })
}

export async function deleteChat(req, res) {
  try {
    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({
      _id: chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found or unauthorized",
      });
    }

    // Delete all messages associated with this chat
    await messageModel.deleteMany({ chat: chatId });

    return res.status(200).json({
      success: true,
      message: "Chat and its associated messages deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
}