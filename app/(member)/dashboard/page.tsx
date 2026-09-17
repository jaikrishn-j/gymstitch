import React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  Check,
  Clock3,
  Dumbbell,
  HeartPulse,
  Info,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LogWeightDialog } from "../components/log-weight-dialog";
import { WeightChart } from "../components/weight-chart";
import { getDashboardData } from "./actions";



function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

function StatCard({
  title,
  value,
  unit,
  description,
  tooltip,
  icon: Icon,
}: {
  title: string;
  value: string;
  unit?: string;
  description?: string;
  tooltip?: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {value}
          {unit && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default async function DashboardPage() {
  const { member, plan, daysUsed, planProgress } = await getDashboardData();

  const weightHistory = [
    { date: "Sep 01", weight: 75.2 },
    { date: "Sep 03", weight: 74.8 },
    { date: "Sep 05", weight: 74.5 },
    { date: "Sep 08", weight: 74.1 },
    { date: "Sep 10", weight: 73.7 },
    { date: "Sep 12", weight: 73.2 },
    { date: "Sep 14", weight: 72.8 },
    { date: "Sep 17", weight: 72.4 },
  ];

  return (
    <main className="w-full min-h-screen bg-background pb-12">
      <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
        
        {/* HEADER */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border">
              <AvatarImage src="" alt={member.name} />
              <AvatarFallback className="font-semibold text-lg bg-primary/10 text-primary">
                {member.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {getGreeting()}, {member.name}
                </h1>
                <Badge variant="outline" className="hidden sm:inline-flex gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" /> Member
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Here is your active membership overview and health tracking.
              </p>
            </div>
          </div>

          <LogWeightDialog currentWeight={member.currentWeight} />
        </div>

        {/* TAB NAVIGATION */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="plan">Plan Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Current Weight"
                value={member.currentWeight.toString()}
                unit="kg"
                description="Latest measurement"
                tooltip="Measured today"
                icon={Activity}
              />
              <StatCard
                title="Target Weight"
                value={member.targetWeight.toString()}
                unit="kg"
                description={`${(
                  member.currentWeight - member.targetWeight
                ).toFixed(1)} kg remaining`}
                icon={Target}
              />
              <StatCard
                title="Height"
                value={member.height.toString()}
                unit="cm"
                description="Current height"
                icon={Activity}
              />
              <StatCard
                title="Body Mass Index"
                value={member.bmi.toString()}
                description="Normal Range (18.5 - 24.9)"
                tooltip="Calculated automatically based on weight and height"
                icon={HeartPulse}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Isolated Client Component for Chart */}
              <WeightChart weightHistory={weightHistory} />

              {plan.totalDays === 0 ? (
                <Card className="flex flex-col items-center justify-center text-center p-8 lg:col-span-2">
                  <CardContent className="space-y-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <Info className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">No Active Plan</CardTitle>
                      <CardDescription>
                        You don&apos;t have an active membership plan yet. Select a plan to get started.
                      </CardDescription>
                    </div>
                    <Link href="/dashboard/plan">
                      <button className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                        Select a Plan
                      </button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <Card className="flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Active Membership</CardTitle>
                      {plan.daysRemaining <= 3 ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" /> Expiring Soon
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
                          <Check className="mr-1 h-3 w-3" /> Active
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{plan.name}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {plan.daysRemaining <= 3 && plan.daysRemaining > 0 && (
                      <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/50">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0 dark:text-amber-400" />
                          <div className="text-sm">
                            <p className="font-medium text-amber-800 dark:text-amber-300">
                              Only {plan.daysRemaining} day{plan.daysRemaining !== 1 ? "s" : ""} left!
                            </p>
                            <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                              Your membership is expiring soon. Recharge now to avoid interruption.
                            </p>
                          </div>
                        </div>
                        <Link href="/dashboard/plan" className="mt-2 inline-block">
                          <button className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-1.5 text-xs font-medium text-white shadow hover:bg-amber-700 transition-colors">
                            Recharge Now
                          </button>
                        </Link>
                      </div>
                    )}

                    <div className="rounded-lg bg-muted/40 p-4 border text-center">
                      <p className="text-3xl font-bold tracking-tight">
                        {plan.daysRemaining}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground mt-1">
                        Days Remaining
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{planProgress}%</span>
                      </div>
                      <Progress value={planProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">
                        {daysUsed} of {plan.totalDays} days used
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="bg-muted/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Frequency</p>
                    <p className="text-sm font-semibold">{member.workoutFrequency}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Primary Goal</p>
                    <p className="text-sm font-semibold">{member.goal}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                    <UserRound className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Fitness Level</p>
                    <p className="text-sm font-semibold">{member.fitnessLevel}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Body Details</CardTitle>
                  <CardDescription>
                    Your recorded physical measurements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    <DetailRow label="Age" value={`${member.age} years`} />
                    <DetailRow label="Gender" value={member.gender} />
                    <DetailRow label="Height" value={`${member.height} cm`} />
                    <DetailRow label="Current Weight" value={`${member.currentWeight} kg`} />
                    <DetailRow label="Target Weight" value={`${member.targetWeight} kg`} />
                    <DetailRow label="BMI" value={member.bmi.toString()} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fitness Profile</CardTitle>
                  <CardDescription>
                    Your current fitness regime specifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    <DetailRow label="Fitness Level" value={member.fitnessLevel} />
                    <DetailRow label="Primary Goal" value={member.goal} />
                    <DetailRow label="Workout Frequency" value={member.workoutFrequency} />
                    <DetailRow label="Target Weight" value={`${member.targetWeight} kg`} />
                    <DetailRow
                      label="Remaining Weight to Lose"
                      value={`${(member.currentWeight - member.targetWeight).toFixed(1)} kg`}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plan">
            <Card>
              <CardHeader>
                <CardTitle>Plan Breakdown</CardTitle>
                <CardDescription>Comprehensive details regarding your membership status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {plan.totalDays === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                      <Info className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No plan found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You don&apos;t have an active membership plan.
                    </p>
                    <Link href="/dashboard/plan" className="mt-4">
                      <button className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                        Select a Plan
                      </button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/20">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Start Date</p>
                          <p className="text-sm font-medium">{plan.startedAt}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/20">
                        <Clock3 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Expiry Date</p>
                          <p className="text-sm font-medium">{plan.expiresAt}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/20">
                        {plan.daysRemaining <= 3 ? (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        ) : (
                          <Check className="h-5 w-5 text-emerald-500" />
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          {plan.daysRemaining <= 3 ? (
                            <p className="text-sm font-medium text-amber-600">Expiring Soon</p>
                          ) : (
                            <p className="text-sm font-medium text-emerald-600">Active</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Membership Completion</span>
                        <span className="font-semibold">{planProgress}%</span>
                      </div>
                      <Progress value={planProgress} className="h-3" />
                      <p className="text-xs text-muted-foreground text-right">
                        {plan.daysRemaining} of {plan.totalDays} days remaining
                      </p>
                    </div>

                    {plan.planBreakdown.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <p className="text-sm font-medium">Plan Snapshot</p>
                          <div className="rounded-lg border divide-y">
                            {plan.planBreakdown.map((p, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-3 bg-muted/20"
                              >
                                <div>
                                  <p className="text-sm font-medium">{p.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Paid on {p.paidAt}
                                  </p>
                                </div>
                                <Badge variant="outline">{p.durationDays} days</Badge>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
                            <p className="text-sm font-medium">Total Combined Days</p>
                            <Badge variant="default">{plan.totalDays} days</Badge>
                          </div>
                        </div>
                      </>
                    )}

                    {plan.daysRemaining <= 3 && plan.daysRemaining > 0 && (
                      <>
                        <Separator />
                        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/50">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0 dark:text-amber-400" />
                            <div className="text-sm">
                              <p className="font-medium text-amber-800 dark:text-amber-300">
                                Membership expiring in {plan.daysRemaining} day{plan.daysRemaining !== 1 ? "s" : ""}
                              </p>
                              <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                                Recharge now to keep your membership active without interruption.
                              </p>
                            </div>
                          </div>
                          <Link href="/dashboard/plan" className="mt-3 inline-block">
                            <button className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-1.5 text-xs font-medium text-white shadow hover:bg-amber-700 transition-colors">
                              Recharge Now
                            </button>
                          </Link>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}