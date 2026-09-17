"use client";

import React from "react";
import { TrendingDown } from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface WeightDataPoint {
  date: string;
  weight: number;
}

interface WeightChartProps {
  weightHistory: WeightDataPoint[];
}

export function WeightChart({ weightHistory }: WeightChartProps) {
  const weightLost =
    weightHistory.length > 0
      ? weightHistory[0].weight - weightHistory[weightHistory.length - 1].weight
      : 0;

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Weight Progress</CardTitle>
          <CardDescription>Recorded trajectory over time</CardDescription>
        </div>
        <Badge
          variant="secondary"
          className="flex gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
        >
          <TrendingDown className="h-3.5 w-3.5" />
          {weightLost.toFixed(1)} kg lost
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer
          config={{
            weight: {
              label: "Weight (kg)",
              color: "hsl(var(--primary))",
            },
          }}
          className="h-[280px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={weightHistory}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={45}
              domain={["dataMin - 1", "dataMax + 1"]}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) => <span>{value} kg</span>}
                />
              }
            />
            <Line
              dataKey="weight"
              type="monotone"
              stroke="var(--color-weight)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--color-weight)" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}