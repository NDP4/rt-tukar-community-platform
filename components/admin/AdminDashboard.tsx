"use client";

import { useState, useEffect } from "react";
import { Users, Package, MessageSquare, TrendingUp } from "lucide-react";
import { MemberWithDetails } from "@/lib/types";
import { getRTItems } from "@/lib/utils";
import MembersList from "./MembersList";
import ItemsManagement from "./ItemsManagement";

interface AdminDashboardProps {
  membership: MemberWithDetails;
  members: any[];
}

export default function AdminDashboard({
  membership,
  members,
}: AdminDashboardProps) {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [membership.rt_id]);

  const loadItems = async () => {
    try {
      const data = await getRTItems(membership.rt_id);
      setItems(data);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalMembers: members.length,
    totalItems: items.length,
    availableItems: items.filter((item: any) => item.status === "available")
      .length,
    collectedItems: items.filter((item: any) => item.status === "collected")
      .length,
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "members", label: "Members", icon: Users },
    { id: "items", label: "Items", icon: Package },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Members
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalMembers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Items
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalItems}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Available Items
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.availableItems}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Collected Items
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.collectedItems}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  RT {membership.rt.name} Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Community Info
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Kelurahan: {membership.rt.kelurahan}</p>
                      <p>Kecamatan: {membership.rt.kecamatan}</p>
                      <p>Total Members: {stats.totalMembers}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Exchange Activity
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Items Available: {stats.availableItems}</p>
                      <p>Items Collected: {stats.collectedItems}</p>
                      <p>
                        Success Rate:{" "}
                        {stats.totalItems > 0
                          ? Math.round(
                              (stats.collectedItems / stats.totalItems) * 100
                            )
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <MembersList members={members} rtId={membership.rt_id} />
          )}

          {activeTab === "items" && (
            <ItemsManagement
              items={items}
              onItemsChange={loadItems}
              membership={membership}
            />
          )}
        </div>
      </div>
    </div>
  );
}
