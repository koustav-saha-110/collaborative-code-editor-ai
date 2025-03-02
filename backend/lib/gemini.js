import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are a coding assistant. Respond exclusively with the minimal code needed to solve the task. Do not include language identifiers, explanations, or any extra text. Avoid comments, whitespace, or unnecessary formatting. Provide only the required code unless explicitly asked for an explanation or clarification.",
    generationConfig: {
        temperature: 0.6,
    }
});

export default model;
