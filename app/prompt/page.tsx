"use client"

import { useState, useEffect, useRef } from "react"
import DelegatePermission from '@/components/delegate-permission';
import { NavigationBar } from "@/components/navigation-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useWallet } from "@/hooks/useWallet"
import { useCrossmark } from "@/hooks/useCrossmark" // Import useCrossmark
import { Loader2, Send } from "lucide-react"

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface UserProfile {
  id: string; // Add Supabase generated UUID
  risk_profile: string;
  experience: string[];
  delegated: boolean;
  // Add other fields from your User model if needed
}

export default function PromptPage() {
  const { address: evmAddress, isConnected: isEvmConnected } = useWallet() // Rename address to evmAddress
  const { account: xrplAddress, loading: isCrossmarkLoading } = useCrossmark() // Get XRPL address
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Add this line

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = xrplAddress || evmAddress; // Prioritize XRPL address
      if (userId) {
        setIsProfileLoading(true);
        try {
          const queryParam = xrplAddress ? `xrpl_wallet_address=${xrplAddress}` : `evm_wallet_address=${evmAddress}`;
          const response = await fetch(`/api/user/profile?${queryParam}`);
          if (response.ok) {
            const data = await response.json();
            setUserProfile(data.data);
          } else {
            console.error('Failed to fetch user profile:', response.statusText);
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        } finally {
          setIsProfileLoading(false);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [xrplAddress, evmAddress]); // Depend on both addresses

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userId = userProfile?.id; // Use userProfile.id as the user ID
    if (!input.trim() || isLoading || !userId || isProfileLoading) return // Check for userProfile.id

    const userMessage: Message = {
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          user_id: userId, // Use userId here
          context: {
            isConnected: isEvmConnected || !!xrplAddress, // Check both connections
            riskProfile: userProfile?.risk_profile || 'unknown',
            experience: userProfile?.experience || [],
            delegated: userProfile?.delegated || false,
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

  // AI 에이전트 XRPL 주소 상태
  const [agentAddress, setAgentAddress] = useState<string | null>(null);
  useEffect(() => {
    // 백엔드에서 AI 에이전트 XRPL 주소 가져오기
    fetch('/api/agent/address')
      .then(res => res.json())
      .then(data => setAgentAddress(data.address))
      .catch(() => setAgentAddress(null));
  }, []);

  // 위임 완료 시 콜백
  const handleDelegationComplete = async () => {
    if (xrplAddress) {
      try {
        // 백엔드에 위임 상태 업데이트 요청
        const response = await fetch('/api/user/delegate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            xrpl_wallet_address: xrplAddress,
            delegated: true,
            delegated_at: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to update delegation status in DB:', errorData.detail);
          // 사용자에게 오류 알림을 표시할 수 있습니다.
        }
      } catch (error) {
        console.error('Error updating delegation status in DB:', error);
        // 사용자에게 오류 알림을 표시할 수 있습니다.
      }
    }

    // 프로필을 다시 불러와 delegated 상태 갱신 (기존 로직 유지)
    if (xrplAddress || evmAddress) {
      setIsProfileLoading(true);
      const queryParam = xrplAddress ? `xrpl_wallet_address=${xrplAddress}` : `evm_wallet_address=${evmAddress}`;
      fetch(`/api/user/profile?${queryParam}`)
        .then(res => res.json())
        .then(data => setUserProfile(data.data))
        .finally(() => setIsProfileLoading(false));
    }
  };

  // 조건부 렌더링: 위임이 안 된 경우 DelegatePermission, 위임 완료 시 기존 챗 UI
  // 상태값 디버깅
  useEffect(() => {
    console.log('userProfile:', userProfile);
    console.log('agentAddress:', agentAddress);
    console.log('xrplAddress:', xrplAddress);
  }, [userProfile, agentAddress, xrplAddress]);

  // delegated가 undefined일 때도 false로 간주
  const shouldShowDelegate = !!userProfile && !!agentAddress && !!xrplAddress && !userProfile.delegated;

  // userProfile이 null이거나 id가 없으면 안내 메시지 출력
  if (!userProfile || !userProfile.id) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavigationBar />
        <main className="flex-1 container mx-auto px-4 py-6 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <div className="text-lg">지갑 연결 또는 프로필 정보를 불러오는 중입니다...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavigationBar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">AI Trading Assistant</h1>
        {shouldShowDelegate ? (
          <DelegatePermission
            agentAddress={agentAddress}
            userAddress={xrplAddress}
            onDelegationComplete={handleDelegationComplete}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Chat with AI Assistant</CardTitle>
                  <CardDescription>
                    Ask questions about DeFi strategies, market analysis, or trading recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4" ref={messagesEndRef}>
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
                    {(isLoading || isProfileLoading || isCrossmarkLoading) && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about DeFi strategies or market analysis..."
                      className="flex-1"
                      disabled={isLoading || isProfileLoading || isCrossmarkLoading}
                    />
                    <Button type="submit" disabled={isLoading || isProfileLoading || isCrossmarkLoading}>
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
        )}
      </main>
    </div>
  );
}


