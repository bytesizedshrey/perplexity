import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

export async function testAi() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Skipping AI service test.');
    return;
  }

  try {
    const response = await model.invoke('what is capital of india?');
    console.log(response.text);
  } catch (error) {
    console.error('AI service test failed:', error.message || error);
    throw error;
  }
}