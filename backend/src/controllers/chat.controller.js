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
      chat: chat._id,title
    });

    console.log(messages)

    // Generate AI response
    const result = await generateResponse(message, messages);

    // Save user message
    const userMessage = await messageModel.create({
      chat: chat._id,
      content: message,
      sender: "user",
    });

    // Save AI message
    const aiMessage = await messageModel.create({
      chat: chat._id,
      content: result,
      sender: "ai", // use this if schema enum = ["user", "assistant"]
    });

    return res.status(201).json({
      success: true,
      aiMessage: result,
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