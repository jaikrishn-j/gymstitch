import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Check } from "lucide-react";

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="land-body">
      <header className="wrap">
        <div className={`land-top ${scrolled ? "scrolled" : ""}`}>
          <a href="/" className="flex items-center gap-2.5">
            <span className="brand-mark">
              <DumbbellLogo />
            </span>
            <span className="brand-name">GymStitch</span>
          </a>
          <nav className="land-nav">
            <a href="#features">Features</a>
            <a href="#portals">Portals</a>
            <a href="/ui">Equipment</a>
            <a href="/login" className="btn btn-ghost btn-sm">
              Log in
            </a>
            <a href="/register" className="btn btn-primary btn-sm">
              Get started
            </a>
          </nav>
        </div>
      </header>

      <section className="hero wrap">
        <span className="eyebrow anim-fade-up">
          Built for gym owners, trainers & members
        </span>
        <h1 className="anim-fade-up" style={{ animationDelay: ".06s" }}>
          Run your gym like a <em>well-oiled machine</em>
        </h1>
        <p className="lede anim-fade-up" style={{ animationDelay: ".12s" }}>
          Memberships, attendance, payments, equipment and staff — all stitched
          together in one platform. Online and offline, from the front desk to
          the floor.
        </p>
        <div className="cta-row anim-fade-up" style={{ animationDelay: ".18s" }}>
          <a href="/register" className="btn btn-primary btn-lg">
            Start free trial
          </a>
          <a href="/login" className="btn btn-secondary btn-lg">
            Sign in
          </a>
        </div>
        <div className="trust anim-fade-up" style={{ animationDelay: ".24s" }}>
          <div className="t">
            <b>3</b>
            <span>role-based portals</span>
          </div>
          <div className="t">
            <b>8</b>
            <span>management modules</span>
          </div>
          <div className="t">
            <b>100%</b>
            <span>offline capable</span>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow accent">Everything in one place</div>
            <h2>From check-in to revenue, stitched together</h2>
            <p>
              Stop juggling spreadsheets and apps. GymStitch ties every moving
              part of your gym into a single, coherent system.
            </p>
          </div>
          <div className="feat-grid">
            <div className="card feat-card card-hover">
              <div className="feat-icon">
                <CheckIcon />
              </div>
              <h3>Memberships & renewals</h3>
              <p>
                Plans with offer pricing, auto-expiry, renewals, and extension
                when members renew early.
              </p>
            </div>
            <div className="card feat-card card-hover">
              <div className="feat-icon">
                <RefreshIcon />
              </div>
              <h3>Attendance & weight</h3>
              <p>
                Staff clock members in; members log weight. Progress tracked
                daily, weekly, monthly.
              </p>
            </div>
            <div className="card feat-card card-hover">
              <div className="feat-icon">
                <CardIcon />
              </div>
              <h3>Payments, online & manual</h3>
              <p>
                Razorpay checkouts plus cash/UPI/card recording, with a full
                ledger and printable receipts.
              </p>
            </div>
            <div className="card feat-card card-hover">
              <div className="feat-icon">
                <ListIcon />
              </div>
              <h3>Equipment inventory</h3>
              <p>
                Categories, statuses, quantities and maintenance scheduling
                with overdue alerts.
              </p>
            </div>
            <div className="card feat-card card-hover">
              <div className="feat-icon">
                <UsersIcon />
              </div>
              <h3>Staff & permissions</h3>
              <p>
                Trainers with granular per-module CRUD access and one-click
                password reset links.
              </p>
            </div>
            <div className="card feat-card card-hover">
              <div className="feat-icon">
                <ChartIcon />
              </div>
              <h3>Analytics & broadcasts</h3>
              <p>
                Revenue trends, growth and attendance — plus announcements
                straight to members' phones.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section"
        id="portals"
        style={{
          background: "color-mix(in oklch,var(--color-bg) 60%,var(--color-surface))",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow accent">Three portals, one system</div>
            <h2>Every role gets its own home</h2>
          </div>
          <div className="portal-rows">
            <div className="card portal-row">
              <div>
                <h3>Admin</h3>
                <p>
                  Full command. Dashboards, members, staff, plans, equipment,
                  payments, broadcasts and gateway settings.
                </p>
                <ul>
                  <li>
                    <Check size={14} />
                    Real-time revenue & growth analytics
                  </li>
                  <li>
                    <Check size={14} />
                    Granular staff permission matrix
                  </li>
                  <li>
                    <Check size={14} />
                    Razorpay gateway configuration
                  </li>
                </ul>
                <a href="/admin/dashboard" className="btn btn-primary btn-sm">
                  View admin portal
                </a>
              </div>
              <div className="mock anim-float">
                <div className="mock-bar">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="mock-body">
                  <div className="eyebrow" style={{ marginBottom: 12 }}>
                    Revenue this month
                  </div>
                  <div
                    className="stat-num"
                    style={{ fontSize: 34, marginBottom: 14 }}
                  >
                    ₹4,21,800
                  </div>
                  <div className="mock-stats">
                    <div className="mock-stat">
                      <b>128</b>
                      <span>Active members</span>
                    </div>
                    <div className="mock-stat">
                      <b>42</b>
                      <span>Today's check-ins</span>
                    </div>
                    <div className="mock-stat">
                      <b>3</b>
                      <span>Pending plans</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card portal-row rev">
              <div>
                <h3>Staff</h3>
                <p>
                  Day-to-day operations with exactly the access they need —
                  nothing more.
                </p>
                <ul>
                  <li>
                    <Check size={14} />
                    Clock members in & mark attendance
                  </li>
                  <li>
                    <Check size={14} />
                    Record payments & approve requests
                  </li>
                  <li>
                    <Check size={14} />
                    Offline-first — works when the net drops
                  </li>
                </ul>
                <a href="/admin/members" className="btn btn-secondary btn-sm">
                  View staff flow
                </a>
              </div>
              <div className="mock anim-float">
                <div className="mock-bar">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="mock-body">
                  <div className="eyebrow" style={{ marginBottom: 12 }}>
                    Check-ins · today
                  </div>
                  <div className="bar-chart" style={{ height: 120 }}>
                    {[
                      { h: 36, l: "6a" },
                      { h: 64, l: "8a", hi: true },
                      { h: 84, l: "10a", hi: true },
                      { h: 48, l: "12p" },
                      { h: 58, l: "4p" },
                      { h: 40, l: "6p" },
                    ].map((b) => (
                      <div className="bar-wrap" key={b.l}>
                        <div
                          className={`bar${b.hi ? " hi" : ""}`}
                          style={{ height: `${b.h}%` }}
                        />
                        <span className="bar-label">{b.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card portal-row">
              <div>
                <h3>Member</h3>
                <p>
                  Self-service that keeps members engaged and coming back.
                </p>
                <ul>
                  <li>
                    <Check size={14} />
                    Browse & buy plans, or request approval
                  </li>
                  <li>
                    <Check size={14} />
                    Log daily weight & track progress
                  </li>
                  <li>
                    <Check size={14} />
                    Printable receipts & gym announcements
                  </li>
                </ul>
                <a href="/member" className="btn btn-primary btn-sm">
                  View member portal
                </a>
              </div>
              <div className="mock anim-float">
                <div className="mock-bar">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="mock-body">
                  <div className="eyebrow" style={{ marginBottom: 12 }}>
                    My progress · this week
                  </div>
                  <div
                    className="stat-num mono"
                    style={{
                      fontSize: 30,
                      marginBottom: 14,
                      color: "var(--color-success)",
                    }}
                  >
                    −1.8 kg
                  </div>
                  <div
                    className="ring"
                    style={{ "--ring": "var(--color-success)" } as CSSProperties}
                  >
                    <svg viewBox="0 0 96 96">
                      <circle className="t" cx="48" cy="48" r="42.5" />
                      <circle
                        className="f"
                        cx="48"
                        cy="48"
                        r="42.5"
                        strokeDasharray="267"
                        strokeDashoffset="75"
                      />
                    </svg>
                    <div className="mid">
                      <b>72%</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ textAlign: "center", maxWidth: 640 }}>
          <div className="eyebrow accent">Ready to stitch it together?</div>
          <h2
            style={{
              fontSize: "clamp(30px,4vw,40px)",
              margin: "14px 0 16px",
            }}
          >
            Give your gym the tools it deserves
          </h2>
          <div className="cta-row">
            <a href="/register" className="btn btn-primary btn-lg">
              Start free trial
            </a>
            <a href="/login" className="btn btn-secondary btn-lg">
              Sign in
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap ft">
          <div className="flex items-center gap-2.5">
            <span className="brand-mark">
              <DumbbellLogo />
            </span>
            <span className="brand-name">GymStitch</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <a href="#features">Features</a>
            <a href="#portals">Portals</a>
            <a href="/login">Log in</a>
            <a href="/">Overview</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DumbbellLogo() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6.5 6.5v11M17.5 6.5v11M10 20V4M14 20V4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 9-9M3 12h9M3 12l4-4M3 12l4 4" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4v16h16M8 14l3-3 3 3 5-6" />
    </svg>
  );
}