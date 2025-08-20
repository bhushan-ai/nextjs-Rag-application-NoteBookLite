"use server";

import "dotenv/config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "models/embedding-001",
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(request) {
  try {
    const { input } = await request.json();

    const qdrantClient = new QdrantClient({
      url: process.env.CLUSTER_API_KEY,
      apiKey: process.env.QDRANT_CLUSTER_URL,
    });
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

    const relevantChunks = await vectorSearcher.invoke(input);
    const context = relevantChunks.map((c) => c.pageContent).join("\n\n");

    const SYSTEM_PROMPT = `you are an AI assistant who helps resolving user query based on the context available to you from a Text Data or URL or PDF file for pdf file answer with the content or page number and for URl answer with section.
     
     Only answer based on the available Context from URL or PDF or Text Data  only
     
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
          content: input,
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
