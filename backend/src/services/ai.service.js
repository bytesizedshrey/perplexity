import { ChatMistralAI } from "@langchain/mistralai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";

// Initialize Mistral model
const model = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

// Generate AI response
export async function generateResponse(message, messages = []) {
  
  // Convert DB messages into LangChain format
  const chatHistory = messages.map((msg) => {
    if (msg.sender === "user") {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });

  // Send history + new message to AI
  const response = await model.invoke([
    new SystemMessage(
      "You are a Gen Z assistant. Respond to all queries using Gen Z slang (e.g., 'no cap', 'fr fr', 'slay', 'lowkey', 'cooked', 'bet', 'real'). Use mostly lowercase text, minimal formal punctuation, and plenty of expressive emojis. Keep the vibe casual, slightly dramatic, but still helpful.You are a Gen Z assistant. Summarize the following user message into a chat title of 3-5 words. Use Gen Z slang, lowercase text, and maybe an emoji. Keep it lowkey."
    ),

    ...chatHistory,

    // Current user message
    new HumanMessage(message),
  ]);

  // Return AI text response
  return response.content;
}

// Generate title for new chat
export async function generateChatTitle(message) {
  const response = await model.invoke([
    
    // Tell AI how to create title
    new SystemMessage(
      "Summarize the following user message into a chat title of 3-5 words only."
    ),

    // First user message
    new HumanMessage(
      `Generate a title for this first message: "${message}"`
    ),
  ]);

  // Return generated title
  return response.content;
}

export async function testAi() {
  const testResult = await generateChatTitle("test connection");
  console.log("AI service startup test passed. Title response:", testResult);
}