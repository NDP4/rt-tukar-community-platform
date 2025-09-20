"use client";

import { useState, useEffect } from "react";
import { getAllRTs, joinRT, createRT } from "@/lib/utils";
import { RT } from "@/lib/types";

export default function RTSelector() {
  const [rts, setRTs] = useState<RT[]>([]);
  const [selectedRT, setSelectedRT] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRT, setNewRT] = useState({
    name: "",
    kelurahan: "",
    kecamatan: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRTs();
  }, []);

  const loadRTs = async () => {
    try {
      const data = await getAllRTs();
      setRTs(data);
    } catch (error) {
      console.error("Failed to load RTs:", error);
      setError("Failed to load RT communities");
    }
  };

  const handleJoinRT = async () => {
    if (!selectedRT) return;

    setLoading(true);
    setError("");

    try {
      await joinRT(selectedRT);
      // Use window.location.href for reliable redirect
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Failed to join RT:", error);
      setError("Failed to join RT community");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRT.name || !newRT.kelurahan || !newRT.kecamatan) return;

    setLoading(true);
    setError("");

    try {
      const createdRT = await createRT(newRT);
      await joinRT(createdRT.id, "admin");
      // Use window.location.href for reliable redirect
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Failed to create RT:", error);
      setError("Failed to create RT community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {!showCreateForm ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="rt-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select your RT community:
            </label>
            <select
              id="rt-select"
              value={selectedRT}
              onChange={(e) => setSelectedRT(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose an RT...</option>
              {rts.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name} - {rt.kelurahan}, {rt.kecamatan}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleJoinRT}
              disabled={!selectedRT || loading}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join RT"}
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Create New RT
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateRT} className="space-y-4">
          <div>
            <label
              htmlFor="rt-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              RT Name:
            </label>
            <input
              id="rt-name"
              type="text"
              required
              value={newRT.name}
              onChange={(e) => setNewRT({ ...newRT, name: e.target.value })}
              placeholder="e.g., RT 001/RW 001"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="kelurahan"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kelurahan:
            </label>
            <input
              id="kelurahan"
              type="text"
              required
              value={newRT.kelurahan}
              onChange={(e) =>
                setNewRT({ ...newRT, kelurahan: e.target.value })
              }
              placeholder="e.g., Menteng"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="kecamatan"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kecamatan:
            </label>
            <input
              id="kecamatan"
              type="text"
              required
              value={newRT.kecamatan}
              onChange={(e) =>
                setNewRT({ ...newRT, kecamatan: e.target.value })
              }
              placeholder="e.g., Menteng"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create & Join RT"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
