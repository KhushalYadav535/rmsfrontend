'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  Boxes,
  ChefHat,
  IndianRupee,
  Clock,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  AlertTriangle,
  Users,
  Utensils,
  CheckCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  dataPoints?: any;
  timestamp: string;
}

export default function AIAssistantPage() {
  const { currentOutlet } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `नमस्ते! मैं आपका Petpooja AI Restaurant Copilot हूँ। आप मुझसे आज की बिक्री (Sales), इन्वेंटरी स्टॉक, सबसे लोकप्रिय डिशेज़, वेटर परफॉर्मेंस या टेबल ऑक्यूपेंसी के बारे में हिंदी या इंग्लिश में सीधे पूछ सकते हैं।`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [autoVoice, setAutoVoice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initialize Speech Recognition if browser supports it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'hi-IN'; // or en-IN

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputQuery(transcript);
            setIsListening(false);
          }
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown/symbols from text
    const cleanText = text.replace(/[*_~`#₹]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Detect Hindi script
    const hasHindi = /[\u0900-\u097F]/.test(cleanText);
    utterance.lang = hasHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const samplePrompts = [
    { label: '💰 Today Sales', query: 'आज sales कैसी रही?' },
    { label: '📦 Low Stock', query: 'कौन-से ingredients low stock पर हैं?' },
    { label: '🍽️ Top Dishes', query: 'आज सबसे ज्यादा क्या बिका?' },
    { label: '👥 Staff Report', query: 'किस वेटर ने सबसे ज्यादा ऑर्डर्स लिए?' },
    { label: '🪑 Table Occupancy', query: 'अभी कितनी टेबल्स occupied हैं?' },
  ];

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim()) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    const res = await fetchApi('/ai/query', {
      method: 'POST',
      body: JSON.stringify({ query: q, outletId: currentOutlet?.id }),
    });

    const aiMsgId = `ai-${Date.now()}`;
    if (res.success) {
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: res.answer,
        dataPoints: res.dataPoints,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (autoVoice) {
        speakText(res.answer, aiMsgId);
      }
    } else {
      const errorMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: 'क्षमा करें, डेटा प्रोसेस करने में समस्या हुई। कृपया पुनः प्रयास करें।',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-6.5rem)]">
        {/* Header */}
        <div className="pb-3 border-b border-slate-200 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>AI Restaurant Copilot</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Bilingual English / Hindi
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Real-time operational intelligence, live database analytics & natural speech
              </p>
            </div>
          </div>

          <button
            onClick={() => setAutoVoice(!autoVoice)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              autoVoice
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {autoVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Auto Voice: {autoVoice ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs space-y-2 shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-white font-medium rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="leading-relaxed text-xs sm:text-sm font-semibold whitespace-pre-line">
                    {m.text}
                  </p>
                  {m.sender === 'ai' && (
                    <button
                      onClick={() => speakText(m.text, m.id)}
                      className={`p-1 rounded-lg shrink-0 transition-colors ${
                        isSpeaking === m.id
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isSpeaking === m.id ? 'Stop Voice' : 'Read aloud'}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Rich Data Points Display */}
                {m.dataPoints && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    {/* Sales Overview */}
                    {m.dataPoints.todaySales !== undefined && (
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-800">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Today's Sales</span>
                          <p className="text-base font-black text-emerald-600">₹{m.dataPoints.todaySales}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Settled Invoices</span>
                          <p className="text-base font-black text-slate-800">{m.dataPoints.completedOrders || 0}</p>
                        </div>
                      </div>
                    )}

                    {/* Top Dishes */}
                    {m.dataPoints.topDishes && m.dataPoints.topDishes.length > 0 && (
                      <div className="bg-amber-50/60 border border-amber-200/70 p-2.5 rounded-xl text-slate-800">
                        <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                          Top Selling Items:
                        </span>
                        <div className="space-y-1">
                          {m.dataPoints.topDishes.map((d: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="font-semibold text-slate-800">#{i + 1} {d.name}</span>
                              <span className="font-mono font-bold text-amber-800">{d.qty} portions</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Low Stock Items */}
                    {m.dataPoints.lowStockItems && m.dataPoints.lowStockItems.length > 0 && (
                      <div className="bg-rose-50/60 border border-rose-200/70 p-2.5 rounded-xl text-slate-800">
                        <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Low Stock Ingredients:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {m.dataPoints.lowStockItems.map((item: any, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-rose-700 border border-rose-200 shadow-2xs"
                            >
                              {item.name}: {item.currentStock} {item.unit} (Min: {item.minStockAlert})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Table Occupancy */}
                    {m.dataPoints.activeDineInCount !== undefined && (
                      <div className="bg-blue-50/60 border border-blue-200/70 p-2 rounded-xl flex items-center justify-between text-slate-800">
                        <span className="text-xs font-bold text-blue-900">Active Occupied Tables:</span>
                        <span className="text-sm font-black text-blue-700">
                          {m.dataPoints.activeDineInCount} / {m.dataPoints.totalTables || 10}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <span
                  className={`text-[9px] block text-right font-mono ${
                    m.sender === 'user' ? 'text-amber-100' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span>AI analyzing database records...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p.query)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-white hover:bg-amber-50 border border-slate-200 text-slate-700 hover:text-amber-800 hover:border-amber-300 transition-all whitespace-nowrap shadow-xs"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-2 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask sales, inventory stock, top dishes, or table occupancy (Hindi or English)..."
              className="flex-1 px-3 py-2 text-xs focus:outline-none bg-transparent font-semibold text-slate-800 placeholder:text-slate-400"
            />

            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                  : 'text-slate-400 hover:text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice search'}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
