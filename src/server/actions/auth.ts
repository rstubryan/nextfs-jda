"use server";

import { prisma } from "@/server/db/prisma";
import { hash, generateJWT, setAuthCookie, clearAuthCookie } from "@/lib/auth";

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Validate input
    if (!name || !username || !password) {
      return { success: false, error: "All fields are required" };
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { success: false, error: "Username already exists" };
    }

    // Hash password
    const hashedPassword = await hash(password);

    // Create user
    await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to register user:", error);
    return { success: false, error: "Failed to register user" };
  }
}

export async function loginUser(formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      return { success: false, error: "Username and password are required" };
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, error: "Invalid username or password" };
    }

    // Hash the entered password and compare
    const hashedPassword = await hash(password);
    if (user.password !== hashedPassword) {
      return { success: false, error: "Invalid username or password" };
    }

    // Generate JWT and set cookie
    const token = await generateJWT({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    setAuthCookie(token);

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Failed to login" };
  }
}

export async function logoutUser() {
  try {
    clearAuthCookie();
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: "Failed to logout" };
  }
}
