import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function generateResponse(message) {
  const response = await model.invoke([
    new HumanMessage(message),
  ]);

  return response.text;
}

export async function generateChatTitle(message) {
  const response = await model.invoke([
    new SystemMessage(
      "You are a Gen Z assistant. Respond to all user messages using Gen Z slang, lowercase, minimal punctuation, and emojis. Keep it real and lowkey.Summarize the following user message into a chat title of 3-5 words."
    ),
    new HumanMessage(
      `Generate a title for this first message: "${message}"`
    ),
  ]);

  return response.text;
}