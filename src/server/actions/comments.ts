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
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function getComments() {
  try {
    const comments = await prisma.comment.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: comments };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to fetch comments" };
  }
}
