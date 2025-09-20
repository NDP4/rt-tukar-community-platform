"use client";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";
import { useAlert } from "@/components/ui/AlertProvider";
import { useToast } from "@/components/ui/ToastProvider";

export default function DatabaseDebug() {
  const { user, loading } = useAuth();
  const [dbStatus, setDbStatus] = useState<{ [key: string]: any }>({});
  const [testLoading, setTestLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);
  const { showError, showSuccess, showInfo } = useAlert();
  const { showSuccess: showToastSuccess, showError: showToastError } =
    useToast();

  const testDatabase = useCallback(async () => {
    if (!user) return;

    setTestLoading(true);
    const results: any = {};

    try {
      // Test RTs table
      const { data: rts, error: rtsError } = await supabase
        .from("rts")
        .select("*")
        .limit(5);

      results.rts = { data: rts, error: rtsError };

      // Test profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .limit(5);

      results.profiles = { data: profiles, error: profilesError };

      // Test members table
      const { data: members, error: membersError } = await supabase
        .from("members")
        .select("*")
        .limit(5);

      results.members = { data: members, error: membersError };

      // Test items table
      const { data: items, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .limit(5);

      results.items = { data: items, error: itemsError };

      // Test user membership
      const { data: userMember, error: memberError } = await supabase
        .from("members")
        .select("*, rt:rts(*)")
        .eq("profile_id", user.id)
        .single();

      results.userMember = { data: userMember, error: memberError };

      setDbStatus(results);
    } catch (error) {
      console.error("Database test error:", error);
      setDbStatus({ error: { message: (error as Error).message } });
    } finally {
      setTestLoading(false);
    }
  }, [user]);

  const makeAdmin = async () => {
    if (!user) return;
    setAdminLoading(true);
    try {
      const { error } = await supabase
        .from("members")
        .update({ role: "admin" })
        .eq("profile_id", user.id);

      if (error) {
        showError(`Error making admin`, error.message);
      } else {
        showSuccess("Successfully made admin!", "You may need to refresh.");
      }
    } catch (error) {
      console.error("Error making admin:", error);
      showError("Error making admin", "Check console for details.");
    } finally {
      setAdminLoading(false);
    }
  };

  const fixRLSPolicies = async () => {
    if (!user) return;
    setFixLoading(true);
    try {
      // Execute RLS fix through SQL
      const sqlCommands = [
        `DROP POLICY IF EXISTS "rts_public" ON rts`,
        `CREATE POLICY "rts_read" ON rts FOR SELECT TO authenticated USING (true)`,
        `CREATE POLICY "rts_insert" ON rts FOR INSERT TO authenticated WITH CHECK (true)`,
      ];

      for (const sql of sqlCommands) {
        const { error } = await supabase.rpc("exec_sql", { query: sql });
        if (error) {
          console.error(`Error executing: ${sql}`, error);
        }
      }

      showInfo("RLS policies updated!", "Try creating RT again.");
    } catch (error) {
      console.error("Error fixing RLS:", error);
      showError(
        "Error fixing RLS",
        "Please run the SQL manually in Supabase SQL Editor."
      );
    } finally {
      setFixLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      testDatabase();
    }
  }, [user, loading, testDatabase]);

  if (loading) return <div>Loading auth...</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Database Debug</h1>

        <div className="bg-white p-4 rounded mb-4">
          <h2 className="font-bold mb-2">User Info:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(
              {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name,
              },
              null,
              2
            )}
          </pre>
        </div>

        <button
          onClick={testDatabase}
          disabled={testLoading}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {testLoading ? "Testing..." : "Test Database"}
        </button>

        <button
          onClick={makeAdmin}
          disabled={adminLoading}
          className="mb-4 ml-4 bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {adminLoading ? "Making Admin..." : "Make Me Admin"}
        </button>

        <button
          onClick={fixRLSPolicies}
          disabled={fixLoading}
          className="mb-4 ml-4 bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {fixLoading ? "Fixing RLS..." : "Fix RLS Policies"}
        </button>

        <div className="grid gap-4">
          {Object.entries(dbStatus).map(([key, value]: [string, any]) => (
            <div key={key} className="bg-white p-4 rounded">
              <h3 className="font-bold mb-2 capitalize">{key}:</h3>
              <div className="text-sm">
                {value?.error ? (
                  <div className="text-red-600 bg-red-50 p-2 rounded">
                    <strong>Error:</strong>{" "}
                    {value.error.message || JSON.stringify(value.error)}
                  </div>
                ) : (
                  <div className="text-green-600 bg-green-50 p-2 rounded">
                    <strong>Success:</strong>
                    <pre className="mt-2 text-xs overflow-auto">
                      {JSON.stringify(value?.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-yellow-50 p-4 rounded">
          <h3 className="font-bold mb-2">Fix Instructions:</h3>
          <p className="text-sm">
            Jika ada error "infinite recursion" atau "RLS policy violation",
            silakan jalankan script berikut di Supabase SQL Editor:
          </p>
          <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
            {`-- Fix RLS policies untuk membuat RT baru
-- Drop existing policies
DROP POLICY IF EXISTS "rts_public" ON rts;
DROP POLICY IF EXISTS "rts_read" ON rts;
DROP POLICY IF EXISTS "rts_insert" ON rts;
DROP POLICY IF EXISTS "rts_update" ON rts;
DROP POLICY IF EXISTS "rts_delete" ON rts;

-- Create comprehensive RLS policies
CREATE POLICY "rts_read" ON rts FOR SELECT TO authenticated USING (true);
CREATE POLICY "rts_insert" ON rts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rts_update" ON rts FOR UPDATE TO authenticated USING (
  id IN (SELECT rt_id FROM members WHERE profile_id = auth.uid() AND role = 'admin')
);

-- Ensure RLS is enabled
ALTER TABLE rts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create profiles and members policies if not exist
CREATE POLICY IF NOT EXISTS "profiles_own" ON profiles FOR ALL TO authenticated USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "members_own" ON members FOR ALL TO authenticated USING (profile_id = auth.uid());

-- Insert sample RTs (optional)
INSERT INTO rts (id, name, kelurahan, kecamatan) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'RT 001/RW 005', 'Menteng', 'Menteng'),
  ('550e8400-e29b-41d4-a716-446655440002', 'RT 002/RW 003', 'Kemang', 'Mampang Prapatan')
ON CONFLICT (id) DO NOTHING;`}
          </pre>
        </div>
      </div>
    </div>
  );
}
