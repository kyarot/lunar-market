import { useState, useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Sparkles, Loader2, Moon, Stars } from "lucide-react";
import { chatWithLunarAssistant, ChatMessage } from "@/lib/mistralAI";

interface AIChatAssistantProps {
  context: {
    phaseName: string;
    illumination: number;
    stockSymbol: string;
    stockPrice: number;
    priceChange: number;
    zodiac: string;
    date: Date;
  };
}

// Mini moon for the chat header
const MiniMoon = memo(({ phase }: { phase: number }) => {
  const size = 32;
  const cx = 16;
  const cy = 16;
  const r = 14;

  const p = ((phase % 1) + 1) % 1;
  const cosPhase = Math.cos(p * 2 * Math.PI);
  
  let shadowPath = "";
  if (p < 0.03 || p > 0.97) {
    shadowPath = `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`;
  } else if (!(p > 0.47 && p < 0.53)) {
    const points: string[] = [];
    const numPoints = 20;
    if (p < 0.5) {
      for (let i = 0; i <= numPoints; i++) {
        const angle = -Math.PI / 2 + (Math.PI * i) / numPoints;
        const x = cx - r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
      }
      for (let i = numPoints; i >= 0; i--) {
        const angle = -Math.PI / 2 + (Math.PI * i) / numPoints;
        const terminatorX = cx + r * Math.cos(angle) * cosPhase;
        const y = cy + r * Math.sin(angle);
        points.push(`L ${terminatorX} ${y}`);
      }
    } else {
      for (let i = 0; i <= numPoints; i++) {
        const angle = -Math.PI / 2 + (Math.PI * i) / numPoints;
        const terminatorX = cx + r * Math.cos(angle) * cosPhase;
        const y = cy + r * Math.sin(angle);
        points.push(i === 0 ? `M ${terminatorX} ${y}` : `L ${terminatorX} ${y}`);
      }
      for (let i = numPoints; i >= 0; i--) {
        const angle = -Math.PI / 2 + (Math.PI * i) / numPoints;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        points.push(`L ${x} ${y}`);
      }
    }
    points.push("Z");
    shadowPath = points.join(" ");
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="miniMoonLit" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#C0C0C0" />
        </radialGradient>
        <radialGradient id="miniMoonDark" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#1e1e2e" />
          <stop offset="100%" stopColor="#0a0a14" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="url(#miniMoonLit)" />
      {shadowPath && <path d={shadowPath} fill="url(#miniMoonDark)" opacity="0.95" />}
    </svg>
  );
});

MiniMoon.displayName = "MiniMoon";

// Floating stars background
const ChatStars = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-0.5 h-0.5 bg-white rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: 0.3 + Math.random() * 0.4,
        }}
        animate={{
          opacity: [0.2, 0.6, 0.2],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
));

ChatStars.displayName = "ChatStars";

export const AIChatAssistant = memo(({ context }: AIChatAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Greetings, cosmic traveler! ✨ I'm Luna, your celestial guide through the mysteries of lunar cycles and market patterns. What secrets of the cosmos shall we explore together?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatWithLunarAssistant([...messages, userMessage], context);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "The cosmic connection wavered... Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "🌙 What does this moon phase mean?",
    "📈 Best time to invest?",
    "⭐ How does zodiac affect markets?",
  ];

  // Calculate phase from illumination for mini moon
  const phase = context.illumination <= 50 
    ? context.illumination / 100 * 0.5 
    : 0.5 + (100 - context.illumination) / 100 * 0.5;

  return (
    <>
      {/* Floating Chat Toggle Button with Glow */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: "linear-gradient(135deg, hsl(222, 47%, 12%) 0%, hsl(222, 47%, 8%) 100%)",
          boxShadow: isOpen 
            ? "0 0 30px rgba(99, 102, 241, 0.4), inset 0 0 20px rgba(99, 102, 241, 0.1)"
            : "0 0 40px rgba(99, 102, 241, 0.3), 0 0 80px rgba(99, 102, 241, 0.15), inset 0 0 20px rgba(99, 102, 241, 0.1)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Moon className="w-7 h-7 text-primary" />
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-28 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[70vh] flex flex-col overflow-hidden rounded-3xl"
            style={{
              background: "linear-gradient(180deg, hsl(222, 47%, 10%) 0%, hsl(222, 47%, 6%) 100%)",
              boxShadow: "0 0 60px rgba(99, 102, 241, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
            }}
          >
            {/* Starfield Background */}
            <ChatStars />

            {/* Header with Moon */}
            <div 
              className="relative p-4 border-b border-border/20"
              style={{
                background: "linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%)",
              }}
            >
              <div className="flex items-center gap-3 relative z-10">
                <motion.div 
                  className="relative"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: "radial-gradient(circle at 30% 30%, hsl(222, 47%, 20%), hsl(222, 47%, 8%))",
                      boxShadow: "0 0 20px rgba(99, 102, 241, 0.3), inset 0 0 15px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <MiniMoon phase={phase} />
                  </div>
                  <motion.div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-background"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    Luna AI
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Stars className="w-3 h-3" />
                    {context.phaseName} • {context.zodiac}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-primary font-medium">{context.stockSymbol}</p>
                  <p className="text-[10px] text-muted-foreground">${context.stockPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-2xl rounded-br-md"
                        : "rounded-2xl rounded-bl-md"
                    }`}
                    style={{
                      background: msg.role === "user"
                        ? "linear-gradient(135deg, hsl(226, 70%, 50%) 0%, hsl(260, 60%, 45%) 100%)"
                        : "linear-gradient(135deg, hsl(222, 47%, 15%) 0%, hsl(222, 47%, 12%) 100%)",
                      color: msg.role === "user" ? "white" : "hsl(210, 40%, 90%)",
                      boxShadow: msg.role === "user"
                        ? "0 4px 15px rgba(99, 102, 241, 0.3)"
                        : "0 4px 15px rgba(0, 0, 0, 0.2)",
                      border: msg.role === "user" 
                        ? "none" 
                        : "1px solid rgba(99, 102, 241, 0.15)",
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start"
                >
                  <div 
                    className="p-4 rounded-2xl rounded-bl-md flex items-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, hsl(222, 47%, 15%) 0%, hsl(222, 47%, 12%) 100%)",
                      border: "1px solid rgba(99, 102, 241, 0.15)",
                    }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-4 h-4 text-primary" />
                    </motion.div>
                    <span className="text-xs text-muted-foreground">Reading the stars...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-3 flex flex-wrap gap-2 relative z-10">
                {suggestedQuestions.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setInput(q.replace(/^[^\s]+\s/, ""))}
                    className="text-xs px-3 py-2 rounded-xl transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, hsl(222, 47%, 14%) 0%, hsl(222, 47%, 10%) 100%)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      color: "hsl(215, 20%, 65%)",
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 0 15px rgba(99, 102, 241, 0.2)",
                    }}
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div 
              className="p-4 relative z-10"
              style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.05) 100%)",
                borderTop: "1px solid rgba(99, 102, 241, 0.1)",
              }}
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Luna about the cosmos..."
                  className="flex-1 px-4 py-3 text-sm rounded-xl focus:outline-none transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, hsl(222, 47%, 12%) 0%, hsl(222, 47%, 9%) 100%)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    color: "hsl(210, 40%, 90%)",
                  }}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, hsl(226, 70%, 50%) 0%, hsl(260, 60%, 45%) 100%)",
                    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
                  }}
                  whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

AIChatAssistant.displayName = "AIChatAssistant";
