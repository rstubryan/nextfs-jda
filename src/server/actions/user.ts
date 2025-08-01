"use server";

import { prisma } from "@/server/db/prisma";
import { clearAuthCookie, hash } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(userId: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!name || !username) {
      return { success: false, error: "Name and username are required" };
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Check if username is taken by another user
    if (username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return { success: false, error: "Username already taken" };
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      name,
      username,
    };

    // Handle password change if provided
    if (currentPassword && newPassword) {
      const hashedCurrentPassword = await hash(currentPassword);

      // Verify current password
      if (hashedCurrentPassword !== user.password) {
        return { success: false, error: "Current password is incorrect" };
      }

      // Update with new password
      updateData.password = await hash(newPassword);
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    revalidatePath("/profile");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Failed to get user profile:", error);
    return { success: false, error: "Failed to get user profile" };
  }
}

export async function deleteUserAccount(formData: FormData) {
  try {
    const userId = formData.get("userId") as string;

    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    // First delete all comments by this user
    await prisma.comment.deleteMany({
      where: { authorId: userId },
    });

    // Then delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear auth cookie
    clearAuthCookie();

    return { success: true };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}
