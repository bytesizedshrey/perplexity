import { ChatMistralAI } from "@langchain/mistralai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { searchInternet, formatSearchResults } from "./internet.service.js";

// Initialize Mistral model
const model = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

// Keywords that typically require internet search
const SEARCH_KEYWORDS = [
  "today",
  "current",
  "latest",
  "recent",
  "now",
  "right now",
  "2024",
  "2025",
  "2026",
  "news",
  "trending",
  "today's",
  "tomorrow",
  "weather",
];

/**
 * Check if a message requires internet search
 * @param {string} message - The user message
 * @returns {boolean} True if search is recommended
 */
function shouldSearch(message) {
  const lowerMessage = message.toLowerCase();
  return SEARCH_KEYWORDS.some((keyword) => lowerMessage.includes(keyword));
}

// Generate AI response
export async function generateResponse(message, messages = [], enableSearch = true) {
  let searchContext = "";
  let searchData = null;

  // Attempt internet search if enabled and message suggests it needs current info
  if (enableSearch && shouldSearch(message)) {
    try {
      console.log(`Searching internet for: "${message}"`);
      searchData = await searchInternet(message, 5);
      searchContext = formatSearchResults(searchData);
      console.log("Search completed successfully");
    } catch (error) {
      console.warn(`Internet search failed: ${error.message}. Continuing without search results.`);
    }
  }

  // Convert DB messages into LangChain format
  const chatHistory = messages.map((msg) => {
    if (msg.sender === "user") {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });

  // Build system prompt
  let systemPrompt =
    "You are a Gen Z assistant. Respond to all queries using Gen Z slang (e.g., 'no cap', 'fr fr', 'slay', 'lowkey', 'cooked', 'bet', 'real'). Use mostly lowercase text, minimal formal punctuation, and plenty of expressive emojis. Keep the vibe casual, slightly dramatic, but still helpful.";

  // Add search context if available
  if (searchContext) {
    systemPrompt += `\n\nRecent web search results are provided below. Use them to provide up-to-date information:\n\n${searchContext}`;
  }

  // Send history + new message to AI
  const response = await model.invoke([
    new SystemMessage(systemPrompt),

    ...chatHistory,

    // Current user message
    new HumanMessage(message),
  ]);

  // Return AI text response with search data if available
  return {
    content: response.content,
    searchData: searchData,
  };
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