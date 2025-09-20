"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, RefreshCw } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const resendConfirmation = async () => {
    if (!email) {
      setError("Email tidak ditemukan. Silakan isi email terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) throw error;
      setSuccess(
        "Email konfirmasi telah dikirim ulang ke " +
          email +
          ". Silakan cek inbox Anda."
      );
      setNeedsConfirmation(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengirim ulang email";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setNeedsConfirmation(false);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone,
            },
          },
        });

        if (error) throw error;

        if (data.user && !data.user.email_confirmed_at) {
          setNeedsConfirmation(true);
          setSuccess(
            "Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi."
          );
          return;
        }

        if (data.user && data.user.email_confirmed_at) {
          setSuccess("Akun berhasil dibuat! Mengalihkan ke dashboard...");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (
            error.message.includes("email_not_confirmed") ||
            error.message.includes("Email not confirmed")
          ) {
            setNeedsConfirmation(true);
            setError(
              "Email belum dikonfirmasi. Silakan cek email Anda untuk link konfirmasi."
            );
            return;
          }
          if (error.message.includes("Invalid login credentials")) {
            setError("Email atau password salah. Silakan coba lagi.");
            return;
          }
          throw error;
        }

        // Check if user exists but email is not confirmed
        if (data.user && !data.user.email_confirmed_at) {
          setNeedsConfirmation(true);
          setError(
            "Email belum dikonfirmasi. Silakan cek email Anda untuk link konfirmasi."
          );
          return;
        }

        if (data.user) {
          setSuccess("Login berhasil! Mengalihkan ke dashboard...");

          // Force a full page refresh to ensure session is properly loaded
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500);
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm -space-y-px">
        {mode === "signup" && (
          <>
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors"
                placeholder="Phone Number (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </>
        )}
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 ${
              mode === "signup" ? "" : "rounded-t-md"
            } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors`}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md p-4">
          <div className="text-green-600 dark:text-green-400 text-sm text-center">
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4">
          <div className="text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
          {needsConfirmation && (
            <div className="mt-3">
              <div className="flex items-center justify-center mb-2">
                <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
                  Belum menerima email? Klik tombol di bawah untuk mengirim
                  ulang.
                </p>
              </div>
              <button
                type="button"
                onClick={resendConfirmation}
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Mengirim..." : "Kirim Ulang Email Konfirmasi"}
              </button>
            </div>
          )}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Loading..." : mode === "signup" ? "Sign up" : "Sign in"}
        </button>
      </div>

      <div className="text-center">
        {mode === "signup" ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
