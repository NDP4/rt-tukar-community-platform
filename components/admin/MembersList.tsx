"use client";

import { useState } from "react";
import { UserPlus, Crown, User, Trash2 } from "lucide-react";

interface Member {
  id: string;
  profile_id: string;
  rt_id: string;
  role: string;
  joined_at: string;
  profile?: {
    name: string;
    phone?: string;
  };
}

interface MembersListProps {
  members: Member[];
  rtId: string;
}

export default function MembersList({ members }: MembersListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = members.filter((member) =>
    member.profile?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const admins = filteredMembers.filter((member) => member.role === "admin");
  const regularMembers = filteredMembers.filter(
    (member) => member.role === "member"
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          RT Members ({members.length})
        </h3>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Admins Section */}
      {admins.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <Crown className="h-4 w-4 mr-2 text-yellow-500" />
            Administrators ({admins.length})
          </h4>
          <div className="bg-yellow-50 rounded-lg p-4 space-y-3">
            {admins.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Crown className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.profile?.name}
                    </p>
                    {member.profile?.phone && (
                      <p className="text-sm text-gray-600">
                        {member.profile.phone}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Admin
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Members Section */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
          <User className="h-4 w-4 mr-2 text-blue-500" />
          Members ({regularMembers.length})
        </h4>
        <div className="bg-white border rounded-lg divide-y divide-gray-200">
          {regularMembers.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No members found</p>
            </div>
          ) : (
            regularMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.profile?.name}
                    </p>
                    {member.profile?.phone && (
                      <p className="text-sm text-gray-600">
                        {member.profile.phone}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Member
                  </span>
                  <button className="text-red-600 hover:text-red-800 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
