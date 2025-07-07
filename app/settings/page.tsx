"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { NavigationBar } from "@/components/navigation-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/hooks/useWallet"
import { useXumm } from "@/hooks/useXumm"
import { useCrossmark } from "@/hooks/useCrossmark"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Wallet, RefreshCw, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { address, isConnected } = useWallet()
  const { account: xrplAccount } = useXumm()
  const { account: crossmarkAccount, disconnect: crossmarkDisconnect } = useCrossmark();

  // 연결 상태 및 주소 결정 (EVM > Crossmark > XRPL), 빈 문자열 방지
  const connectedAddress =
    isConnected && address && address.length > 0
      ? address
      : crossmarkAccount && crossmarkAccount.length > 0
      ? crossmarkAccount
      : xrplAccount && xrplAccount.length > 0
      ? xrplAccount
      : null;
  const anyConnected = !!connectedAddress;

  const [riskPreference, setRiskPreference] = useState<string>("")
  const [experience, setExperience] = useState<string[]>([])

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!connectedAddress) return;

      try {
        const response = await fetch(`http://localhost:8000/user/api/user/profile?xrpl_wallet_address=${connectedAddress}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.data) {
          setRiskPreference(data.data.risk_profile || "");
          setExperience(data.data.experience || []);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, [connectedAddress]);

  const handleRiskChange = async (value: string) => {
    setRiskPreference(value)
    if (!connectedAddress) return;

    try {
      const response = await fetch("http://localhost:8000/user/api/user/set_risk_profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          xrpl_wallet_address: connectedAddress,
          risk_profile: value,
          experience: experience, // 기존 experience 값을 함께 보냅니다.
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Risk preference updated successfully in backend.");
    } catch (error) {
      console.error("Failed to update risk preference in backend:", error);
    }
  }

  const handleRetakeSurvey = () => {
    router.push("/survey")
  }

  const handleResetStrategy = () => {
    // In a real app, this would reset the AI strategy
    // For this demo, we'll just show a success message
    alert("Strategy has been reset successfully!")
  }

  
    return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavigationBar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {/* 연결된 지갑 종류별 아이콘 및 주소 */}
                {isConnected && <Wallet className="mr-2 h-5 w-5" />}
                {crossmarkAccount && (
                  <img src="https://crossmark.io/favicon.ico" alt="Crossmark" style={{ width: 20, height: 20, marginRight: 8 }} />
                )}
                {xrplAccount && !isConnected && !crossmarkAccount && (
                  <img src="https://xaman.app/favicon.ico" alt="Xaman" style={{ width: 20, height: 20, marginRight: 8 }} />
                )}
                Wallet Information
              </CardTitle>
              <CardDescription>Your connected wallet details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Connected Address</Label>
                  <div className="flex items-center mt-1">
                    <div className="bg-muted p-2 rounded-md text-sm font-mono break-all">
                      {anyConnected ? connectedAddress : "No wallet connected"}
                    </div>
                    {/* Crossmark 해제 버튼 */}
                    {crossmarkAccount && (
                      <Button size="sm" variant="outline" className="ml-2" onClick={crossmarkDisconnect}>
                        Disconnect Crossmark
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Connection Status</Label>
                  <div className="flex items-center mt-1">
                    <div className={`h-2 w-2 rounded-full ${anyConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                    <span className="text-sm">{anyConnected ? "Connected" : "Disconnected"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Preference</CardTitle>
              <CardDescription>Adjust your risk tolerance for AI trading strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={riskPreference} onValueChange={handleRiskChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low Risk (Conservative returns, minimal volatility)</Label>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium Risk (Balanced approach)</Label>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High Risk (Aggressive strategies, higher volatility)</Label>
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Changing your risk preference will adjust the AI's trading strategy recommendations.
              </p>
            </CardFooter>
          </Card>
        </div>

        <Separator className="my-6" />

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Account Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Re-take Survey
                </CardTitle>
                <CardDescription>Update your trading preferences and experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Re-taking the survey will allow you to update your trading experience and preferences. This helps our
                  AI provide more accurate recommendations.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={handleRetakeSurvey}>Re-take Survey</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Reset Strategy
                </CardTitle>
                <CardDescription>Reset your AI trading strategy to default</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This will reset your AI trading strategy to the default settings based on your risk preference. Any
                  customizations will be lost.
                </p>
              </CardContent>
              <CardFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Reset Strategy</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will reset your AI trading strategy to default settings. Any customizations or
                        optimizations will be lost.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetStrategy}>Reset Strategy</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
