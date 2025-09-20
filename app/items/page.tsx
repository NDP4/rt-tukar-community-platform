"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getUserMembership, getRTItems } from "@/lib/utils";
import { MemberWithDetails, ItemWithDetails } from "@/lib/types";
import Navbar from "@/components/layout/Navbar";
import ItemGrid from "@/components/items/ItemGrid";

export default function ItemsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [membership, setMembership] = useState<MemberWithDetails | null>(null);
  const [items, setItems] = useState<ItemWithDetails[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const loadData = async () => {
      try {
        const membershipData = await getUserMembership();

        if (!membershipData) {
          router.push("/dashboard");
          return;
        }

        setMembership(membershipData);

        // Load items from user's RT
        const itemsData = await getRTItems(membershipData.rt_id);
        setItems(itemsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [user, loading, router]);

  const handleItemsChange = async () => {
    if (membership) {
      try {
        const itemsData = await getRTItems(membership.rt_id);
        setItems(itemsData);
      } catch (error) {
        console.error("Failed to reload items:", error);
      }
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!membership) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar membership={membership} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Community Items
            </h1>
            <p className="text-gray-600">
              Browse and request items from your RT community
            </p>
          </div>

          <ItemGrid
            items={items}
            onItemsChange={handleItemsChange}
            membership={membership}
          />
        </div>
      </main>
    </div>
  );
}
