"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserMembership } from "@/lib/utils";
import { MemberWithDetails } from "@/lib/types";
import RTSelector from "@/components/rt/RTSelector";
import Dashboard from "@/components/dashboard/Dashboard";

export default function DashboardClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [membership, setMembership] = useState<MemberWithDetails | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      const fetchMembership = async () => {
        try {
          const membershipData = await getUserMembership();
          setMembership(membershipData);
        } catch (error) {
          console.error("Error fetching membership:", error);
        } finally {
          setMembershipLoading(false);
        }
      };

      fetchMembership();
    }
  }, [user, loading, router]);

  if (loading || membershipLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (!membership) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Join an RT Community
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              To start exchanging items, you need to join an RT (neighborhood
              unit) community.
            </p>
            <RTSelector />
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard membership={membership} />;
}
