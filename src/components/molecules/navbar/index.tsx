import Link from "next/link";
import { AuthStatus } from "./auth-status";

export function Navbar() {
  return (
    <header>
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="text-xl font-bold">
          Comments App
        </Link>
        <AuthStatus />
      </div>
    </header>
  );
}
