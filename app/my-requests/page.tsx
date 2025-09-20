"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserMembership,
  getRequestsByOwner,
  acceptRequest,
  rejectRequest,
} from "@/lib/utils";
import { RequestWithDetails, MemberWithDetails } from "@/lib/types";
import { Check, X, Clock, MessageSquare } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useAlert } from "@/components/ui/AlertProvider";
import { useToast } from "@/components/ui/ToastProvider";

export default function MyRequestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showError, showSuccess } = useAlert();
  const toast = useToast();
  const [membership, setMembership] = useState<MemberWithDetails | null>(null);
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [replyMessages, setReplyMessages] = useState<{ [key: string]: string }>(
    {}
  );
  const [processingRequests, setProcessingRequests] = useState<{
    [key: string]: boolean;
  }>({});

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

        console.log("Loading requests for user:", user.id);
        const requestsData = await getRequestsByOwner(user.id);
        console.log("Requests data:", requestsData);
        setRequests(requestsData);
      } catch (error) {
        console.error("Error loading data:", error);
        showError("Failed to load requests", (error as Error).message);
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [user, loading, router, showError]);

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequests((prev) => ({ ...prev, [requestId]: true }));
    try {
      const replyMessage = replyMessages[requestId];
      await acceptRequest(requestId, replyMessage);
      toast.showSuccess("Success!", "Request accepted successfully");

      if (membership) {
        const requestsData = await getRequestsByOwner(user!.id);
        setRequests(requestsData);
      }
      setReplyMessages((prev) => ({ ...prev, [requestId]: "" }));
    } catch (error) {
      console.error("Error accepting request:", error);
      showError("Failed to accept request", "Please try again later");
    } finally {
      setProcessingRequests((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequests((prev) => ({ ...prev, [requestId]: true }));
    try {
      const replyMessage = replyMessages[requestId];
      await rejectRequest(requestId, replyMessage);
      toast.showInfo("Request Rejected", "The request has been declined");

      if (membership) {
        const requestsData = await getRequestsByOwner(user!.id);
        setRequests(requestsData);
      }
      setReplyMessages((prev) => ({ ...prev, [requestId]: "" }));
    } catch (error) {
      console.error("Error rejecting request:", error);
      showError("Failed to reject request", "Please try again later");
    } finally {
      setProcessingRequests((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;

    const variants = {
      pending:
        "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium",
      accepted:
        "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium",
      rejected:
        "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium",
      collected:
        "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium",
    };

    const icons = {
      pending: <Clock className="w-3 h-3 inline mr-1" />,
      accepted: <Check className="w-3 h-3 inline mr-1" />,
      rejected: <X className="w-3 h-3 inline mr-1" />,
      collected: <Check className="w-3 h-3 inline mr-1" />,
    };

    return (
      <span className={variants[status as keyof typeof variants]}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    return null;
  }

  const pendingRequests = requests.filter((req) => req.status === "pending");
  const processedRequests = requests.filter((req) => req.status !== "pending");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar membership={membership} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Incoming Requests
            </h1>
            <p className="text-gray-600">Manage requests for your items</p>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Requests Yet
              </h3>
              <p className="text-gray-600">
                When someone requests your items, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {pendingRequests.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-yellow-500" />
                    Pending Requests ({pendingRequests.length})
                  </h2>
                  <div className="grid gap-6">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-white rounded-lg shadow border-l-4 border-l-yellow-400 p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">
                              {request.item?.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                Requested by:{" "}
                                <strong>{request.requester?.name}</strong>
                              </span>
                              <span>•</span>
                              <span>{formatDate(request.created_at)}</span>
                            </div>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="space-y-4">
                          {request.message && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Request Message:
                              </p>
                              <p className="text-gray-700">{request.message}</p>
                            </div>
                          )}

                          <div className="space-y-3">
                            <textarea
                              placeholder="Optional reply message..."
                              value={replyMessages[request.id] || ""}
                              onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>
                              ) =>
                                setReplyMessages((prev) => ({
                                  ...prev,
                                  [request.id]: e.target.value,
                                }))
                              }
                              className="w-full min-h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />

                            <div className="flex gap-3">
                              <button
                                onClick={() => handleAcceptRequest(request.id)}
                                disabled={processingRequests[request.id]}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1 flex items-center justify-center disabled:opacity-50"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                {processingRequests[request.id]
                                  ? "Accepting..."
                                  : "Accept Request"}
                              </button>

                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                disabled={processingRequests[request.id]}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex-1 flex items-center justify-center disabled:opacity-50"
                              >
                                <X className="w-4 h-4 mr-2" />
                                {processingRequests[request.id]
                                  ? "Rejecting..."
                                  : "Reject Request"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {processedRequests.length > 0 && (
                <div>
                  <hr className="my-8" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Check className="w-5 h-5 mr-2 text-gray-500" />
                    Processed Requests ({processedRequests.length})
                  </h2>
                  <div className="grid gap-4">
                    {processedRequests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-white rounded-lg shadow p-6 opacity-75"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {request.item?.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                Requested by:{" "}
                                <strong>{request.requester?.name}</strong>
                              </span>
                              <span>•</span>
                              <span>{formatDate(request.created_at)}</span>
                              {request.replied_at && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Replied: {formatDate(request.replied_at)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        {request.message && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Original Message:
                            </p>
                            <p className="text-sm text-gray-700">
                              {request.message}
                            </p>
                          </div>
                        )}

                        {request.reply_message && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-blue-700 mb-1">
                              Your Reply:
                            </p>
                            <p className="text-sm text-blue-700">
                              {request.reply_message}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
