import { getAuthUser } from "@/lib/auth";
import { CommentFormClient } from "./comment-form-client";

export async function CommentForm() {
  const user = await getAuthUser();

  return <CommentFormClient isLoggedIn={!!user} />;
}
