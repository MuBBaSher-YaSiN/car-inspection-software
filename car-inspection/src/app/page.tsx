// src/app/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // If not logged in, you can redirect to login page or keep them here
    redirect("/api/auth/signin");
  }

  const role = session.user?.role;

  if (role === "admin") {
    redirect("/admin/dashboard");
  } else if (role === "team") {
    redirect("/team/dashboard");
  } else {
    // Unknown role or fallback
    redirect("/unauthorized");
  }
}
