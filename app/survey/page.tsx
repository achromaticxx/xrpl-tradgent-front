"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"

export default function SurveyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const [ceFiExperience, setCeFiExperience] = useState<string[]>([])
  const [deFiExperience, setDeFiExperience] = useState<string[]>([])
  const [riskPreference, setRiskPreference] = useState<string>("")

  const handleCeFiChange = (value: string) => {
    setCeFiExperience((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const handleDeFiChange = (value: string) => {
    setDeFiExperience((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = () => {
    // Save survey data
    localStorage.setItem("surveyCompleted", "true")
    localStorage.setItem("ceFiExperience", JSON.stringify(ceFiExperience))
    localStorage.setItem("deFiExperience", JSON.stringify(deFiExperience))
    localStorage.setItem("riskPreference", riskPreference)

    // Navigate to dashboard
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Trading Experience Survey</CardTitle>
          <CardDescription>Help us personalize your trading experience</CardDescription>
          <Progress value={(step / totalSteps) * 100} className="mt-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">CeFi Experience</h3>
              <p className="text-sm text-muted-foreground">Select all traditional finance experiences you have:</p>

              <div className="space-y-3">
                {[
                  { id: "stocks", label: "Stocks Trading" },
                  { id: "crypto", label: "Centralized Crypto Exchanges" },
                  { id: "forex", label: "Forex Trading" },
                  { id: "options", label: "Options Trading" },
                  { id: "futures", label: "Futures Trading" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={ceFiExperience.includes(item.id)}
                      onCheckedChange={() => handleCeFiChange(item.id)}
                    />
                    <Label htmlFor={item.id}>{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">DeFi Experience</h3>
              <p className="text-sm text-muted-foreground">Select all decentralized finance experiences you have:</p>

              <div className="space-y-3">
                {[
                  { id: "dex", label: "DEX Trading" },
                  { id: "staking", label: "Staking" },
                  { id: "yield", label: "Yield Farming" },
                  { id: "lending", label: "DeFi Lending" },
                  { id: "liquidity", label: "Liquidity Provision" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={deFiExperience.includes(item.id)}
                      onCheckedChange={() => handleDeFiChange(item.id)}
                    />
                    <Label htmlFor={item.id}>{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Risk Preference</h3>
              <p className="text-sm text-muted-foreground">
                Select your preferred risk level for AI trading strategies:
              </p>

              <RadioGroup value={riskPreference} onValueChange={setRiskPreference}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low Risk (Conservative returns, minimal volatility)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium Risk (Balanced approach)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High Risk (Aggressive strategies, higher volatility)</Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {step < totalSteps ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!riskPreference}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Submit
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
