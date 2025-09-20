"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  createNotification,
  getUserNotifications,
  getUnreadNotificationsCount,
  notifyItemLiked,
  notifyItemCommented,
  getCurrentProfile,
} from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function NotificationDebug() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testDatabase = async () => {
    setLoading(true);
    addLog("Starting database test...");

    try {
      // Test 1: Check if notifications table exists
      addLog("Testing notifications table...");
      const { data: tableTest, error: tableError } = await supabase
        .from("notifications")
        .select("*")
        .limit(1);

      if (tableError) {
        addLog(`❌ Table error: ${tableError.message}`);
        return;
      } else {
        addLog("✅ Notifications table exists");
      }

      // Test 2: Create a test notification
      if (user) {
        addLog("Creating test notification...");
        const testNotification = await createNotification({
          userId: user.id,
          type: "like",
          title: "Test Notification",
          message: "This is a test notification",
          relatedId: "test-id",
          relatedType: "item",
        });
        addLog(`✅ Test notification created: ${testNotification.id}`);

        // Test 3: Fetch notifications
        addLog("Fetching notifications...");
        const userNotifications = await getUserNotifications(user.id);
        setNotifications(userNotifications);
        addLog(`✅ Found ${userNotifications.length} notifications`);

        // Test 4: Count unread
        addLog("Counting unread notifications...");
        const count = await getUnreadNotificationsCount(user.id);
        setUnreadCount(count);
        addLog(`✅ Unread count: ${count}`);
      } else {
        addLog("❌ No user logged in");
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
      console.error("Test error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testDirectInsert = async () => {
    if (!user) {
      addLog("❌ No user logged in");
      return;
    }

    addLog("Testing direct insert with current auth...");

    try {
      // Test 1: Direct supabase insert
      addLog("Step 1: Testing direct supabase insert...");
      const { data: directResult, error: directError } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          type: "direct_test",
          title: "Direct Test",
          message: "Testing direct supabase insert from frontend",
          is_read: false,
        })
        .select()
        .single();

      if (directError) {
        addLog(`❌ Direct insert error: ${directError.message}`);
        addLog(`Error details: ${JSON.stringify(directError)}`);
      } else {
        addLog(`✅ Direct insert success: ${directResult.id}`);
      }

      // Test 2: Using createNotification function
      addLog("Step 2: Testing createNotification function...");
      const functionResult = await createNotification({
        userId: user.id,
        type: "like",
        title: "Function Test",
        message: "Testing createNotification function",
      });
      addLog(`✅ Function test success: ${functionResult.id}`);

      // Refresh notifications
      const userNotifications = await getUserNotifications(user.id);
      setNotifications(userNotifications);
      const count = await getUnreadNotificationsCount(user.id);
      setUnreadCount(count);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      addLog(`❌ Test error: ${errorMsg}`);
      console.error("Direct insert test error:", {
        message: error instanceof Error ? error.message : error,
        full_error: error,
      });
    }
  };

  const testAuthContext = async () => {
    addLog("Testing auth context...");

    try {
      // Check current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        addLog(`❌ Session error: ${sessionError.message}`);
        return;
      }

      if (!session) {
        addLog("❌ No active session");
        return;
      }

      addLog(`✅ Session active: ${session.user.id}`);
      addLog(`✅ Access token exists: ${!!session.access_token}`);

      // Test RLS with current context
      const { data: rlsTest, error: rlsError } = await supabase
        .from("notifications")
        .select("count(*)")
        .eq("user_id", session.user.id);

      if (rlsError) {
        addLog(`❌ RLS test error: ${rlsError.message}`);
      } else {
        addLog(`✅ RLS test passed: can read own notifications`);
      }
    } catch (error) {
      addLog(`❌ Auth context error: ${error}`);
    }
  };
  const clearNotifications = async () => {
    if (!user) return;

    try {
      addLog("Clearing test notifications...");
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id)
        .eq("title", "Test Notification");

      if (error) throw error;

      addLog("✅ Test notifications cleared");

      // Refresh
      const userNotifications = await getUserNotifications(user.id);
      setNotifications(userNotifications);
      const count = await getUnreadNotificationsCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      addLog(`❌ Clear error: ${error}`);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Please login to test notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Notification System Debug</h1>
      {/* Controls */}
      <div className="mb-6 space-x-4">
        <button
          onClick={testDatabase}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Database"}
        </button>

        <button
          onClick={testDirectInsert}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Direct Insert
        </button>

        <button
          onClick={testAuthContext}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Test Auth Context
        </button>

        <button
          onClick={clearNotifications}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear Test Notifications
        </button>
      </div>{" "}
      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Status</h3>
          <p>User ID: {user.id}</p>
          <p>Unread Count: {unreadCount}</p>
          <p>Total Notifications: {notifications.length}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Test Log</h3>
          <div className="max-h-32 overflow-y-auto text-sm">
            {testResults.map((result, index) => (
              <div key={index} className="mb-1 font-mono">
                {result}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Notifications List */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Current Notifications</h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications found</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded border ${
                  notification.is_read ? "bg-gray-50" : "bg-blue-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-xs">
                    <span
                      className={`px-2 py-1 rounded ${
                        notification.is_read ? "bg-gray-200" : "bg-blue-200"
                      }`}
                    >
                      {notification.is_read ? "Read" : "Unread"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
