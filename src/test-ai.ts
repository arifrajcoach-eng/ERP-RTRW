import { chatWithAI } from './services/aiService.js';
import * as dotenv from 'dotenv';
dotenv.config();

console.log("Key exists:", !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);

async function run() {
  try {
    const res = await chatWithAI({
      isPrivileged: false,
      message: "Halo test",
      role: "user",
      dataSummary: {},
      history: []
    });
    console.log("Success! Responding...");
    let received = '';
    for await (const chunk of res) {
      if (chunk.text) {
          received += chunk.text;
      }
    }
    console.log("Text:", received);
  } catch (e) {
    console.error("Error:", (e as Error).message);
  }
}
run();
