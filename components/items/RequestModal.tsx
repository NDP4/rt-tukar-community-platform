"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import {
  createRequest,
  getCurrentUser,
  notifyItemRequested,
  getCurrentProfile,
} from "@/lib/utils";
import { ItemWithDetails } from "@/lib/types";

interface RequestModalProps {
  item: ItemWithDetails;
  onClose: () => void;
  onRequestSent: () => void;
}

export default function RequestModal({
  item,
  onClose,
  onRequestSent,
}: RequestModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("Not authenticated");

      const request = await createRequest({
        item_id: item.id,
        requester_id: user.id,
        message: message.trim() || null,
        status: "pending",
        pickup_address: null,
        pickup_code: null,
        pickup_code_used_at: null,
        scheduled_pickup_date: null,
      });

      // Send notification to item owner
      try {
        const currentProfile = await getCurrentProfile();
        if (currentProfile && item.donor) {
          await notifyItemRequested(
            item.donor.id,
            currentProfile.name || "Someone",
            item.title,
            request.id
          );
        }
      } catch (error) {
        console.error("Error sending request notification:", error);
      }

      onRequestSent();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Request Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
            <p className="text-sm text-gray-500 mt-1">
              Quantity: {item.quantity} {item.unit} • Donor: {item.donor?.name}
            </p>
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Message to donor (optional)
              </label>
              <textarea
                id="message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Let the donor know why you need this item..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
