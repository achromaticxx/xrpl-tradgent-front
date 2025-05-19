"use client"

import type * as React from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Area, ResponsiveContainer } from "recharts"

interface ChartProps {
  data: any[]
  xField: string
  yField: string
  margin?: { top: number; right: number; bottom: number; left: number }
  children: React.ReactNode
}

const ChartContainer = ({ data, xField, yField, margin, children }: ChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={margin}>
        {children}
      </LineChart>
    </ResponsiveContainer>
  )
}

interface ChartLineProps {
  curve?: "monotone" | "linear" | "natural"
  strokeWidth?: number
  className?: string
}

const ChartLine = ({ curve = "monotone", strokeWidth = 2, className }: ChartLineProps) => {
  return (
    <Line
      type={curve}
      dataKey="value"
      strokeWidth={strokeWidth}
      stroke="var(--primary)"
      className={className}
      dot={false}
    />
  )
}

const ChartLineArea = ({ curve = "monotone", className }: ChartLineProps) => {
  return <Area type={curve} dataKey="value" fill="var(--primary)" className={className} />
}

const ChartGrid = ({ vertical = true, horizontal = true }: { vertical?: boolean; horizontal?: boolean }) => {
  return <CartesianGrid strokeDasharray="3 3" vertical={vertical} horizontal={horizontal} stroke="var(--border)" />
}

const ChartXAxis = () => {
  return <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)" }} stroke="var(--border)" />
}

const ChartYAxis = () => {
  return <YAxis tick={{ fill: "var(--muted-foreground)" }} stroke="var(--border)" />
}

interface ChartTooltipContentProps {
  children: (props: { point: any }) => React.ReactNode
}

const ChartTooltipContent = ({ children }: ChartTooltipContentProps) => {
  const renderTooltip = (props: any) => {
    if (!props.active || !props.payload || props.payload.length === 0) {
      return null
    }

    const point = props.payload[0].payload

    return children({ point })
  }

  return <Tooltip content={renderTooltip} />
}

const ChartTooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const ChartLegendItem = ({ name, className }: { name: string; className?: string }) => {
  return <span className={className}>{name}</span>
}

const ChartLegend = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={className}>{children}</div>
}

export {
  ChartContainer,
  ChartLine,
  ChartLineArea,
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendItem,
}
