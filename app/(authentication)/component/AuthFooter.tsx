import Link from "next/link";

export default function AuthFooter() {
  return (
    <footer className="w-full border-t bg-background/80">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 px-6 py-5 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
        <p>
          © {new Date().getFullYear()} Gym Management
        </p>

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="transition-colors hover:text-foreground"
          >
            Home
          </Link>

          <Link
            href="/login"
            className="transition-colors hover:text-foreground"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="transition-colors hover:text-foreground"
          >
            Register
          </Link>
        </nav>
      </div>
    </footer>
  );
}