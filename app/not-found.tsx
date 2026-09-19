import Link from "next/link";
import { Dumbbell, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center px-4">
      {/* Icon Badge */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-sm">
        <Dumbbell className="h-8 w-8 text-primary" />
      </div>

      {/* Main Heading & Description */}
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        404 - Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
        Sorry, we couldn’t find the page you’re looking for. It might have been
        moved or no longer exists.
      </p>

      {/* Navigation Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link href="/">
          <Button  variant="default" >
            
              <Home  />
              Go back to Home
            
          </Button>
        </Link>
        
        <Link href="/dashboard">
          <Button  variant="outline">
          
              <ArrowLeft />
              Back to Dashboard
            
          </Button>
        </Link>
      </div>
    </div>
  );
}