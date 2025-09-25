'use client'

import * as React from 'react'
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
} from 'recharts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

type ChartProps = {
  data: any[]
  dateKey: string
  dataKeys: { key: string; label: string; color: string }[]
  title: string
  description?: string
  referenceDate?: string
  enableTimeRangeSelector?: boolean
}

export function DynamicAreaChart({
  data,
  dateKey,
  dataKeys,
  title,
  description = '',
  referenceDate = new Date().toISOString().split('T')[0],
  enableTimeRangeSelector = true,
}: ChartProps) {
  const [timeRange, setTimeRange] = React.useState('90d')

  const filteredData = data.filter((item) => {
    const date = new Date(item[dateKey])
    const refDate = new Date(referenceDate)
    let days = 90
    if (timeRange === '30d') days = 30
    if (timeRange === '7d') days = 7
    const from = new Date(refDate)
    from.setDate(from.getDate() - days)
    return date >= from && date <= refDate
  })

  return (
    <Card className="pt-0 bg-glass-bg bg-background/90 border border-glass-border backdrop-blur-md shadow-sm text-foreground transition-colors">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {enableTimeRangeSelector && (
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="hidden w-[160px] sm:flex bg-background border border-border text-sm">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={Object.fromEntries(
            dataKeys.map(({ key, label, color }) => [
              key,
              { label, color },
            ])
          )}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              {dataKeys.map(({ key, color }) => (
                <linearGradient id={`fill-${key}`} key={key} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey={dateKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                  indicator="dot"
                />
              }
            />
            {dataKeys.map(({ key, color }) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`url(#fill-${key})`}
                stroke={color}
                stackId="a"
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
