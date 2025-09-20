"use client";

import { useState, useEffect } from "react";
import { MemberWithDetails } from "@/lib/types";
import { getRTItems } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import ItemGrid from "@/components/items/ItemGrid";
import { ItemWithDetails } from "@/lib/types";

interface DashboardProps {
  membership: MemberWithDetails;
}

export default function Dashboard({ membership }: DashboardProps) {
  const [items, setItems] = useState<ItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [membership.rt_id]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getRTItems(membership.rt_id);
      setItems(data as ItemWithDetails[]);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar membership={membership} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {membership.rt.name} Community Exchange
            </h1>
            <p className="text-gray-600">
              {membership.rt.kelurahan}, {membership.rt.kecamatan}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading items...</p>
            </div>
          ) : (
            <ItemGrid
              items={items}
              onItemsChange={loadItems}
              membership={membership}
            />
          )}
        </div>
      </main>
    </div>
  );
}
