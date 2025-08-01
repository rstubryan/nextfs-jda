"use client";

import { useState } from "react";
import { addComment } from "@/server/actions/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CommentFormClientProps {
  isLoggedIn: boolean;
  className?: string;
}

export function CommentFormClient({
  isLoggedIn,
  className,
}: CommentFormClientProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error("Please login to add a comment");
      return;
    }

    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("comment", comment);

    try {
      const result = await addComment(formData);

      if (result.success) {
        toast.success("Comment added successfully");
        setComment("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to add comment");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <Textarea
          placeholder={
            isLoggedIn ? "Add a comment..." : "Please login to comment"
          }
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={!isLoggedIn || isSubmitting}
          className="min-h-24"
        />
        <Button
          type="submit"
          disabled={!isLoggedIn || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : "Add Comment"}
        </Button>
      </div>
    </form>
  );
}
