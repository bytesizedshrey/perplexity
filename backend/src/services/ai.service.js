import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage } from "langchain";


const model = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function testAi() {
  model.invoke('chandler bing').then((response)=>{console.log(response.text)})
}

export async function generateResponse(message) {
  const response = await model.invoke([
    new HumanMessage(message)
  ])
  return response.text
}