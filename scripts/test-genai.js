import { GoogleGenAI } from "@google/genai";
console.log("Instantiating...");
try {
  const ai = new GoogleGenAI({ apiKey: "" });
  ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "hello"
  }).then(console.log).catch(e => console.log("API Error:", e.message));
} catch (e) {
  console.log("Error:", e.message);
}
