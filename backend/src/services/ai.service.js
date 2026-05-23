import { ChatMistralAI } from "@langchain/mistralai";

const model = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function testAi() {
  model.invoke('chandler bing').then((response)=>{console.log(response.text)})
}