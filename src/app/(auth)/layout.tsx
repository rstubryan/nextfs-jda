import AuthContainer from "@/components/templates/container/auth-container";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthContainer>{children}</AuthContainer>;
}
