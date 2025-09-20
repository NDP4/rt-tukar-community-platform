/**
 * Theme utilities for consistent dark/light mode styling
 */

// Base component classes
export const themeClasses = {
  // Page backgrounds
  page: "min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors",

  // Card components
  card: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-colors",
  cardHover:
    "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-lg transition-all",

  // Text
  textPrimary: "text-gray-900 dark:text-gray-100",
  textSecondary: "text-gray-600 dark:text-gray-300",
  textMuted: "text-gray-500 dark:text-gray-400",
  textError: "text-red-600 dark:text-red-400",
  textSuccess: "text-green-600 dark:text-green-400",
  textWarning: "text-yellow-600 dark:text-yellow-400",

  // Inputs
  input:
    "block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-offset-gray-800 transition-colors",

  // Buttons
  buttonPrimary:
    "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors",
  buttonSecondary:
    "inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors",
  buttonDanger:
    "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors",

  // Links
  link: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors",

  // Borders
  border: "border-gray-200 dark:border-gray-700",
  borderHover: "border-gray-300 dark:border-gray-600",

  // Backgrounds
  bgPrimary: "bg-white dark:bg-gray-800",
  bgSecondary: "bg-gray-50 dark:bg-gray-900",
  bgMuted: "bg-gray-100 dark:bg-gray-700",
  bgHover: "hover:bg-gray-50 dark:hover:bg-gray-700",

  // States
  success:
    "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-600 dark:text-green-400",
  error:
    "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400",
  warning:
    "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400",
  info: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400",

  // Focus rings
  focusRing:
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800",
};

// Utility function to combine theme classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Quick theme helpers
export const theme = {
  page: (additional?: string) => cn(themeClasses.page, additional),
  card: (additional?: string) => cn(themeClasses.card, additional),
  cardHover: (additional?: string) => cn(themeClasses.cardHover, additional),
  text: {
    primary: (additional?: string) => cn(themeClasses.textPrimary, additional),
    secondary: (additional?: string) =>
      cn(themeClasses.textSecondary, additional),
    muted: (additional?: string) => cn(themeClasses.textMuted, additional),
    error: (additional?: string) => cn(themeClasses.textError, additional),
    success: (additional?: string) => cn(themeClasses.textSuccess, additional),
  },
  button: {
    primary: (additional?: string) =>
      cn(themeClasses.buttonPrimary, additional),
    secondary: (additional?: string) =>
      cn(themeClasses.buttonSecondary, additional),
    danger: (additional?: string) => cn(themeClasses.buttonDanger, additional),
  },
  input: (additional?: string) => cn(themeClasses.input, additional),
  link: (additional?: string) => cn(themeClasses.link, additional),
};
