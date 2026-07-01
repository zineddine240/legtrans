"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { Send, Bot, User, AlertTriangle, ShieldAlert, Loader2, Sparkles, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPage() {
  const t = useTranslations("Assistant");
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: "user" as const, content: text.trim() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `❌ ${data.error || "Une erreur est survenue."}` },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Une erreur de connexion est survenue. Veuillez réessayer." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    t("suggest1"),
    t("suggest2"),
    t("suggest3"),
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-white max-w-5xl mx-auto w-full relative">
      {/* Header */}
      <div className="flex flex-col items-center justify-center py-6 px-4 border-b border-gray-100 bg-white z-10 shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-[#0d6e4e] to-[#074a35] rounded-xl flex items-center justify-center mb-3 shadow-md shadow-[#0d6e4e]/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("title")}</h1>
        <p className="text-sm text-gray-500 text-center max-w-md">{t("subtitle")}</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
              <Sparkles className="w-8 h-8 text-[#0d6e4e]/40 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700">{t("empty_state")}</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 w-full max-w-lg">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(suggestion)}
                  className="flex items-center gap-3 p-4 text-start text-sm text-gray-600 bg-gray-50 hover:bg-[#0d6e4e]/5 border border-gray-100 hover:border-[#0d6e4e]/20 rounded-xl transition-all shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 text-[#0d6e4e]/60 shrink-0" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0d6e4e] to-[#074a35] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`relative max-w-[85%] sm:max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gray-900 text-white rounded-tr-sm shadow-md"
                      : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                  <div className="prose prose-sm prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:text-gray-800 max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4 justify-start animate-in fade-in">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0d6e4e] to-[#074a35] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 px-4">
        <div className="max-w-3xl mx-auto w-full relative">
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="relative flex items-center"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("placeholder")}
              disabled={loading}
              className="w-full bg-white border border-gray-200 shadow-sm focus:border-[#0d6e4e] focus:ring-1 focus:ring-[#0d6e4e] rounded-full py-4 pl-6 pr-14 text-sm outline-none transition-all disabled:opacity-50"
              dir="auto"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#0d6e4e] text-white hover:bg-[#074a35] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rtl:-scale-x-100" />}
            </button>
          </form>

          {/* Privacy & Legal Notices */}
          <div className="mt-4 flex flex-col items-center text-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              {t("privacy")}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 flex items-center justify-center gap-1.5 max-w-xl mx-auto px-4">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{t("disclaimer")}</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
