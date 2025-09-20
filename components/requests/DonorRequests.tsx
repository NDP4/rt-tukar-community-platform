"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { RequestWithDetails } from "@/lib/types";
import {
  updateRequest,
  generatePickupCode,
  notifyRequestAccepted,
  notifyRequestRejected,
} from "@/lib/utils";
import { useAlert } from "@/components/ui/AlertProvider";
import { useToast } from "@/components/ui/ToastProvider";

interface DonorRequestsProps {
  requests: RequestWithDetails[];
  onRequestsChange: () => void;
}

export default function DonorRequests({
  requests,
  onRequestsChange,
}: DonorRequestsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const { showConfirm } = useAlert();
  const { showSuccess, showError } = useToast();

  const handleAcceptRequest = async (requestId: string) => {
    setLoading(requestId);
    try {
      const pickupCode = generatePickupCode();
      await updateRequest(requestId, {
        status: "accepted",
        pickup_code: pickupCode,
      });

      // Find the request to get requester info for notification
      const request = requests.find((r) => r.id === requestId);
      if (request) {
        try {
          await notifyRequestAccepted(
            request.requester.id,
            request.item.title,
            request.id
          );
        } catch (error) {
          console.error("Error sending accept notification:", error);
        }
      }

      onRequestsChange();
      showSuccess("Request accepted successfully!");
    } catch (error) {
      console.error("Failed to accept request:", error);
      showError("Failed to accept request", "Please try again later.");
    } finally {
      setLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    showConfirm(
      "Reject Request",
      "Are you sure you want to reject this request?",
      async () => {
        setLoading(requestId);
        try {
          await updateRequest(requestId, {
            status: "rejected",
          });

          // Find the request to get requester info for notification
          const request = requests.find((r) => r.id === requestId);
          if (request) {
            try {
              await notifyRequestRejected(
                request.requester.id,
                request.item.title,
                request.id
              );
            } catch (error) {
              console.error("Error sending reject notification:", error);
            }
          }

          onRequestsChange();
          showSuccess("Request rejected successfully!");
        } catch (error) {
          console.error("Failed to reject request:", error);
          showError("Failed to reject request", "Please try again later.");
        } finally {
          setLoading(null);
        }
      }
    );
  };

  const pendingRequests = requests.filter((req) => req.status === "pending");
  const acceptedRequests = requests.filter((req) => req.status === "accepted");

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No requests for your items yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Pending Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {request.item?.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Requested by: {request.requester?.name}
                    </p>
                    {request.message && (
                      <p className="text-sm text-gray-700 mt-2 italic">
                        &quot;{request.message}&quot;
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Requested on:{" "}
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={loading === request.id}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={loading === request.id}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Requests */}
      {acceptedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Accepted Requests ({acceptedRequests.length})
          </h3>
          <div className="space-y-4">
            {acceptedRequests.map((request) => (
              <div
                key={request.id}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {request.item?.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Approved for: {request.requester?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Approved on:{" "}
                      {new Date(request.updated_at).toLocaleDateString()}
                    </p>
                    {request.pickup_code_used_at && (
                      <p className="text-sm text-green-700 font-medium mt-2">
                        ✅ Collected on:{" "}
                        {new Date(
                          request.pickup_code_used_at
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {request.pickup_code && !request.pickup_code_used_at && (
                    <button
                      onClick={() => setShowQRCode(request.pickup_code)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                    >
                      Show QR Code
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pickup QR Code
              </h3>
              <div className="flex justify-center mb-4">
                <QRCodeSVG value={showQRCode} size={200} />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Show this QR code to complete the item pickup.
              </p>
              <button
                onClick={() => setShowQRCode(null)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
