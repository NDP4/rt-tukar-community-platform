"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Gift,
  Check,
  X,
  Bell,
  User,
  Package,
  Settings,
  Search,
  Filter,
  Plus,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { theme } from "@/lib/theme";

export default function ThemeTestPage() {
  const [activeTab, setActiveTab] = useState("components");

  const tabs = [
    { id: "components", label: "Components" },
    { id: "forms", label: "Forms" },
    { id: "cards", label: "Cards" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div className={theme.page("p-6")}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={theme.text.primary("text-3xl font-bold")}>
              Theme Test Page
            </h1>
            <p className={theme.text.secondary("mt-2")}>
              Test dark/light mode untuk semua komponen UI
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === "components" && (
            <>
              {/* Buttons */}
              <section className={theme.card("p-6")}>
                <h2
                  className={theme.text.primary("text-xl font-semibold mb-4")}
                >
                  Buttons
                </h2>
                <div className="flex flex-wrap gap-4">
                  <button className={theme.button.primary()}>
                    Primary Button
                  </button>
                  <button className={theme.button.secondary()}>
                    Secondary Button
                  </button>
                  <button className={theme.button.danger()}>
                    Danger Button
                  </button>
                  <button
                    className={theme.button.primary("opacity-50")}
                    disabled
                  >
                    Disabled Button
                  </button>
                </div>
              </section>

              {/* Icons */}
              <section className={theme.card("p-6")}>
                <h2
                  className={theme.text.primary("text-xl font-semibold mb-4")}
                >
                  Icons
                </h2>
                <div className="flex flex-wrap gap-4">
                  <Heart className="h-6 w-6 text-red-500" />
                  <MessageCircle className="h-6 w-6 text-blue-500" />
                  <Gift className="h-6 w-6 text-purple-500" />
                  <Check className="h-6 w-6 text-green-500" />
                  <X className="h-6 w-6 text-red-500" />
                  <Bell className="h-6 w-6 text-yellow-500" />
                  <User className={theme.text.secondary("h-6 w-6")} />
                  <Package className={theme.text.primary("h-6 w-6")} />
                  <Settings className={theme.text.muted("h-6 w-6")} />
                </div>
              </section>

              {/* Text Examples */}
              <section className={theme.card("p-6")}>
                <h2
                  className={theme.text.primary("text-xl font-semibold mb-4")}
                >
                  Typography
                </h2>
                <div className="space-y-2">
                  <h1 className={theme.text.primary("text-3xl font-bold")}>
                    Heading 1 - Primary Text
                  </h1>
                  <h2 className={theme.text.primary("text-2xl font-semibold")}>
                    Heading 2 - Primary Text
                  </h2>
                  <h3 className={theme.text.primary("text-xl font-medium")}>
                    Heading 3 - Primary Text
                  </h3>
                  <p className={theme.text.secondary()}>
                    This is secondary text - typically used for descriptions and
                    subtitles
                  </p>
                  <p className={theme.text.muted()}>
                    This is muted text - typically used for captions and less
                    important information
                  </p>
                  <a href="#" className={theme.link()}>
                    This is a link with hover effects
                  </a>
                </div>
              </section>
            </>
          )}

          {activeTab === "forms" && (
            <>
              {/* Form Elements */}
              <section className={theme.card("p-6")}>
                <h2
                  className={theme.text.primary("text-xl font-semibold mb-4")}
                >
                  Form Elements
                </h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label
                      className={theme.text.primary(
                        "block text-sm font-medium mb-2"
                      )}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className={theme.input()}
                    />
                  </div>
                  <div>
                    <label
                      className={theme.text.primary(
                        "block text-sm font-medium mb-2"
                      )}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      className={theme.input()}
                    />
                  </div>
                  <div>
                    <label
                      className={theme.text.primary(
                        "block text-sm font-medium mb-2"
                      )}
                    >
                      Message
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter your message"
                      className={theme.input()}
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label
                      htmlFor="terms"
                      className={theme.text.secondary("text-sm")}
                    >
                      I agree to the terms and conditions
                    </label>
                  </div>
                </div>
              </section>

              {/* Search Bar */}
              <section className={theme.card("p-6")}>
                <h2
                  className={theme.text.primary("text-xl font-semibold mb-4")}
                >
                  Search & Filters
                </h2>
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      className={theme.input("pl-10")}
                    />
                  </div>
                  <button
                    className={theme.button.secondary(
                      "flex items-center space-x-2"
                    )}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </button>
                  <button
                    className={theme.button.primary(
                      "flex items-center space-x-2"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </section>
            </>
          )}

          {activeTab === "cards" && (
            <>
              {/* Basic Cards */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className={theme.cardHover("p-6")}>
                  <h3
                    className={theme.text.primary("text-lg font-semibold mb-2")}
                  >
                    Basic Card
                  </h3>
                  <p className={theme.text.secondary("mb-4")}>
                    This is a basic card component with hover effects
                  </p>
                  <button className={theme.button.primary("w-full")}>
                    Action Button
                  </button>
                </div>

                <div className={theme.cardHover("p-6")}>
                  <div className="flex items-center space-x-3 mb-3">
                    <Package className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <h3
                        className={theme.text.primary("text-lg font-semibold")}
                      >
                        Item Card
                      </h3>
                      <p className={theme.text.muted("text-sm")}>Available</p>
                    </div>
                  </div>
                  <p className={theme.text.secondary("mb-4")}>
                    Sample item description that would appear in an item card
                  </p>
                  <div className="flex space-x-2">
                    <button className={theme.button.secondary("flex-1")}>
                      Request
                    </button>
                    <button className={theme.button.primary("px-3")}>
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className={theme.cardHover("p-6")}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={theme.text.primary("text-lg font-semibold")}>
                      Status Card
                    </h3>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium rounded">
                      Active
                    </span>
                  </div>
                  <p className={theme.text.secondary("mb-4")}>
                    Card with status indicator and metrics
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className={theme.text.primary("text-2xl font-bold")}>
                        24
                      </div>
                      <div className={theme.text.muted("text-sm")}>Items</div>
                    </div>
                    <div>
                      <div className={theme.text.primary("text-2xl font-bold")}>
                        8
                      </div>
                      <div className={theme.text.muted("text-sm")}>
                        Requests
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === "notifications" && (
            <>
              {/* Alert Messages */}
              <section className={theme.card("p-6")}>
                <h2
                  className={theme.text.primary("text-xl font-semibold mb-4")}
                >
                  Alert Messages
                </h2>
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md p-4">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-400 mr-2" />
                      <p className="text-green-600 dark:text-green-400 text-sm">
                        Success! Your item has been added successfully.
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4">
                    <div className="flex items-center">
                      <X className="h-5 w-5 text-red-400 mr-2" />
                      <p className="text-red-600 dark:text-red-400 text-sm">
                        Error! Something went wrong. Please try again.
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 text-yellow-400 mr-2" />
                      <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                        Warning! Please verify your email address.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-4">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-blue-400 mr-2" />
                      <p className="text-blue-600 dark:text-blue-400 text-sm">
                        Info! You have 3 new notifications.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Notification Items */}
              <section className={theme.card("p-6")}>
                <h2
                  className={theme.text.primary("text-xl font-semibold mb-4")}
                >
                  Notification Items
                </h2>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
                    <Heart className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className={theme.text.primary("text-sm font-medium")}>
                        Someone liked your item
                      </p>
                      <p className={theme.text.secondary("text-sm")}>
                        John liked your "Bicycle" item
                      </p>
                      <p className={theme.text.muted("text-xs mt-1")}>
                        2 minutes ago
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className={theme.text.primary("text-sm font-medium")}>
                        New comment on your item
                      </p>
                      <p className={theme.text.secondary("text-sm")}>
                        "Is this still available?" - Sarah
                      </p>
                      <p className={theme.text.muted("text-xs mt-1")}>
                        1 hour ago
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <Gift className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div className="flex-1">
                      <p className={theme.text.primary("text-sm font-medium")}>
                        Request accepted
                      </p>
                      <p className={theme.text.secondary("text-sm")}>
                        Your request for "Books" has been accepted
                      </p>
                      <p className={theme.text.muted("text-xs mt-1")}>
                        3 hours ago
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
