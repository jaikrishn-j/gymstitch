import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    BarChart3,
    Bell,
    CalendarCheck,
    Check,
    ChevronRight,
    CreditCard,
    Dumbbell,
    LayoutDashboard,
    Menu,
    Receipt,
    ShieldCheck,
    Users,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 transition-transform active:scale-95"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                            <Dumbbell className="h-5 w-5" />
                        </div>

                        <span className="text-base font-bold tracking-tight">
                            Gym Stitch
                        </span>
                    </Link>

                    {/* Desktop navigation */}
                    <nav className="hidden items-center gap-8 md:flex">
                        <a
                            href="#features"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Features
                        </a>

                        <a
                            href="#members"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Members
                        </a>

                        <a
                            href="#admins"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Admins
                        </a>
                    </nav>

                    {/* Actions - Using standard shadcn button sizes */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            className="hidden sm:inline-flex"
                            asChild
                        >
                            <Link href="/login">Sign in</Link>
                        </Button>

                        <Button asChild>
                            <Link href="/login" className="flex items-center gap-2">
                                Get Started
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-24 lg:pb-32">
                <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
                    <div className="h-[300px] w-[600px] bg-gradient-to-tr from-primary/10 via-primary/5 to-transparent blur-3xl rounded-full" />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                        {/* Hero copy */}
                        <div className="max-w-2xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-1.5 text-xs font-semibold text-foreground/80 backdrop-blur-sm">
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                Your gym, connected
                            </div>

                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                                Everything your gym needs.{" "}
                                <span className="text-primary">In one place.</span>
                            </h1>

                            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                Gym Stitch brings your gym members and team together
                                with one simple platform for memberships, payments,
                                attendance, and daily gym management.
                            </p>

                            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                                <Button size="lg" className="h-11 px-8 text-base shadow-md shadow-primary/20" asChild>
                                    <Link href="/login" className="flex items-center justify-center gap-2">
                                        Access Gym
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-11 px-8 text-base"
                                    asChild
                                >
                                    <a href="#features">Explore Features</a>
                                </Button>
                            </div>

                            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs font-medium text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Check className="h-3 w-3" />
                                    </div>
                                    Simple to use
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Check className="h-3 w-3" />
                                    </div>
                                    Built for your gym
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Check className="h-3 w-3" />
                                    </div>
                                    Member & staff access
                                </div>
                            </div>
                        </div>

                        {/* Dashboard preview */}
                        <div className="relative mx-auto w-full max-w-xl lg:mx-0">
                            <div className="rounded-2xl border bg-background/50 p-2.5 shadow-2xl backdrop-blur-xl ring-1 ring-border/50">
                                <div className="overflow-hidden rounded-xl border bg-card text-card-foreground">
                                    {/* Preview top bar */}
                                    <div className="flex h-11 items-center justify-between border-b px-4 bg-muted/20">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                                <Dumbbell className="h-3.5 w-3.5" />
                                            </div>

                                            <span className="text-xs font-bold tracking-tight">
                                                Gym Stitch
                                            </span>
                                        </div>

                                        <div className="h-6 w-6 rounded-full bg-muted/80 ring-2 ring-background" />
                                    </div>

                                    <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[160px_1fr]">
                                        {/* Sidebar */}
                                        <div className="border-r bg-muted/10 p-2 sm:p-3">
                                            <div className="hidden space-y-1.5 sm:block">
                                                {[
                                                    "Dashboard",
                                                    "My Plan",
                                                    "Transactions",
                                                    "Settings",
                                                ].map((item, index) => (
                                                    <div
                                                        key={item}
                                                        className={`flex h-8 items-center gap-2.5 rounded-md px-2.5 text-xs font-medium transition-colors ${
                                                            index === 0
                                                                ? "bg-primary/10 text-primary"
                                                                : "text-muted-foreground hover:bg-muted/50"
                                                        }`}
                                                    >
                                                        <div className={`h-2 w-2 rounded-full ${index === 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-2 sm:hidden">
                                                {[1, 2, 3, 4].map((item) => (
                                                    <div
                                                        key={item}
                                                        className="flex h-8 items-center justify-center rounded-md"
                                                    >
                                                        <div className="h-3 w-3 rounded bg-muted-foreground/30" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Dashboard content */}
                                        <div className="min-w-0 p-4 sm:p-5">
                                            <div className="mb-5">
                                                <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                                                <div className="mt-2 h-2.5 w-40 rounded bg-muted/60 animate-pulse" />
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-3">
                                                <PreviewCard
                                                    label="Active Plan"
                                                    value="Premium"
                                                />

                                                <PreviewCard
                                                    label="Attendance"
                                                    value="18 days"
                                                />

                                                <PreviewCard
                                                    label="Next Payment"
                                                    value="₹1,500"
                                                />
                                            </div>

                                            <div className="mt-4 rounded-xl border bg-card/50 p-4 shadow-sm">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div>
                                                        <div className="h-3 w-24 rounded bg-muted" />
                                                        <div className="mt-2 h-2 w-32 rounded bg-muted/60" />
                                                    </div>

                                                    <div className="h-7 w-16 rounded-lg bg-muted/80" />
                                                </div>

                                                <div className="space-y-3">
                                                    {[1, 2, 3].map((item) => (
                                                        <div
                                                            key={item}
                                                            className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="h-7 w-7 rounded-lg bg-muted" />

                                                                <div>
                                                                    <div className="h-2.5 w-20 rounded bg-muted" />
                                                                    <div className="mt-1.5 h-2 w-12 rounded bg-muted/60" />
                                                                </div>
                                                            </div>

                                                            <div className="h-2.5 w-12 rounded bg-muted" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Small floating card */}
                            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border bg-card p-4 shadow-xl sm:block ring-1 ring-border/50">
                                <div className="flex items-center gap-3.5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <CalendarCheck className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Today's attendance
                                        </p>
                                        <p className="text-base font-bold text-foreground">
                                            42 members
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Audience */}
            <section className="border-y bg-muted/20">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary">
                            ONE GYM. ONE PLATFORM.
                        </p>

                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Built for everyone at your gym
                        </h2>

                        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                            Members get a simple way to manage their membership.
                            Your team gets the tools needed to manage operations.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-2">
                        {/* Members */}
                        <AudienceCard
                            id="members"
                            icon={<Users className="h-5 w-5" />}
                            eyebrow="MEMBERS"
                            title="A better gym experience"
                            description="Everything members need, without having to visit the front desk for every little thing."
                            items={[
                                "View membership and plan details",
                                "Track payments and transactions",
                                "Check attendance history",
                                "Receive gym notifications",
                            ]}
                            href="/login"
                            action="Member Login"
                        />

                        {/* Admins */}
                        <AudienceCard
                            id="admins"
                            icon={<LayoutDashboard className="h-5 w-5" />}
                            eyebrow="ADMINS & STAFF"
                            title="Your gym at a glance"
                            description="Manage members, plans, payments, attendance, and everyday operations from one dashboard."
                            items={[
                                "Manage members and staff",
                                "Create and manage plans",
                                "Track payments and attendance",
                                "View reports and gym activity",
                            ]}
                            href="/login"
                            action="Staff Login"
                        />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary">
                            FEATURES
                        </p>

                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Everything in one place
                        </h2>

                        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                            Replace scattered records and repetitive tasks with a
                            single system built around your gym.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <Feature
                            icon={<Users />}
                            title="Member Management"
                            description="Keep member profiles, membership status, and important information organized."
                        />

                        <Feature
                            icon={<CreditCard />}
                            title="Payments"
                            description="Track membership payments, transactions, pending payments, and payment history."
                        />

                        <Feature
                            icon={<CalendarCheck />}
                            title="Attendance"
                            description="Keep track of member attendance and understand how your gym is being used."
                        />

                        <Feature
                            icon={<BarChart3 />}
                            title="Reports"
                            description="Get a clearer view of your gym's members, payments, and daily activity."
                        />

                        <Feature
                            icon={<Bell />}
                            title="Notifications"
                            description="Keep members informed about payments, memberships, and important gym updates."
                        />

                        <Feature
                            icon={<ShieldCheck />}
                            title="Role-Based Access"
                            description="Give members, staff, and administrators access to the features relevant to them."
                        />
                    </div>
                </div>
            </section>

            {/* Workflow */}
            <section className="border-y bg-muted/20 py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-primary">
                                HOW IT WORKS
                            </p>

                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                One system. Different experiences.
                            </h2>

                            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                                Gym Stitch keeps your gym's data connected while
                                giving each person a focused experience based on
                                their role.
                            </p>

                            <div className="mt-8 space-y-6">
                                <Step
                                    number="01"
                                    title="Your team manages the gym"
                                    description="Admins and staff manage members, plans, payments, attendance, and gym settings."
                                />

                                <Step
                                    number="02"
                                    title="Members stay informed"
                                    description="Members can access their own membership, payment, attendance, and account information."
                                />

                                <Step
                                    number="03"
                                    title="Everything stays connected"
                                    description="Your gym gets one organized system instead of separate spreadsheets, records, and manual processes."
                                />
                            </div>
                        </div>

                        {/* Role visualization */}
                        <div className="rounded-2xl border bg-card p-4 shadow-lg sm:p-6 ring-1 ring-border/50">
                            <div className="rounded-xl border bg-muted/20 p-5">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div>
                                        <p className="text-sm font-bold">
                                            Gym Stitch
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Your gym management platform
                                        </p>
                                    </div>

                                    <Dumbbell className="h-5 w-5 text-muted-foreground" />
                                </div>

                                <div className="mt-5 space-y-3">
                                    <RoleRow
                                        icon={<Users />}
                                        title="Members"
                                        description="Plans · Payments · Attendance"
                                    />

                                    <RoleRow
                                        icon={<LayoutDashboard />}
                                        title="Staff"
                                        description="Members · Attendance · Payments"
                                    />

                                    <RoleRow
                                        icon={<ShieldCheck />}
                                        title="Administrators"
                                        description="Full gym management & settings"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 sm:py-28">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                        <Dumbbell className="h-7 w-7" />
                    </div>

                    <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Your gym, all in one place.
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                        Whether you're managing the gym or working out at it,
                        Gym Stitch keeps the important things simple.
                    </p>

                    <div className="mt-8 flex justify-center">
                        <Button size="lg" className="h-11 px-8 text-base shadow-md shadow-primary/20" asChild>
                            <Link href="/login" className="flex items-center gap-2">
                                Enter Gym Stitch
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-muted/10">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 transition-opacity hover:opacity-80"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Dumbbell className="h-3.5 w-3.5" />
                        </div>

                        <span className="text-sm font-bold tracking-tight">
                            Gym Stitch
                        </span>
                    </Link>

                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Gym Stitch. All rights reserved.
                    </p>

                    <div className="flex gap-6 text-xs font-medium text-muted-foreground">
                        <Link
                            href="/privacy"
                            className="transition-colors hover:text-foreground"
                        >
                            Privacy
                        </Link>

                        <Link
                            href="/terms"
                            className="transition-colors hover:text-foreground"
                        >
                            Terms
                        </Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}

function PreviewCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border bg-card p-3 shadow-xs">
            <p className="text-[10px] font-medium text-muted-foreground">{label}</p>

            <p className="mt-1 truncate text-xs font-bold text-foreground">{value}</p>

            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-3/4 rounded-full bg-primary" />
            </div>
        </div>
    );
}

function AudienceCard({
    id,
    icon,
    eyebrow,
    title,
    description,
    items,
    href,
    action,
}: {
    id: string;
    icon: React.ReactNode;
    eyebrow: string;
    title: string;
    description: string;
    items: string[];
    href: string;
    action: string;
}) {
    return (
        <div
            id={id}
            className="group flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-xs transition-all hover:border-primary/50 hover:shadow-md sm:p-8"
        >
            <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {icon}
                </div>

                <p className="mt-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {eyebrow}
                </p>

                <h3 className="mt-2 text-xl font-bold tracking-tight">
                    {title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>

                <ul className="mt-6 space-y-3">
                    {items.map((item) => (
                        <li
                            key={item}
                            className="flex items-start gap-3 text-sm text-foreground/90"
                        >
                            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Check className="h-3 w-3" />
                            </div>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <Button
                variant="outline"
                className="mt-8 w-full sm:w-auto"
                asChild
            >
                <Link href={href} className="flex items-center justify-center gap-2">
                    {action}
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}

function Feature({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="group rounded-xl border bg-card p-6 shadow-xs transition-all hover:border-primary/50 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <div className="h-5 w-5">{icon}</div>
            </div>

            <h3 className="mt-4 text-base font-bold">{title}</h3>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function Step({
    number,
    title,
    description,
}: {
    number: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-muted/30 text-xs font-bold text-primary">
                {number}
            </div>

            <div>
                <h3 className="text-base font-semibold">{title}</h3>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function RoleRow({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-center gap-3.5 rounded-xl border bg-card p-3.5 shadow-2xs transition-colors hover:border-muted-foreground/30">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <div className="h-4 w-4">{icon}</div>
            </div>

            <div className="min-w-0">
                <p className="text-sm font-semibold">{title}</p>

                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {description}
                </p>
            </div>

            <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground/40" />
        </div>
    );
}