"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Heart,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Package,
} from "lucide-react";
import { ItemWithDetails, MemberWithDetails } from "@/lib/types";
import {
  deleteItem,
  getItemPhotoUrl,
  toggleItemLike,
  getItemStats,
  isItemLikedByUser,
  notifyItemLiked,
  getCurrentProfile,
} from "@/lib/utils";
import RequestModal from "./RequestModal";
import EditItemModal from "./EditItemModal";
import CommentsModal from "./CommentsModal";
import { useAlert } from "@/components/ui/AlertProvider";
import { useToast } from "@/components/ui/ToastProvider";

interface ItemCardProps {
  item: ItemWithDetails;
  onItemChange: () => void;
  membership: MemberWithDetails;
}

export default function ItemCard({
  item,
  onItemChange,
  membership,
}: ItemCardProps) {
  const { showConfirm, showError } = useAlert();
  const toast = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likingLoading, setLikingLoading] = useState(false);

  const canEdit =
    item.donor_id === membership.profile_id || membership.role === "admin";

  // Load likes and comments data
  const loadItemData = useCallback(async () => {
    try {
      const [stats, liked] = await Promise.all([
        getItemStats(item.id),
        isItemLikedByUser(item.id, membership.profile_id),
      ]);

      setLikesCount(stats.likesCount);
      setCommentsCount(stats.commentsCount);
      setIsLiked(liked);
    } catch (error) {
      console.error("Error loading item data:", error);
    }
  }, [item.id, membership.profile_id]);

  useEffect(() => {
    loadItemData();
  }, [loadItemData]);

  const handleLike = async () => {
    if (likingLoading) return;

    setLikingLoading(true);
    try {
      const result = await toggleItemLike(item.id);
      setIsLiked(result.liked);
      setLikesCount((prev) => (result.liked ? prev + 1 : prev - 1));

      // Show feedback
      if (result.liked) {
        toast.showSuccess("Liked!", "Item added to your favorites");

        // Send notification to item owner if it's not their own item
        if (item.donor_id !== membership?.profile_id) {
          console.log("Checking notification conditions:", {
            item_donor_id: item.donor_id,
            current_user_id: membership?.profile_id,
            should_notify: item.donor_id !== membership?.profile_id,
          });

          // Debug: Log full item data
          console.log("Full item data:", item);
          console.log("Item keys:", Object.keys(item));
          console.log("Has donor?", !!item.donor);

          try {
            console.log("Getting current profile for notification...");
            const currentProfile = await getCurrentProfile();
            console.log("Current profile:", currentProfile);

            if (currentProfile && item.donor) {
              console.log("Sending like notification:", {
                to_user_id: item.donor.id,
                from_user: currentProfile.name,
                item_title: item.title,
                item_id: item.id,
              });

              await notifyItemLiked(
                item.donor.id,
                currentProfile.name || "Someone",
                item.title,
                item.id
              );
              console.log("✅ Like notification sent successfully");
            } else {
              console.log("❌ Missing data for notification:", {
                currentProfile: !!currentProfile,
                item_donor: !!item.donor,
              });
            }
          } catch (error) {
            console.error("❌ Error sending like notification:", error);
          }
        } else {
          console.log("Skipping notification: user liked own item");
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      showError("Failed to like item", "Please try again later");
    } finally {
      setLikingLoading(false);
    }
  };

  const handleCommentsUpdate = () => {
    // Reload comments count when comments modal is closed
    loadItemData();
  };

  const handleDelete = async () => {
    showConfirm(
      "Delete Item",
      "Are you sure you want to delete this item? This action cannot be undone.",
      async () => {
        setLoading(true);
        try {
          await deleteItem(item.id);
          toast.showSuccess(
            "Item Deleted",
            "The item has been successfully deleted"
          );
          onItemChange();
        } catch (error) {
          console.error("Failed to delete item:", error);
          showError("Failed to delete item", "Please try again later");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "bg-green-100 text-green-800";
      case "like_new":
        return "bg-blue-100 text-blue-800";
      case "good":
        return "bg-yellow-100 text-yellow-800";
      case "fair":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {item.photo_path ? (
          <Image
            src={getItemPhotoUrl(item.photo_path)}
            alt={item.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              item.status || "available"
            )}`}
          >
            {item.status || "available"}
          </span>
        </div>

        {/* Menu for owner/admin */}
        {canEdit && (
          <div className="absolute top-2 right-2">
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full bg-white shadow-md hover:bg-gray-50"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowEditModal(true);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    disabled={loading}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {item.title}
          </h3>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {item.category}
          </span>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
              item.condition || "good"
            )}`}
          >
            {item.condition || "good"}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
          <span>
            {item.quantity} {item.unit}
          </span>
          <span>by {item.donor?.name || "Unknown"}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={handleLike}
              disabled={likingLoading}
              className={`flex items-center transition-colors ${
                isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
              } disabled:opacity-50`}
            >
              <Heart
                className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
              />
              <span className="text-sm">{likesCount}</span>
            </button>
            <button
              onClick={() => setShowCommentsModal(true)}
              className="flex items-center text-gray-500 hover:text-blue-500"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-sm">{commentsCount}</span>
            </button>
          </div>

          {item.status === "available" &&
            item.donor_id !== membership.profile_id && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                Request
              </button>
            )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <RequestModal
          item={item}
          onClose={() => setShowRequestModal(false)}
          onRequestSent={onItemChange}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditItemModal
          item={item}
          onClose={() => setShowEditModal(false)}
          onItemUpdated={onItemChange}
        />
      )}

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          item={item}
          onClose={() => {
            setShowCommentsModal(false);
            handleCommentsUpdate();
          }}
        />
      )}
    </div>
  );
}
