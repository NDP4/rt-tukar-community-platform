"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Clock, CheckCircle, XCircle, Package } from "lucide-react";
import { RequestWithDetails } from "@/lib/types";

interface RequestsListProps {
  requests: RequestWithDetails[];
}

export default function RequestsList({ requests }: RequestsListProps) {
  const [showQRCode, setShowQRCode] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "collected":
        return <Package className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "collected":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No requests yet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Browse available items in your community to make your first request.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {getStatusIcon(request.status || "pending")}
                <h3 className="text-lg font-semibold text-gray-900">
                  {request.item?.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    request.status || "pending"
                  )}`}
                >
                  {request.status || "pending"}
                </span>
              </div>

              <p className="text-gray-600 mb-2">{request.item?.description}</p>

              <div className="text-sm text-gray-500 space-y-1">
                <p>Donor: {request.item?.donor?.name}</p>
                <p>
                  Quantity: {request.item?.quantity} {request.item?.unit}
                </p>
                <p>
                  Requested: {new Date(request.created_at).toLocaleDateString()}
                </p>
                {request.message && (
                  <p>Message: &quot;{request.message}&quot;</p>
                )}
              </div>

              {request.status === "accepted" && request.pickup_code && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">
                    Request Accepted! 🎉
                  </h4>
                  <p className="text-sm text-green-700 mb-3">
                    Your request has been approved. Show the QR code below to
                    the donor for pickup.
                  </p>
                  <button
                    onClick={() => setShowQRCode(request.pickup_code)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                  >
                    Show QR Code
                  </button>
                  {request.pickup_address && (
                    <p className="text-sm text-green-700 mt-2">
                      Pickup Address: {request.pickup_address}
                    </p>
                  )}
                  {request.scheduled_pickup_date && (
                    <p className="text-sm text-green-700">
                      Scheduled:{" "}
                      {new Date(request.scheduled_pickup_date).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {request.status === "rejected" && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900">Request Declined</h4>
                  <p className="text-sm text-red-700">
                    Unfortunately, this request was not approved by the donor.
                  </p>
                </div>
              )}

              {request.status === "collected" && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">
                    Item Collected ✅
                  </h4>
                  <p className="text-sm text-blue-700">
                    You have successfully collected this item. Thank you for
                    participating in the community exchange!
                  </p>
                  {request.pickup_code_used_at && (
                    <p className="text-sm text-blue-700">
                      Collected on:{" "}
                      {new Date(request.pickup_code_used_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

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
                Show this QR code to the donor for item pickup verification.
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
