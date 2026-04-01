import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SummaryMode, OutputFormat, TonePreference, SummaryResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function summarizeContent(
  content: string,
  mode: SummaryMode,
  format: OutputFormat,
  tone: TonePreference,
  length: number, // 0 to 100
  annotations?: { text: string; type: 'prioritize' | 'exclude' }[]
): Promise<SummaryResult> {
  const model = "gemini-3.1-pro-preview";

  const lengthDesc = length < 33 ? "very concise" : length < 66 ? "moderate length" : "detailed and comprehensive";

  const annotationInstructions = annotations && annotations.length > 0 
    ? `
    User has provided specific instructions for certain parts of the content:
    ${annotations.map(a => `- ${a.type === 'prioritize' ? 'PRIORITIZE' : 'EXCLUDE'}: "${a.text}"`).join('\n')}
    
    Please strictly follow these instructions. If a part is marked EXCLUDE, do not include its information in the summary. If marked PRIORITIZE, ensure it is a central part of the summary.
    `
    : "";

  const systemInstruction = `
    You are OmniSummarize AI, an advanced context-aware summarization engine.
    Your goal is to provide high-quality, intelligent summaries.
    
    Mode: ${mode}
    Format: ${format}
    Tone: ${tone}
    Desired Length: ${lengthDesc}
    ${annotationInstructions}

    Instructions for Modes:
    - quick: Focus on the absolute essentials.
    - detailed: Provide a deep dive into all nuances.
    - exam: Focus on facts, definitions, and potential test questions.
    - eli10: Use simple analogies and avoid jargon.
    - professional: Use formal business language.
    - critical: Analyze pros, cons, and underlying assumptions.
    - compare: (If multiple inputs provided) Highlight similarities and differences.

    Always return a JSON object matching this schema:
    {
      "tldr": "string (1-2 sentences)",
      "keyPoints": ["string"],
      "keywords": ["string"],
      "insights": ["string"],
      "simplifiedExplanation": "string (optional, required for eli10)",
      "questions": [{"question": "string", "answer": "string"}] (required for exam mode),
      "contentType": "string (e.g., article, research paper, code, story)"
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: `Content to summarize: ${content}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tldr: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          insights: { type: Type.ARRAY, items: { type: Type.STRING } },
          simplifiedExplanation: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ["question", "answer"]
            }
          },
          contentType: { type: Type.STRING }
        },
        required: ["tldr", "keyPoints", "keywords", "insights", "contentType"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function performOCR(base64Image: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image.split(",")[1] || base64Image
        }
      },
      { text: "Extract all text from this image accurately. Maintain structure if possible." }
    ]
  });
  return response.text;
}

export async function getYouTubeTranscript(url: string): Promise<string> {
  // In a real app, we'd use a YouTube transcript API.
  // For this demo, we'll ask Gemini to summarize the video if it can access it via URL context,
  // or we'll simulate the transcript extraction if we had a backend service.
  // Since we have URL context tool, we can use that!
  
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `Extract the main content and transcript-like summary from this YouTube video: ${url}`,
    config: {
      tools: [{ urlContext: {} }]
    }
  });
  return response.text;
}
