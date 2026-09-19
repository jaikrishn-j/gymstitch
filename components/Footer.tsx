import Link from "next/link";
import { Dumbbell, Heart, Shield, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-2">
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
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              A modern, mobile-first gym platform bridging member goal tracking,
              automatic plan renewals, and gym operational management into one
              seamless workspace.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge
                variant="outline"
                className="gap-1 text-[11px] font-normal text-muted-foreground"
              >
                <Shield className="h-3 w-3 text-emerald-500" />
                Role-Based Security
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 text-[11px] font-normal text-muted-foreground"
              >
                <Lock className="h-3 w-3 text-primary" />
                Clerk Authenticated
              </Badge>
            </div>
          </div>

          {/* Member Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Member Portal
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/weight"
                  className="transition-colors hover:text-foreground"
                >
                  Weight & Goal Logs
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/plans"
                  className="transition-colors hover:text-foreground"
                >
                  Plans & Renewals
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/payments"
                  className="transition-colors hover:text-foreground"
                >
                  Payment Receipts
                </Link>
              </li>
            </ul>
          </div>

          {/* Management / Owners */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Gym Management
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/admin"
                  className="transition-colors hover:text-foreground"
                >
                  Admin Workspace
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/members"
                  className="transition-colors hover:text-foreground"
                >
                  Member Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/payments"
                  className="transition-colors hover:text-foreground"
                >
                  Offline Requests
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/settings"
                  className="transition-colors hover:text-foreground"
                >
                  Gym Configuration
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Platform */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Platform
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@gymstitch.app"
                  className="transition-colors hover:text-foreground"
                >
                  Support & Help
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {currentYear} Gym Stitch. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with focus for member fitness journeys</span>
            <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}