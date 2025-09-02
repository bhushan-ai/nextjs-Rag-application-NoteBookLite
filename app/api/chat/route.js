"use server";

import "dotenv/config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenAI } from "@google/genai";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "models/embedding-001",
});

const googleClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_CLUSTER_URL,
  apiKey: process.env.CLUSTER_API_KEY,
});

export async function POST(request) {
  try {
    const { input } = await request.json();

    const googleRes = await googleClient.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an Ai assistant who takes the user query and correct the typos and spelling mistakes. here is the query:${input}`,
            },
          ],
        },
      ],
    });

    const reWriteInput = googleRes.text;
    console.log("reWriteInput", reWriteInput);

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        client: qdrantClient,
        collectionName: "pdf-url-collection",
      }
    );

    const vectorSearcher = vectorStore.asRetriever({
      k: 3,
    });

    const relevantChunks = await vectorSearcher.invoke(reWriteInput);
    const context = relevantChunks.map((c) => c.pageContent).join("\n\n");

    const SYSTEM_PROMPT = `you are an AI assistant who helps resolving user query based on the context available to you if the users context is Website then you have to ans it with the section from which you got that information, if the user context is about PDF you need to ans the user query the the page no of that pdf, if the user context is about Textdata you just ans it.
    Rules:
    1.Alwaays provide Source from where you got this data
    Example 1:
    if user provided you pdf about nodejs and he asked a question like:
    user: what is node js ?
    assistant: nodejs is the run time enviornment of javascrip 
    source: page no.2
 
    2.Only answer based on the available Context from URL or PDF or Text
     Context:
       ${context}
     `;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: reWriteInput,
        },
      ],
      max_tokens: 100,
    });

    return new Response(
      JSON.stringify({
        reply: response.choices[0]?.message.content || "no response",
      })
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
