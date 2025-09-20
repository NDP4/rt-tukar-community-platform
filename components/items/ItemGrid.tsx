"use client";

import { useState } from "react";
import { Plus, Package } from "lucide-react";
import { ItemWithDetails, MemberWithDetails } from "@/lib/types";
import ItemCard from "./ItemCard";
import AddItemModal from "./AddItemModal";

interface ItemGridProps {
  items: ItemWithDetails[];
  onItemsChange: () => void;
  membership: MemberWithDetails;
}

export default function ItemGrid({
  items,
  onItemsChange,
  membership,
}: ItemGridProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Available Items
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No items available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding an item to share with your community.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first item
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onItemChange={onItemsChange}
              membership={membership}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onItemAdded={onItemsChange}
          rtId={membership.rt_id}
        />
      )}
    </div>
  );
}
