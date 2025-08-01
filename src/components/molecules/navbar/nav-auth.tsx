"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/server/actions/auth";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { UserCircle } from "lucide-react";

interface NavAuthProps {
  isLoggedIn: boolean;
  username?: string;
}

export function NavAuth({ isLoggedIn, username }: NavAuthProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logoutUser();

      if (result.success) {
        toast.success("Logged out successfully");
        router.push("/"); // Redirect to home page
        router.refresh();
      } else {
        toast.error(result.error || "Failed to logout");
      }
    } catch {
      toast.error("An error occurred during logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm">Welcome, {username}</span>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <UserCircle size={16} />
            Dashboard
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => router.push("/login")}>
        Login
      </Button>
      <Button onClick={() => router.push("/register")}>Register</Button>
    </div>
  );
}
