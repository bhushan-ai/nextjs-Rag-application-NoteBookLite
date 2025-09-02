"use client";

import { AuroraText } from "@/components/magicui/aurora-text";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import PdfInput from "./components/PdfInput";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Home() {
  const [messages, setMessage] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("messages");
    if (saved) setMessage(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [textData, setTextData] = useState("");
  const [url, setUrl] = useState("");
  const [pdf, setPdf] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [inputType, setInputType] = useState("pdf");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function dataOnSubmit(e) {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData();
      if (pdf) {
        formData.append("pdf", pdf);
      } else if (url) {
        formData.append("url", url);
      } else {
        formData.append("text", textData);
      }

      //storing to DB
      const res = await axios.post("/api/indexing", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      //console.log("res", res);

      if (res.data.success) {
        setUploading(false);
      }
    } catch (error) {
      console.log("something went wrong to upload data", error);
      setUploading(false);
    }
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    const newMsg = { role: "user", content: input };
    setMessage((prev) => [...prev, newMsg]);
    setInput("");

    try {
      const res = await axios.post(
        "/api/chat",
        { input },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = res.data;

      setMessage((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      setMessage((prev) => [
        ...prev,
        { role: "assistant", content: "Error: " + error.message },
      ]);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tighter ml-2 p-2 mb-0 ">
        Chat with <AuroraText>Data</AuroraText>
      </h1>
      <div className="w-full gap-4 md:gap-0 min-h-fit flex flex-col md:flex-row p-2 rounded-2xl shadow-lg">
        {/* Left Section */}
        <div className="flex flex-col gap-4 w-100 h-fit mr-7  text-white bg-neutral-800 p-4 rounded-xl shadow-md">
          <form onSubmit={dataOnSubmit} className="flex flex-col gap-4">
            {/* Input type selector */}
            <div className="flex gap-4 items-center">
              <Select value={inputType} onValueChange={setInputType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Choose Input Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {inputType === "pdf" && (
              <PdfInput
                pdf={pdf}
                pdfLoading={pdfLoading}
                setPdfLoading={setPdfLoading}
                setPdf={setPdf}
              />
            )}

            {inputType === "url" && (
              <div className="flex flex-col gap-3">
                <label className="font-semibold text-white">Enter URL</label>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            )}

            {inputType === "text" && (
              <div className="flex flex-col gap-3 text-white">
                <label className="font-semibold">Message</label>
                <textarea
                  className="w-full h-60 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Write your message..."
                  value={textData}
                  onChange={(e) => setTextData(e.target.value)}
                />
              </div>
            )}

            <RainbowButton type="submit">
              {" "}
              {uploading ? "Uploading..." : "Submit Data"}
            </RainbowButton>
          </form>

          {messages.length > 0 && (
            <Button variant="destructive" onClick={() => setMessage([])}>
              Clear chat
            </Button>
          )}
        </div>

        <div className="flex flex-col h-fit w-full sm:w-[90%] md:w-[80%] lg:w-[70%] bg-neutral-800 p-2 rounded-xl shadow-md">
          <div className="rounded-lg sm:m-2 p-2 h-[500px] overflow-y-auto shadow scrollbar-hidden">
            {messages.length === 0 ? (
              <p className="text-2xl text-gray-400 font-bold text-center">
                {uploading
                  ? "Upload file or data first"
                  : "data uploaded now ask.. "}
              </p>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx + msg.role + msg.content.slice(0, 10)}
                    className={`mb-3 ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block max-w-[75%] px-4 py-3 rounded-2xl shadow-md transition-all duration-300
                     ${
                       msg.role === "user"
                         ? "bg-gradient-to-r from-[#0a0a0a] via-[#1a1a1a] to-[#2a2a2a] text-white shadow-[0_0_15px_rgba(17,17,17,0.6)] self-end"
                         : "bg-gradient-to-r from-[#181818] via-[#242323] to-[#313131] text-gray-200 shadow-[0_0_15px_rgba(85,85,85,0.4)] self-start"
                     }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="text-left">
                    <div className="inline-block ">
                      <p>typing..</p>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-3">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="chat with your data..."
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <ShimmerButton
                  disabled={!pdf && !url && !textData}
                  className="shadow-2xl"
                  type="submit"
                >
                  <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                    <Send />
                  </span>
                </ShimmerButton>
              </TooltipTrigger>
              {!pdf && !url && !textData && (
                <TooltipContent>
                  <p>Add Data first</p>
                </TooltipContent>
              )}
            </Tooltip>
          </form>
        </div>
      </div>
      <p className="text-gray-500 mb-2 text-center flex items-center justify-center gap-2">
        Made by bhushann.ai
        <a
          href="https://x.com/bhushann_ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 50"
            className="w-5 h-5 text-white hover:text-gray-400"
            fill="currentColor"
          >
            <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z"></path>
          </svg>
        </a>
      </p>
    </div>
  );
}
