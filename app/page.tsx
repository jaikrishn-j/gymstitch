import Link from "next/link";
import { 
  Show, 
  SignInButton, 
  UserButton 
} from "@clerk/nextjs";
import { 
  ArrowRight, 
  Bell, 
  Check, 
  CreditCard, 
  Dumbbell, 
  Users, 
  TrendingDown, 
  Zap, 
  Lock, 
  IndianRupee, 
  Activity, 
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Minimalist Topbar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Gym Stitch</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Workflow</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          </nav>

          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <Link href='/login' className="hidden sm:block">
                <Button variant="ghost" >Log in</Button>
              </Link>
               <Link href='/register'>
                <Button >Get Started</Button>
              </Link>
            </Show>
            <Show when="signed-in">
              <Button variant="secondary"  >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>

      {/* Clean Apple-Style Hero */}
      <section className="py-24 lg:py-32 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-col items-center">
          <Badge variant="secondary" className="mb-6">The Modern Gym OS</Badge>
          
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl mb-6">
            Your Gym. <br />
            In Your Pocket.
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mb-10">
            Track goals. Renew plans. Log payments. Seamlessly designed for members to train and owners to scale.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Show when="signed-in">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button size="lg" className="w-full sm:w-auto">
                  Join the Portal
                </Button>
              </SignInButton>
            </Show>
            <Button size="lg" variant="outline"  className="w-full sm:w-auto">
              <a href="#features">Explore Features</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Sleek Mobile Preview without heavy borders */}
      <section className="pb-24 flex justify-center px-4">
         <div className="w-full max-w-sm rounded-[2.5rem] border-[8px] border-muted bg-background overflow-hidden shadow-xl">
            <div className="flex h-12 items-center justify-between border-b px-4 bg-muted/30">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                <span className="text-xs font-semibold">Gym Stitch</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">Active Member</Badge>
            </div>

            <div className="p-4 space-y-4">
              <Card>
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">Pro Annual</CardTitle>
                  <span className="text-xs text-muted-foreground">120 Days Left</span>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Progress value={65} className="h-2" />
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Current Weight</p>
                    <p className="mt-1 text-2xl font-semibold">74.5<span className="text-sm text-muted-foreground">kg</span></p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Goal Weight</p>
                    <p className="mt-1 text-2xl font-semibold">70.0<span className="text-sm text-muted-foreground">kg</span></p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
      </section>

      {/* NEW: Clean Step Loader Section */}
      <section id="how-it-works" className="py-24 bg-muted/20 border-y">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight">Three steps to start.</h2>
            <p className="text-muted-foreground mt-2">Fast setup. Zero friction.</p>
          </div>

          <div className="relative flex flex-col md:flex-row items-start justify-between gap-12 md:gap-4">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-6 left-12 right-12 h-[2px] bg-border -z-10" />
            <div className="hidden md:block absolute top-6 left-12 w-1/3 h-[2px] bg-primary -z-10" />

            {/* Step 1 */}
            <div className="flex-1 flex flex-col items-center text-center w-full bg-background/80 md:bg-transparent px-4">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold mb-6 ring-4 ring-background">
                1
              </div>
              <Users className="h-6 w-6 mb-3 text-muted-foreground" />
              <h3 className="text-lg font-medium">Create Account</h3>
              <p className="text-sm text-muted-foreground mt-2">Set up your profile and vitals in under 60 seconds.</p>
            </div>

            {/* Step 2 */}
            <div className="flex-1 flex flex-col items-center text-center w-full bg-background/80 md:bg-transparent px-4">
              <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-lg font-semibold mb-6 ring-4 ring-background">
                2
              </div>
              <CreditCard className="h-6 w-6 mb-3 text-muted-foreground" />
              <h3 className="text-lg font-medium">Select Plan</h3>
              <p className="text-sm text-muted-foreground mt-2">Purchase seamlessly. New plans auto-queue automatically.</p>
            </div>

            {/* Step 3 */}
            <div className="flex-1 flex flex-col items-center text-center w-full bg-background/80 md:bg-transparent px-4">
              <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-lg font-semibold mb-6 ring-4 ring-background">
                3
              </div>
              <TrendingDown className="h-6 w-6 mb-3 text-muted-foreground" />
              <h3 className="text-lg font-medium">Log Weight & Go</h3>
              <p className="text-sm text-muted-foreground mt-2">Track daily progress and watch the results show.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Features Grid */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight">Everything you need.</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              icon={<Zap />} title="Plan Stacking" 
              description="Buy future plans without losing days on current active memberships."
            />
            <FeatureCard 
              icon={<IndianRupee />} title="Seamless Payments" 
              description="Accept online payments or log manual cash instantly from the desk."
            />
            <FeatureCard 
              icon={<Activity />} title="Goal Tracking" 
              description="1-entry-per-day logging with interactive trends and BMI calculation."
            />
            <FeatureCard 
              icon={<Lock />} title="Enterprise Security" 
              description="Strict role verification protecting all API routes and member data."
            />
            <FeatureCard 
              icon={<Bell />} title="Live Queues" 
              description="Centralized hub for instantly approving or rejecting purchase requests."
            />
            <FeatureCard 
              icon={<Building2 />} title="Custom Branding" 
              description="Brand your portal with custom fees, social links, and contact details."
            />
          </div>
        </div>
      </section>

      {/* Clean CTA */}
      <section className="py-24 border-t">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to upgrade?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Ditch the paper logs. Get your gym on Gym Stitch today.
          </p>
          <div className="mt-8">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button size="lg">Get Started Free</Button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Button size="lg" >
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
            </Show>
          </div>
        </div>
      </section>
    </div>
  );
}

// Shadcn Default Feature Card
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-none bg-muted/30 shadow-none">
      <CardHeader>
        <div className="mb-2 text-primary">
          {React.cloneElement(icon, {
            className: "h-6 w-6",
          })}
        </div>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}