"use server";

import { prisma } from "@/server/db/prisma";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth";

export async function addComment(formData: FormData) {
  try {
    // Check if user is authenticated
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const comment = formData.get("comment") as string;

    if (!comment || comment.trim() === "") {
      return { success: false, error: "Comment cannot be empty" };
    }

    await prisma.comment.create({
      data: {
        comment: comment,
        authorId: user.id,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function updateComment(formData: FormData) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const id = formData.get("id") as string;
    const comment = formData.get("comment") as string;

    if (!comment || comment.trim() === "") {
      return { success: false, error: "Comment cannot be empty" };
    }

    // Check if comment exists and belongs to the user
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      return { success: false, error: "Comment not found" };
    }

    if (existingComment.authorId !== user.id) {
      return { success: false, error: "You can only edit your own comments" };
    }

    await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { comment },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to update comment" };
  }
}

export async function deleteComment(formData: FormData) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const id = formData.get("id") as string;

    // Check if comment exists and belongs to the user
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      return { success: false, error: "Comment not found" };
    }

    if (existingComment.authorId !== user.id) {
      return { success: false, error: "You can only delete your own comments" };
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}

export async function getComments() {
  try {
    const comments = await prisma.comment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return { success: true, data: comments };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to fetch comments" };
  }
}
