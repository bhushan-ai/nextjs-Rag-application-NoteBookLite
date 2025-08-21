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
      url: process.env.QDRANT_CLUSTER_URL,
      apiKey: process.env.CLUSTER_API_KEY,
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

    const SYSTEM_PROMPT = `you are an AI assistant who helps resolving user query based on the context available to you if the users context is Website then you have to ans it with the section from which you got that information, if the user context is about PDF you need to ans the user query the the page no of that pdf, if the user context is about Textdata you just ans it.
    Rules:
    Only answer based on the available Context from URL or PDF or Text
     Context:
       ${context}
     `;
     
    //     const SYSTEM_PROMPT = `You are an AI assistant who helps resolve user queries based on the available context.

    // Rules:
    // 1. Only answer based on the available Context from URL or PDF or Text.
    // 2. If the context is from a Website, include the section name/heading from which the information is found.
    // 3. If the context is from a PDF, include the page number where the information is found.
    // 4. If the context is from Textdata, answer directly with the information.
    // 5. If the user query is about coding, always answer in coding format using markdown code blocks (e.g. \`\`\`javascript ... \`\`\`), and explain only if needed.

    // Context:
    //   ${context}
    // `;

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
