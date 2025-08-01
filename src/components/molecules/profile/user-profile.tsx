"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from "@/server/actions/user";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

interface UserProfileData {
  id: string;
  name: string;
  username: string;
  role: string;
  createdAt: string;
  _count: {
    comments: number;
  };
}

export function UserProfile({ userId }: { userId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      username: "",
    },
  });

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      const result = await getUserProfile(userId);
      if (result.success && result.data) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        setUserData(result.data);
        form.reset({
          name: result.data.name,
          username: result.data.username,
        });
      } else {
        toast.error(result.error || "Failed to load user data");
      }
      setIsLoading(false);
    };

    loadUserData();
  }, [userId, form]);

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("username", values.username);

    const result = await updateUserProfile(userId, formData);

    // Inside onSubmit function in user-profile.tsx
    if (result.success) {
      toast.success("Profile updated successfully");
      router.refresh();

      const updatedUser = await getUserProfile(userId);
      if (updatedUser.success && updatedUser.data) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        setUserData(updatedUser.data);
      }
    }

    setIsSubmitting(false);
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);

    const formData = new FormData();
    formData.append("userId", userId);

    const result = await deleteUserAccount(formData);

    if (result.success) {
      toast.success("Account deleted successfully");
      router.push("/login");
    } else {
      toast.error(result.error || "Failed to delete account");
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (!userData) {
    return <div>Failed to load user profile</div>;
  }

  const joinDate = new Date(userData.createdAt).toLocaleDateString();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            View and manage your account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">Full Name</h3>
                <p className="text-lg">{userData.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Username</h3>
                <p className="text-lg">{userData.username}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Account Type</h3>
                <p className="text-lg capitalize">{userData.role}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Comments Posted</h3>
                <p className="text-lg">{userData._count.comments}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium">Member Since</h3>
              <p>{joinDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving changes..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            These actions are irreversible. Please be certain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and all your
                  comments. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
