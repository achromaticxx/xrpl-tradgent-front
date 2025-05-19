"use client"

import { useState, useEffect } from "react"
import { NavigationBar } from "@/components/navigation-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpRight, ArrowDownRight, TrendingUp, AlertTriangle, Shield } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendItem,
  ChartLine,
  ChartLineArea,
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
} from "@/components/ui/chart"

// Mock data for the dashboard
const mockTradeHistory = [
  {
    id: "1",
    date: "2025-05-15",
    description: "Spot buy XRP",
    profit: "+5.2%",
    isProfit: true,
    rationale: "Bullish momentum detected, support level established",
    txHash: "0x1a2b3c4d5e6f...",
  },
  {
    id: "2",
    date: "2025-05-10",
    description: "Liquidity provision on DEX",
    profit: "+2.8%",
    isProfit: true,
    rationale: "Low volatility period, optimal for fee collection",
    txHash: "0x7e8f9a0b1c2d...",
  },
  {
    id: "3",
    date: "2025-05-05",
    description: "Spot sell XRP",
    profit: "-1.5%",
    isProfit: false,
    rationale: "Resistance level reached, taking profits",
    txHash: "0x3d4e5f6a7b8c...",
  },
  {
    id: "4",
    date: "2025-04-28",
    description: "Staking position",
    profit: "+3.1%",
    isProfit: true,
    rationale: "Accumulation phase, earning passive income",
    txHash: "0x9a0b1c2d3e4f...",
  },
  {
    id: "5",
    date: "2025-04-20",
    description: "Yield farming",
    profit: "+4.7%",
    isProfit: true,
    rationale: "High APY opportunity identified",
    txHash: "0x5f6a7b8c9d0e...",
  },
]

// Mock performance data for the chart
const generatePerformanceData = (days: number) => {
  const data = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  let value = 1000 // Starting value

  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    // Random daily change between -3% and +5%
    const change = (Math.random() * 8 - 3) / 100
    value = value * (1 + change)

    data.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(value * 100) / 100,
    })
  }

  return data
}

export default function DashboardPage() {
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState("30")
  const [riskPreference, setRiskPreference] = useState<string>("")

  useEffect(() => {
    // Load risk preference from localStorage
    const storedRiskPreference = localStorage.getItem("riskPreference")
    if (storedRiskPreference) {
      setRiskPreference(storedRiskPreference)
    }

    // Generate performance data based on selected time range
    setPerformanceData(generatePerformanceData(Number.parseInt(timeRange)))
  }, [timeRange])

  // Calculate expected return based on risk preference
  const getExpectedReturn = () => {
    switch (riskPreference) {
      case "low":
        return "5-10%"
      case "medium":
        return "10-20%"
      case "high":
        return "20-40%"
      default:
        return "10-20%"
    }
  }

  // Get current strategy description based on risk preference
  const getCurrentStrategy = () => {
    switch (riskPreference) {
      case "low":
        return {
          title: "Conservative Growth",
          description:
            "Balanced portfolio with 70% spot holdings and 30% staking for passive income. Focus on capital preservation with steady growth.",
          icon: <Shield className="h-8 w-8 text-blue-500" />,
        }
      case "medium":
        return {
          title: "Balanced Opportunity",
          description:
            "Diversified approach with 50% spot trading, 30% liquidity provision, and 20% yield farming to capture market opportunities while managing risk.",
          icon: <TrendingUp className="h-8 w-8 text-green-500" />,
        }
      case "high":
        return {
          title: "Aggressive Growth",
          description:
            "High-growth strategy with 40% spot trading, 40% yield farming in emerging protocols, and 20% leveraged positions to maximize returns.",
          icon: <AlertTriangle className="h-8 w-8 text-orange-500" />,
        }
      default:
        return {
          title: "Balanced Opportunity",
          description:
            "Diversified approach with 50% spot trading, 30% liquidity provision, and 20% yield farming to capture market opportunities while managing risk.",
          icon: <TrendingUp className="h-8 w-8 text-green-500" />,
        }
    }
  }

  const strategy = getCurrentStrategy()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavigationBar />

      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Expected Annual Return</CardTitle>
              <CardDescription>Based on your risk profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-4xl font-bold text-primary">{getExpectedReturn()}</div>
                <div className="ml-auto bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-xs font-medium">
                  {riskPreference ? riskPreference.charAt(0).toUpperCase() + riskPreference.slice(1) : "Medium"} Risk
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Current Strategy</CardTitle>
              <CardDescription>AI-optimized for your preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start">
                <div className="mr-4">{strategy.icon}</div>
                <div>
                  <h3 className="font-medium">{strategy.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance</CardTitle>
                  <CardDescription>Portfolio value over time</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                    <SelectItem value="180">180 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  data={performanceData}
                  xField="date"
                  yField="value"
                  margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
                >
                  <ChartGrid vertical horizontal />
                  <ChartXAxis />
                  <ChartYAxis />
                  <ChartLine curve="monotone" strokeWidth={2} className="stroke-primary" />
                  <ChartLineArea curve="monotone" className="fill-primary/20 stroke-none" />
                  <ChartTooltip>
                    <ChartTooltipContent className="bg-background border shadow-sm rounded-md p-2">
                      {({ point }) => (
                        <div className="text-sm">
                          <div className="font-medium">{point.date}</div>
                          <div className="text-muted-foreground">Value: ${point.value.toFixed(2)}</div>
                        </div>
                      )}
                    </ChartTooltipContent>
                  </ChartTooltip>
                  <ChartLegend className="flex justify-center mt-2">
                    <ChartLegendItem name="Portfolio Value" className="text-xs text-muted-foreground" />
                  </ChartLegend>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trade History</CardTitle>
                  <CardDescription>Recent trading activity</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Profit/Loss</TableHead>
                    <TableHead className="hidden md:table-cell">Rationale</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTradeHistory.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">{trade.date}</TableCell>
                      <TableCell>{trade.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {trade.isProfit ? (
                            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                          )}
                          <span className={trade.isProfit ? "text-green-500" : "text-red-500"}>{trade.profit}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate">{trade.rationale}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-center space-x-2 py-4">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
