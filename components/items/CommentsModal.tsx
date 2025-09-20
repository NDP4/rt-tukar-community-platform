"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Send, Trash2 } from "lucide-react";
import {
  getItemComments,
  addItemComment,
  deleteComment,
  getCurrentUser,
  notifyItemCommented,
  getCurrentProfile,
} from "@/lib/utils";
import { ItemWithDetails } from "@/lib/types";
import { useAlert } from "@/components/ui/AlertProvider";
import { useToast } from "@/components/ui/ToastProvider";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface CommentsModalProps {
  item: ItemWithDetails;
  onClose: () => void;
}

export default function CommentsModal({ item, onClose }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const { showError, showConfirm } = useAlert();
  const { showSuccess, showError: showToastError } = useToast();

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getItemComments(item.id);
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  }, [item.id]);

  useEffect(() => {
    loadComments();
    loadCurrentUser();
  }, [loadComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await addItemComment(item.id, newComment);
      setComments([...comments, comment]);
      setNewComment("");
      showSuccess("Comment added successfully!");

      // Send notification to item owner if it's not their own item
      if (item.donor_id !== currentUser?.id) {
        try {
          const currentProfile = await getCurrentProfile();
          if (currentProfile && item.donor) {
            await notifyItemCommented(
              item.donor.id,
              currentProfile.name || "Someone",
              item.title,
              item.id
            );
          }
        } catch (error) {
          console.error("Error sending comment notification:", error);
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      showError("Failed to add comment", "Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    showConfirm(
      "Delete Comment",
      "Are you sure you want to delete this comment? This action cannot be undone.",
      async () => {
        try {
          await deleteComment(commentId);
          setComments(comments.filter((c) => c.id !== commentId));
          showSuccess("Comment deleted successfully!");
        } catch (error) {
          console.error("Error deleting comment:", error);
          showToastError("Failed to delete comment", "Please try again later.");
        }
      }
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Comments on {item.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center text-gray-500">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 rounded-lg p-3 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {comment.user?.name || "Unknown User"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.body}</p>
                  </div>
                  {currentUser?.id === comment.user_id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      title="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmitComment} className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? (
                <span className="text-sm">...</span>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
