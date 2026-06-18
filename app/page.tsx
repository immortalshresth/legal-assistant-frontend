"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Scale, ShieldAlert, BookOpen, Loader2 } from "lucide-react";

// 1. We define the exact shape of your legal sources so TypeScript doesn't panic
type LegalSource = {
  act: string;
  section: string;
  snippet: string;
};

// 2. We define the shape of a chat message
type Message = {
  role: "user" | "assistant";
  text: string;
  sources: LegalSource[];
};

export default function Home() {
  // 3. We tell useState exactly what type of array this is
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello! I am your AI Legal Assistant. Ask me any question regarding statutory codes, sections, or punishments.",
      sources: []
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 4. We tell the useRef that it is attaching to an HTML Div element
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 5. We define the 'e' parameter as a React Form Event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userQuery, sources: [] }]);
    setIsLoading(true);

    try {
// This looks for your Railway URL on Vercel, or falls back to local testing
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const response = await fetch(`${apiUrl}/api/ask`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    question: userQuery, 
    top_k: 15 // Your updated top_k value
  }),
});

      if (!response.ok) throw new Error("Backend connection failed.");

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer, sources: data.sources || [] }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error: Could not connect to the legal AI engine. Verify your FastAPI server is active.", sources: [] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shadow-md">
        <div className="flex items-center gap-3">
          <Scale className="text-amber-500 w-7 h-7" />
          <h1 className="text-xl font-bold tracking-wide">Legal Bot <span className="text-xs text-amber-500 font-medium px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full">RAG ENGINE</span></h1>
        </div>
        <div className="flex items-center gap-2 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Connected to Indian Legal Database
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl w-full mx-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm ${msg.role === "user" ? "bg-amber-600 text-white rounded-br-none" : "bg-slate-800 border border-slate-700 rounded-bl-none"}`}>
              <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base">{msg.text}</p>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium tracking-wide uppercase">
                    <BookOpen className="w-3.5 h-3.5" />
                    Verified Legal References:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {msg.sources.map((src, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700 text-xs text-slate-300">
                        <span className="font-semibold text-amber-500 block mb-0.5">{src.act} - Section {src.section}</span>
                        <span className="italic opacity-80">{src.snippet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-5 py-4 flex items-center gap-3 text-sm text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              Scanning legal data base & generating response...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 p-4 shadow-xl">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl p-2 focus-within:border-amber-500 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a legal question (e.g., 'What is the penalty under section 420?')"
            className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-sm px-3 text-slate-100 placeholder-slate-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white p-2.5 rounded-lg transition-all disabled:text-slate-600 flex items-center justify-center shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="max-w-4xl mx-auto mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 justify-center">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
          legalBot is an automated AI utility tools system context. Always consult a certified legal professional for critical validation matters.
        </div>
      </footer>
    </div>
  );
}

