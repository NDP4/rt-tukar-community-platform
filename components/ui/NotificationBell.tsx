"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { getUnreadNotificationsCount } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const loadUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const count = await getUnreadNotificationsCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  }, [user]);

  useEffect(() => {
    loadUnreadCount();

    // Refresh count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationRead = () => {
    // Refresh count when notification is read
    loadUnreadCount();
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 z-50">
            <NotificationDropdown
              onClose={() => setIsOpen(false)}
              onNotificationRead={handleNotificationRead}
            />
          </div>
        </>
      )}
    </div>
  );
}
