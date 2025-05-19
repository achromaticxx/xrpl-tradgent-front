"use client"

import { useState } from "react"
import { NavigationBar } from "@/components/navigation-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useWallet } from "@/hooks/useWallet"
import { Loader2, Send } from "lucide-react"

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function PromptPage() {
  const { isConnected } = useWallet()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          context: {
            isConnected,
            // Add any other relevant context
          }
        }),
      })

      const data = await response.json()
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to get AI response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavigationBar />

      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">AI Trading Assistant</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Chat with AI Assistant</CardTitle>
                <CardDescription>
                  Ask questions about DeFi strategies, market analysis, or trading recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about DeFi strategies or market analysis..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Suggested Prompts</CardTitle>
                <CardDescription>Try these example questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setInput("What are the best DeFi strategies for XRP holders?")}
                >
                  Best DeFi strategies for XRP
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setInput("Explain yield farming in simple terms")}
                >
                  Explain yield farming
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setInput("What's the current market sentiment for XRP?")}
                >
                  Current market sentiment
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setInput("How can I start automated trading?")}
                >
                  Automated trading guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
