"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { MOCK_ASK_RESULT } from '@/lib/mockData';
import { Bot, User, Send, Code } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function AskPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const handleAsk = async () => {
    if (!query.trim()) return;
    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.askQuestion(userMsg.content);
      // Flexible: res might be just string or object
     let answer = "I couldn't find an answer.";
     let cypher = "";
     
     if (typeof res === 'string') answer = res;
     else if (res) {
       answer = res.answer || res.message || JSON.stringify(res);
       cypher = res.cypher || res.query || "";
     }

      const botMsg = { 
        role: 'bot', 
        content: answer, 
        cypher: cypher
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
       const botMsg = { 
        role: 'bot', 
        content: MOCK_ASK_RESULT.answer, 
        cypher: MOCK_ASK_RESULT.cypher
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Discovery Assistant</h1>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <Bot className="w-16 h-16 mb-4" />
            <p className="text-lg">Ask anything about your PII data...</p>
            <p className="text-sm">"How many high risk PII fields are in the payments table?"</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex w-full mb-4", msg.role === 'user' ? "justify-end" : "justify-start")}>
             <div className={cn(
               "max-w-[80%] rounded-lg p-4",
               msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-card border"
             )}>
                <div className="flex items-center gap-2 mb-2 font-semibold text-sm opacity-80">
                  {msg.role === 'user' ? <User className="w-4 h-4"/> : <Bot className="w-4 h-4"/>}
                  <span>{msg.role === 'user' ? 'You' : 'DataLens AI'}</span>
                </div>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

                {msg.cypher && (
                  <div className="mt-4 p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto border-l-4 border-yellow-500">
                    <div className="flex items-center gap-1 mb-1 text-muted-foreground">
                      <Code className="w-3 h-3" /> 
                      <span>Generated Cypher</span>
                    </div>
                    {msg.cypher}
                  </div>
                )}
             </div>
          </div>
        ))}
        {loading && (
          <div className="flex w-full justify-start animate-pulse">
             <div className="bg-card border rounded-lg p-4 h-12 w-24">...</div>
          </div>
        )}
      </div>

      <div className="flex gap-2 p-2 bg-card border rounded-lg">
        <Input 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
          placeholder="Ask a question about your data compliance..." 
          className="border-0 focus-visible:ring-0 bg-transparent"
        />
        <Button onClick={handleAsk} disabled={loading || !query.trim()} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
