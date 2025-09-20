"use client";

import { useState } from "react";
import createClient from "@/lib/supabase";
import { Check, X, AlertCircle } from "lucide-react";

interface PickupValidationProps {
  requestId: string;
  pickupCode: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PickupValidation({
  requestId,
  pickupCode,
  onSuccess,
  onCancel,
}: PickupValidationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient;

  const validatePickup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Update request status to completed and mark pickup code as used
      const { error: updateError } = await supabase
        .from("requests")
        .update({
          status: "completed",
          pickup_code_used_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .eq("pickup_code", pickupCode);

      if (updateError) {
        throw updateError;
      }

      onSuccess();
    } catch (err) {
      console.error("Error validating pickup:", err);
      setError(
        "Failed to validate pickup. Please check the QR code and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Validate Pickup</h2>
        <p className="text-gray-600 mt-2">
          Confirm that the item has been picked up by the requester
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Request ID:</p>
          <p className="font-mono text-sm">{requestId}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Pickup Code:</p>
          <p className="font-mono text-sm">{pickupCode}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <X className="h-4 w-4 text-red-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            onClick={validatePickup}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>{isLoading ? "Validating..." : "Confirm Pickup"}</span>
          </button>

          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
