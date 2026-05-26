import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import {
  generateResponse,
  generateChatTitle,
} from "../services/ai.service.js";

export async function sendMessage(req, res) {
  try {
    const { message } = req.body;

    const title = await generateChatTitle(message);
    console.log(title);

    const result = await generateResponse(message);

    // create chat
    const chat = await chatModel.create({
      user: req.user.id || req.user._id,
      title,
    });

    // save user message
    const userMessage = await messageModel.create({
        chat: chat._id,
        content: message,
        sender: "user",
      });
      
      const aiMessage = await messageModel.create({
        chat: chat._id,
        content: result,
        sender: "ai",
      });

    return res.status(201).json({
      aiMessage: result,
      title,
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