import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Login - RT Tukar",
  description: "Login to your RT community exchange account",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Sign in to RT Tukar
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Community food & goods exchange system
          </p>
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
