"use server";

import "dotenv/config";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "models/embedding-001",
});

async function storeToDb(data) {
  return await QdrantVectorStore.fromDocuments(data, embeddings, {
    url: process.env.QDRANT_CLUSTER_URL,
    apiKey: process.env.CLUSTER_API_KEY,
    collectionName: "pdf-url-collection",
  });
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const pdf = formData.get("pdf") || null;
    const url = formData.get("url") || "";
    const textData = formData.get("text") || "";

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 50,
    });

    let newTextData = [];
    if (textData) {
      newTextData = (await textSplitter.splitText(textData)).map(
        (chunk, idx) => ({
          pageContent: chunk,
          metadata: { type: "text", chunkIndex: idx },
        })
      );
    }

    let docs = [];
    if (pdf) {
      //console.log("pdf", pdf);
      const loader = new PDFLoader(pdf);
      docs = docs.concat(await loader.load());
    } else if (url) {
      const loader = new CheerioWebBaseLoader(url);
      docs = await loader.load();
    } else if (newTextData.length > 0) {
      docs = newTextData;
    } else {
      return new Response(
        JSON.stringify({ error: "Please provide either pdf, text, or url" }),
        { status: 400 }
      );
    }

    await storeToDb(docs);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
