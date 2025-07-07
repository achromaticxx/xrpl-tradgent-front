"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { useWallet } from "@/hooks/useWallet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet } from "lucide-react"
import { useXumm } from "@/hooks/useXumm"
import { useCrossmark } from "@/hooks/useCrossmark"

export default function HomePage() {
  const router = useRouter()
  const { address, isConnected, isPending, connectors, connect, disconnect } = useWallet()
  const { account: xrplAccount, login: xrplLogin, logout: xrplLogout, loading: xrplLoading } = useXumm()
  const { account: crossmarkAccount, connect: crossmarkConnect, disconnect: crossmarkDisconnect, loading: crossmarkLoading } = useCrossmark();

  const handleConnectWallet = async (connectorId: string) => {
    await connect(connectorId)
    console.log("handleConnectWallet - address after connect:", address);
    if (address) { // EVM 지갑 연결 시
      const isRegistered = await checkAndRegisterUser(address, 'evm');
      if (isRegistered) {
        router.push("/dashboard");
      } else {
        router.push("/survey");
      }
    }
  }

  const checkAndRegisterUser = async (walletAddress: string, type: 'evm' | 'xrpl') => {
    console.log(`checkAndRegisterUser called with: ${walletAddress}, type: ${type}`);
    let queryParam = '';
    if (type === 'evm') {
      queryParam = `evm_wallet_address=${walletAddress}`;
    } else if (type === 'xrpl') {
      queryParam = `xrpl_wallet_address=${walletAddress}`;
    }

    try {
      // 1. Check if user exists
      const checkResponse = await fetch(`/api/user/profile?${queryParam}`);
      if (checkResponse.ok) {
        console.log("User already registered. Redirecting to dashboard.");
        return true; // User exists
      } else if (checkResponse.status === 404) {
        console.log("User not found. Proceeding with registration.");
        // 2. If user does not exist, register them
        let bodyData: any = {
          risk_profile: "", // 초기값
          experience: [], // 초기값
          delegated: false, // 초기값
          delegated_at: null, // 초기값
        };

        if (type === 'evm') {
          bodyData.evm_wallet_address = walletAddress;
        } else if (type === 'xrpl') {
          bodyData.xrpl_wallet_address = walletAddress;
        }

        const registerResponse = await fetch("/api/user/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        });

        if (!registerResponse.ok) {
          const errorData = await registerResponse.json();
          console.error("Failed to register user:", errorData.detail);
          alert(`Failed to register user: ${errorData.detail}`);
          return false;
        } else {
          console.log("User registered successfully!");
          return false; // User was just registered, redirect to survey
        }
      } else {
        // Handle other potential errors from profile check
        const errorData = await checkResponse.json();
        console.error("Error checking user profile:", errorData.detail);
        alert(`Error checking user profile: ${errorData.detail}`);
        return false;
      }
    } catch (error) {
      console.error("Error in checkAndRegisterUser:", error);
      alert("Error processing user registration.");
      return false;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/placeholder.svg?height=40&width=40"
            alt="XRP AI Trading"
            width={40}
            height={40}
            className="mr-2"
          />
          <h1 className="text-xl font-bold">XRP AI Trading</h1>
        </div>
        {/* EVM, XRPL, Crossmark 연결 상태별 분기 */}
        {isConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => disconnect()}>
                Disconnect Wallet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : crossmarkAccount ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <img src="https://crossmark.io/favicon.ico" alt="Crossmark" style={{ width: 20, height: 20 }} />
                {crossmarkAccount.slice(0, 6)}...{crossmarkAccount.slice(-4)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => crossmarkDisconnect()}>
                Disconnect Crossmark
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : xrplAccount ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <img src="https://xaman.app/favicon.ico" alt="Xaman" style={{ width: 20, height: 20 }} />
                {xrplAccount.slice(0, 6)}...{xrplAccount.slice(-4)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => xrplLogout()}>
                Disconnect Xaman
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isPending || crossmarkLoading || xrplLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isPending || crossmarkLoading || xrplLoading ? "Connecting..." : "Connect Wallet"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {connectors.map((connector) => (
                <DropdownMenuItem
                  key={connector.id}
                  onClick={() => handleConnectWallet(connector.id)}
                >
                  {connector.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                key="xaman"
                onClick={async () => {
                  const result = await xrplLogin();
                  // XRPL 계정이 실제로 연결된 경우에만 이동
                  setTimeout(() => {
                    if (typeof window !== "undefined") {
                      const xrplAccount = window.localStorage.getItem("xrplAccount");
                      if (xrplAccount) router.push("/survey");
                    }
                  }, 500);
                }}
              >
                <img src="https://xaman.app/favicon.ico" alt="Xaman" style={{ width: 20, height: 20, marginRight: 8 }} />
                Xaman (XRPL)
              </DropdownMenuItem>
              <DropdownMenuItem
                key="crossmark"
                onClick={async () => {
                  await crossmarkConnect();
                  // Crossmark 계정이 실제로 연결된 경우에만 이동
                  setTimeout(() => {
                    if (typeof window !== "undefined") {
                      const crossmarkAccount = window.localStorage.getItem("crossmarkAccount");
                      if (crossmarkAccount) router.push("/survey");
                    }
                  }, 500);
                }}
              >
                <img src="https://crossmark.io/favicon.ico" alt="Crossmark" style={{ width: 20, height: 20, marginRight: 8 }} />
                Crossmark (XRPL)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-3xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">AI-Powered XRP Trading</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">
              AI-based XRP DeFi trading assistant for non-technical users
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="mb-4 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto h-10 w-10"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium">Maximize Returns</h3>
              <p className="text-muted-foreground mt-2">AI-optimized strategies to maximize your XRP returns</p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="mb-4 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto h-10 w-10"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium">Risk Management</h3>
              <p className="text-muted-foreground mt-2">Personalized risk profiles to match your comfort level</p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="mb-4 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto h-10 w-10"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium">AI Assistant</h3>
              <p className="text-muted-foreground mt-2">Chat with our AI to understand strategies and market trends</p>
            </div>
          </div>

          {!isConnected && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={isPending}
                  size="lg"
                  className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isPending ? "Connecting..." : "Get Started Now"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {connectors.map((connector) => (
                  <DropdownMenuItem
                    key={connector.id}
                    onClick={() => handleConnectWallet(connector.id)}
                  >
                    {connector.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  key="xaman"
                  onClick={async () => {
                  const result = await xrplLogin();
                  console.log("Xaman login result:", result);
                  if (result && result.me && result.me.sub) { // XUMM 연결 성공 시
                    const isRegistered = await checkAndRegisterUser(result.me.sub, 'xrpl');
                    if (isRegistered) {
                      router.push("/dashboard");
                    } else {
                      router.push("/survey");
                    }
                  }
                }}
                >
                  <img src="https://xaman.app/favicon.ico" alt="Xaman" style={{ width: 20, height: 20, marginRight: 8 }} />
                  Xaman (XRPL)
                </DropdownMenuItem>
                <DropdownMenuItem
                  key="crossmark"
                  onClick={async () => {
                  const result = await crossmarkConnect();
                  console.log("Crossmark connect result:", result);
                  if (result) { // Crossmark 연결 성공 시
                    const isRegistered = await checkAndRegisterUser(result, 'xrpl');
                    if (isRegistered) {
                      router.push("/dashboard");
                    } else {
                      router.push("/survey");
                    }
                  }
                }}
                >
                  <img src="https://crossmark.io/favicon.ico" alt="Crossmark" style={{ width: 20, height: 20, marginRight: 8 }} />
                  Crossmark (XRPL)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} XRP AI Trading Assistant. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
