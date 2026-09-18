"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Target, Activity, Loader2, TrendingDown, TrendingUp, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { setWeightGoal, type WeightGoalData } from "./actions";

interface SettingsContentProps {
  data: WeightGoalData;
}

export function SettingsContent({ data }: SettingsContentProps) {
  const { currentWeight, targetWeight, weightDiff, recentLogs } = data;
  const [newTarget, setNewTarget] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(newTarget);
    if (isNaN(value) || value <= 0) {
      toast.error("Please enter a valid weight.");
      return;
    }

    setLoading(true);
    try {
      const result = await setWeightGoal(value);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Weight goal updated!");
        setNewTarget("");
        window.location.reload();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Current Goal Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Weight Goal</CardTitle>
            </div>
            {targetWeight > 0 ? (
              <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">No Goal Set</Badge>
            )}
          </div>
          <CardDescription>
            Set a target weight to track your fitness journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4 bg-muted/20">
              <p className="text-xs text-muted-foreground font-medium">
                Current Weight
              </p>
              <p className="text-2xl font-bold mt-1">
                {currentWeight > 0 ? `${currentWeight}` : "—"}
                {currentWeight > 0 && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    kg
                  </span>
                )}
              </p>
            </div>

            <div className="rounded-lg border p-4 bg-muted/20">
              <p className="text-xs text-muted-foreground font-medium">
                Target Weight
              </p>
              <p className="text-2xl font-bold mt-1">
                {targetWeight > 0 ? `${targetWeight}` : "—"}
                {targetWeight > 0 && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    kg
                  </span>
                )}
              </p>
            </div>

            <div className="rounded-lg border p-4 bg-muted/20">
              <p className="text-xs text-muted-foreground font-medium">
                Remaining
              </p>
              <div className="flex items-center gap-2 mt-1">
                {weightDiff > 0 ? (
                  <TrendingDown className="h-5 w-5 text-emerald-500" />
                ) : weightDiff < 0 ? (
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                ) : (
                  <Minus className="h-5 w-5 text-muted-foreground" />
                )}
                <p className="text-2xl font-bold">
                  {targetWeight > 0 && currentWeight > 0
                    ? Math.abs(weightDiff)
                    : "—"}
                  {targetWeight > 0 && currentWeight > 0 && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      kg
                    </span>
                  )}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {weightDiff > 0
                  ? "left to lose"
                  : weightDiff < 0
                    ? "over target"
                    : ""}
              </p>
            </div>
          </div>

          {targetWeight > 0 && currentWeight > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Progress</span>
                  <span>
                    {Math.min(
                      100,
                      Math.round(
                        ((currentWeight - weightDiff - targetWeight) /
                          (currentWeight - targetWeight || 1)) *
                          100
                      )
                    ) || 0}
                    %
                  </span>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Set New Goal */}
          <div>
            <p className="text-sm font-medium mb-3">
              {targetWeight > 0 ? "Update Target Weight" : "Set Target Weight"}
            </p>
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 max-w-xs space-y-1.5">
                <Label htmlFor="targetWeight">Target (kg)</Label>
                <div className="relative">
                  <Input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    min="1"
                    max="500"
                    placeholder={targetWeight > 0 ? String(targetWeight) : "e.g. 68"}
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="pr-12"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                    kg
                  </span>
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Target className="mr-2 h-4 w-4" />
                )}
                {targetWeight > 0 ? "Update" : "Set Goal"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Recent Weight Logs */}
      {recentLogs.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Recent Weight Logs</CardTitle>
            </div>
            <CardDescription>
              Your latest recorded weight entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border divide-y">
              {recentLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-muted/20"
                >
                  <p className="text-sm text-muted-foreground">{log.date}</p>
                  <p className="text-sm font-semibold">{log.weight} kg</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
