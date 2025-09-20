"use client";

import { useState } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import { ItemWithDetails, MemberWithDetails } from "@/lib/types";
import { deleteItem } from "@/lib/utils";
import { useAlert } from "@/components/ui/AlertProvider";
import { useToast } from "@/components/ui/ToastProvider";

interface ItemsManagementProps {
  items: ItemWithDetails[];
  onItemsChange: () => void;
  membership: MemberWithDetails;
}

export default function ItemsManagement({
  items,
  onItemsChange,
}: ItemsManagementProps) {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const { showConfirm } = useAlert();
  const { showSuccess, showError } = useToast();

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const handleDeleteItem = async (itemId: string) => {
    showConfirm(
      "Delete Item",
      "Are you sure you want to delete this item? This action cannot be undone.",
      async () => {
        setLoading(true);
        try {
          await deleteItem(itemId);
          onItemsChange();
          showSuccess("Item deleted successfully!");
        } catch (error) {
          console.error("Failed to delete item:", error);
          showError("Failed to delete item", "Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "reserved":
        return "bg-blue-100 text-blue-800";
      case "collected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Items Management ({items.length})
        </h3>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Items</option>
            <option value="available">Available</option>
            <option value="requested">Requested</option>
            <option value="reserved">Reserved</option>
            <option value="collected">Collected</option>
          </select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No items found for the selected filter.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <li key={item.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-16 w-16">
                      {item.photo_path ? (
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={`https://icrialmgxtwisyxahvox.supabase.co/storage/v1/object/public/items/${item.photo_path}`}
                          alt={item.title}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            item.status || "available"
                          )}`}
                        >
                          {item.status || "available"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {item.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {item.quantity} {item.unit}
                        </span>
                        <span className="text-xs text-gray-500">
                          by {item.donor?.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Edit Item"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                      title="Delete Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
