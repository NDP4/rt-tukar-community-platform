import { createClient } from "@/lib/supabase-server";

export default async function AuthTestPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Auth Status Debug
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-600">Error: {error.message}</p>
            </div>
          )}

          {user ? (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-600 font-medium">
                User is authenticated!
              </p>
              <p className="text-sm text-gray-600 mt-2">Email: {user.email}</p>
              <p className="text-sm text-gray-600">ID: {user.id}</p>
              <p className="text-sm text-gray-600">
                Email Confirmed: {user.email_confirmed_at ? "Yes" : "No"}
              </p>
              <div className="mt-4">
                <a
                  href="/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-yellow-600 font-medium">No user found</p>
              <div className="mt-4">
                <a
                  href="/auth/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Go to Login
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
