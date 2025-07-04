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

export default function HomePage() {
  const router = useRouter()
  const { address, isConnected, isPending, connectors, connect, disconnect } = useWallet()
  const { account: xrplAccount, login: xrplLogin, logout: xrplLogout, loading: xrplLoading } = useXumm()

  const handleConnectWallet = async (connectorId: string) => {
    await connect(connectorId)
    // Check if survey is completed
    const surveyCompleted = localStorage.getItem("surveyCompleted")
    if (surveyCompleted) {
      router.push("/dashboard")
    } else {
      router.push("/survey")
    }
  }

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
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isPending}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isPending ? "Connecting..." : "Connect Wallet"}
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
                  await xrplLogin();
                  router.push("/survey");
                }}
              >
                <img src="https://xaman.app/favicon.ico" alt="Xaman" style={{ width: 20, height: 20, marginRight: 8 }} />
                Xaman (XRPL)
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
                    await xrplLogin();
                    router.push("/survey");
                  }}
                >
                  <img src="https://xaman.app/favicon.ico" alt="Xaman" style={{ width: 20, height: 20, marginRight: 8 }} />
                  Xaman (XRPL)
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
