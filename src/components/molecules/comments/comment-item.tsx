"use client";

import { useState } from "react";
import { updateComment, deleteComment } from "@/server/actions/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CommentItemProps {
  comment: {
    id: number;
    comment: string;
    createdAt: Date;
    authorId: string;
    author: {
      id: string;
      name: string;
      username: string;
    };
  };
  currentUserId?: string;
}

export function CommentItem({ comment, currentUserId }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.comment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isOwnComment = currentUserId === comment.authorId;
  const formattedDate = new Date(comment.createdAt).toLocaleString();

  async function handleUpdate() {
    if (!editedComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("id", comment.id.toString());
    formData.append("comment", editedComment);

    try {
      const result = await updateComment(formData);

      if (result.success) {
        toast.success("Comment updated successfully");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update comment");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("id", comment.id.toString());

    try {
      const result = await deleteComment(formData);

      if (result.success) {
        toast.success("Comment deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete comment");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border p-4 rounded-md">
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editedComment}
            onChange={(e) => setEditedComment(e.target.value)}
            disabled={isSubmitting}
            className="min-h-24"
          />
          <div className="flex justify-end space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleUpdate} disabled={isSubmitting}>
              <Check className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between">
            <p className="font-medium">{comment.author.name}</p>
            {isOwnComment && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this comment? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          <p className="mt-2">{comment.comment}</p>
          <p className="text-sm text-muted-foreground mt-2">{formattedDate}</p>
        </>
      )}
    </div>
  );
}
