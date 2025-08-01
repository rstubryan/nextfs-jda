import { UserProfile } from "@/components/molecules/profile/user-profile";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function DashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-4">
        <Button asChild size={"icon"} variant="outline">
          <Link href={"/"}>
            <ArrowLeft />
          </Link>
        </Button>
        Account Dashboard
      </h1>
      <UserProfile userId={user.id} />
    </div>
  );
}
