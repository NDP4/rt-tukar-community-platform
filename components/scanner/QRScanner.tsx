"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { MemberWithDetails, RequestWithDetails } from "@/lib/types";
import { validatePickupCode, markPickupCodeUsed } from "@/lib/utils";

interface QRScannerProps {
  membership: MemberWithDetails;
}

export default function QRScanner({ membership }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    type: "success" | "error" | "info";
    message: string;
    request?: RequestWithDetails;
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanning = () => {
    setIsScanning(true);
    setScanResult(null);

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        setProcessing(true);
        try {
          const request = await validatePickupCode(decodedText);

          if (!request) {
            setScanResult({
              type: "error",
              message: "Invalid or expired pickup code",
            });
          } else {
            // Check if user has permission to validate this code
            const canValidate =
              request.item?.donor_id === membership.profile_id ||
              membership.role === "admin";

            if (!canValidate) {
              setScanResult({
                type: "error",
                message:
                  "You do not have permission to validate this pickup code",
              });
            } else {
              setScanResult({
                type: "info",
                message: "Valid pickup code found. Confirm collection?",
                request,
              });
            }
          }
        } catch (error) {
          setScanResult({
            type: "error",
            message: "Failed to validate pickup code",
          });
        } finally {
          setProcessing(false);
          scanner.clear();
          setIsScanning(false);
        }
      },
      (error) => {
        console.log("QR scan error:", error);
      }
    );

    scannerRef.current = scanner;
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const confirmCollection = async () => {
    if (!scanResult?.request) return;

    setProcessing(true);
    try {
      await markPickupCodeUsed(scanResult.request.id);
      setScanResult({
        type: "success",
        message: "Item collection confirmed successfully!",
        request: scanResult.request,
      });
    } catch (error) {
      setScanResult({
        type: "error",
        message: "Failed to confirm collection",
      });
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        {!isScanning && !scanResult && (
          <div className="text-center">
            <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to Scan
            </h3>
            <p className="text-gray-600 mb-6">
              Click the button below to start scanning QR codes for pickup
              verification
            </p>
            <button
              onClick={startScanning}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
            >
              Start Scanning
            </button>
          </div>
        )}

        {isScanning && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Scanning for QR Code
              </h3>
              <p className="text-gray-600">
                Point your camera at the QR code to scan
              </p>
            </div>

            <div id="qr-reader" className="mb-4"></div>

            <div className="text-center">
              <button
                onClick={stopScanning}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Stop Scanning
              </button>
            </div>
          </div>
        )}

        {scanResult && (
          <div
            className={`p-4 rounded-md ${
              scanResult.type === "success"
                ? "bg-green-50"
                : scanResult.type === "error"
                ? "bg-red-50"
                : "bg-blue-50"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {scanResult.type === "success" && (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                )}
                {scanResult.type === "error" && (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                {scanResult.type === "info" && (
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3
                  className={`text-sm font-medium ${
                    scanResult.type === "success"
                      ? "text-green-800"
                      : scanResult.type === "error"
                      ? "text-red-800"
                      : "text-blue-800"
                  }`}
                >
                  {scanResult.message}
                </h3>

                {scanResult.request && (
                  <div
                    className={`mt-2 text-sm ${
                      scanResult.type === "success"
                        ? "text-green-700"
                        : scanResult.type === "error"
                        ? "text-red-700"
                        : "text-blue-700"
                    }`}
                  >
                    <p>
                      <strong>Item:</strong> {scanResult.request.item?.title}
                    </p>
                    <p>
                      <strong>Requester:</strong>{" "}
                      {scanResult.request.requester?.name}
                    </p>
                    <p>
                      <strong>Quantity:</strong>{" "}
                      {scanResult.request.item?.quantity}{" "}
                      {scanResult.request.item?.unit}
                    </p>
                    {scanResult.request.pickup_address && (
                      <p>
                        <strong>Pickup Address:</strong>{" "}
                        {scanResult.request.pickup_address}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 space-x-3">
                  {scanResult.type === "info" && scanResult.request && (
                    <button
                      onClick={confirmCollection}
                      disabled={processing}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {processing ? "Confirming..." : "Confirm Collection"}
                    </button>
                  )}
                  <button
                    onClick={resetScanner}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Scan Another Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {processing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Processing...</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Only donors and RT admins can validate pickup codes</li>
          <li>• Each QR code can only be used once</li>
          <li>
            • Make sure to confirm the requester&apos;s identity before scanning
          </li>
          <li>
            • The item status will automatically update to &quot;collected&quot;
          </li>
        </ul>
      </div>
    </div>
  );
}
