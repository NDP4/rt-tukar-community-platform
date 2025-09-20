"use client";

import {
  Heart,
  MessageCircle,
  Gift,
  Check,
  X,
  Reply,
  Trash2,
} from "lucide-react";
import { Notification } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "request":
        return <Gift className="h-5 w-5 text-purple-500" />;
      case "accept":
        return <Check className="h-5 w-5 text-green-500" />;
      case "reject":
        return <X className="h-5 w-5 text-red-500" />;
      case "reply":
        return <Reply className="h-5 w-5 text-indigo-500" />;
      default:
        return <MessageCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    if (notification.is_read) return "bg-white dark:bg-gray-800";
    return "bg-blue-50 dark:bg-blue-900/20";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Baru saja";
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    if (diffInDays < 7) return `${diffInDays} hari lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${getBgColor()} transition-colors`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p
                className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${
                  !notification.is_read ? "font-semibold" : ""
                }`}
              >
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {formatTime(notification.created_at)}
              </p>
            </div>

            <div className="flex items-center space-x-1 ml-2">
              {!notification.is_read && (
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  title="Unread"
                />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete notification"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
