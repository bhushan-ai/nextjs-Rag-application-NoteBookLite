"use client";

import { AuroraText } from "@/components/magicui/aurora-text";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [textData, setTextData] = useState("");
  const [url, setUrl] = useState("");
  const [pdf, setPdf] = useState(null);
  const [inputType, setInputType] = useState("text");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function dataOnSubmit(e) {
    e.preventDefault();
    setLoading(true);

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
      console.log("res", res);

      if (res.data.success) {
        setLoading(false);
      }
    } catch (error) {
      console.log("something went wrong to upload data", error);
      setLoading(false);
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
      <div className="m-3 p-3">
        <h1 className="text-2xl font-bold tracking-tighter ">
          Chat with your <AuroraText>Data</AuroraText>
        </h1>
      </div>
      <div className="w-full  mt-5 min-h-fit flex flex-col md:flex-row gap-6 p-6 rounded-2xl shadow-lg">
        {/* Left Section */}
        <div className="flex flex-col gap-4 w-100 h-fit  text-white bg-neutral-800 p-6 rounded-xl shadow-md">
          <form onSubmit={dataOnSubmit} className="flex flex-col gap-4">
            {/* Input type selector */}
            <div className="flex gap-4 items-center">
              <Select value={inputType} onValueChange={setInputType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Choose Input Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional inputs */}
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

            {inputType === "pdf" && (
              <div className="flex flex-col gap-3">
                <Label htmlFor="picture" className="font-semibold text-white">
                  Upload PDF
                </Label>

                <div className="flex items-center gap-5">
                  <Input
                    id="picture"
                    onChange={(e) => {
                      if (e.target.files.length > 0) setPdf(e.target.files[0]);
                    }}
                    type="file"
                    accept="application/pdf"
                    className="bg-black"
                  />

                  {pdf && (
                    <button type="button" onClick={() => setPdf(null)}>
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {inputType === "url" && (
              <div className="flex flex-col gap-3">
                <label className="font-semibold text-white">Enter URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://example.com"
                />
              </div>
            )}

            {/* Submit button */}

            <RainbowButton type="submit">
              {" "}
              {loading ? "Uploading..." : "Submit Data"}
            </RainbowButton>
          </form>
        </div>

        <div className="flex flex-col h-fit w-full bg-neutral-800 p-2  rounded-xl shadow-md">
          <div className="border rounded-lg m-3 md:m-2 p-4 h-110 overflow-y-auto shadow scrollbar-hidden ">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center">No messages yet...</p>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    // key={idx}
                    key={idx + msg.role + msg.content.slice(0, 10)}
                    className={`mb-3 ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block px-4 py-3 rounded-2xl shadow-md transition-all duration-300 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] text-white shadow-[0_0_10px_#38bdf8]"
                          : "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-gray-100 shadow-[0_0_10px_#555]"
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

            {/* <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200"></button> */}
            <ShimmerButton
              disabled={!pdf && !url && !textData}
              className="shadow-2xl"
              type="submit"
            >
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                <Send />
              </span>
            </ShimmerButton>
          </form>
        </div>
      </div>
    </div>
  );
}
