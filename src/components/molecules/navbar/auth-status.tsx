import { getAuthUser } from "@/lib/auth";
import { NavAuth } from "./nav-auth";

export async function AuthStatus() {
  const user = await getAuthUser();

  return <NavAuth isLoggedIn={!!user} username={user?.username} />;
}
