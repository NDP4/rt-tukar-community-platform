import { supabase } from "./supabase";
import { RT, Item, Request } from "./types";

// Auth utilities
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return profile;
}

export async function getUserMembership() {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    // First get member data without joins to avoid recursion
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (memberError && memberError.code !== "PGRST116") {
      console.error("Member query error:", memberError);
      return null;
    }

    if (!member) return null;

    // Get profile separately
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", member.profile_id)
      .single();

    if (profileError) {
      console.error("Profile query error:", profileError);
      return null;
    }

    // Get RT separately
    const { data: rt, error: rtError } = await supabase
      .from("rts")
      .select("*")
      .eq("id", member.rt_id)
      .single();

    if (rtError) {
      console.error("RT query error:", rtError);
      return null;
    }

    // Combine the data manually
    return {
      ...member,
      profile,
      rt,
    };
  } catch (error) {
    console.error("getUserMembership error:", error);
    return null;
  }
}

// RT utilities
export async function getAllRTs() {
  try {
    const { data: rts, error } = await supabase
      .from("rts")
      .select("*")
      .order("name");

    if (error) {
      console.error("getAllRTs error:", error);
      return [];
    }
    return rts || [];
  } catch (error) {
    console.error("getAllRTs catch error:", error);
    return [];
  }
}

export async function createRT(
  rt: Omit<RT, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("rts")
    .insert(rt)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Member utilities
export async function joinRT(
  rtId: string,
  role: "admin" | "member" = "member"
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("members")
    .insert({
      profile_id: user.id,
      rt_id: rtId,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMemberRole(
  memberId: string,
  newRole: "admin" | "member"
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  // Check if current user is admin
  const membership = await getUserMembership();
  if (!membership || membership.role !== "admin") {
    throw new Error("Only admins can change member roles");
  }

  const { data, error } = await supabase
    .from("members")
    .update({
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId)
    .eq("rt_id", membership.rt_id) // Only can update members in same RT
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRTMembers(rtId: string) {
  const { data: members, error } = await supabase
    .from("members")
    .select(
      `
      *,
      profile:profiles(*)
    `
    )
    .eq("rt_id", rtId)
    .order("joined_at");

  if (error) throw error;
  return members || [];
}

// Item utilities
export async function getRTItems(rtId?: string) {
  let query = supabase
    .from("items")
    .select(
      `
      *,
      donor:profiles(*),
      rt:rts(*)
    `
    )
    .order("created_at", { ascending: false });

  if (rtId) {
    query = query.eq("rt_id", rtId);
  }

  const { data: items, error } = await query;

  if (error) throw error;
  return items || [];
}

export async function createItem(
  item: Omit<Item, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("items")
    .insert(item)
    .select(
      `
      *,
      donor:profiles(*),
      rt:rts(*)
    `
    )
    .single();

  if (error) throw error;
  return data;
}

export async function updateItem(id: string, updates: Partial<Item>) {
  const { data, error } = await supabase
    .from("items")
    .update(updates)
    .eq("id", id)
    .select(
      `
      *,
      donor:profiles(*),
      rt:rts(*)
    `
    )
    .single();

  if (error) throw error;
  return data;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) throw error;
}

// Request utilities
export async function createRequest(
  request: Omit<Request, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("requests")
    .insert(request)
    .select(
      `
      *,
      item:items(*,
        donor:profiles(*),
        rt:rts(*)
      ),
      requester:profiles(*)
    `
    )
    .single();

  if (error) throw error;
  return data;
}

export async function updateRequest(id: string, updates: Partial<Request>) {
  const { data, error } = await supabase
    .from("requests")
    .update(updates)
    .eq("id", id)
    .select(
      `
      *,
      item:items(*,
        donor:profiles(*),
        rt:rts(*)
      ),
      requester:profiles(*)
    `
    )
    .single();

  if (error) throw error;
  return data;
}

export async function acceptRequest(
  requestId: string,
  replyMessage?: string
): Promise<Request> {
  // Get the request with item details
  const { data: request, error: fetchError } = await supabase
    .from("requests")
    .select(
      `
      *,
      item:items(id, donor_id, status)
    `
    )
    .eq("id", requestId)
    .single();

  if (fetchError) throw fetchError;

  // Update request status to accepted with reply
  const updates: Partial<Request> = {
    status: "accepted",
    replied_at: new Date().toISOString(),
  };

  if (replyMessage) {
    updates.reply_message = replyMessage;
  }

  const { data: updatedRequest, error: updateError } = await supabase
    .from("requests")
    .update(updates)
    .eq("id", requestId)
    .select(
      `
      *,
      item:items(*,
        donor:profiles(*),
        rt:rts(*)
      ),
      requester:profiles(*)
    `
    )
    .single();

  if (updateError) throw updateError;

  // Update item status to reserved
  const { error: itemError } = await supabase
    .from("items")
    .update({ status: "reserved" })
    .eq("id", request.item.id);

  if (itemError) throw itemError;

  return updatedRequest;
}

export async function rejectRequest(
  requestId: string,
  replyMessage?: string
): Promise<Request> {
  const updates: Partial<Request> = {
    status: "rejected",
    replied_at: new Date().toISOString(),
  };

  if (replyMessage) {
    updates.reply_message = replyMessage;
  }

  const { data, error } = await supabase
    .from("requests")
    .update(updates)
    .eq("id", requestId)
    .select(
      `
      *,
      item:items(*,
        donor:profiles(*),
        rt:rts(*)
      ),
      requester:profiles(*)
    `
    )
    .single();

  if (error) throw error;
  return data;
}

export async function getMyRequests(itemOwnerId: string) {
  const { data, error } = await supabase
    .from("requests")
    .select(
      `
      *,
      item:items(*,
        donor:profiles(*),
        rt:rts(*)
      ),
      requester:profiles(*)
    `
    )
    .eq("item.donor_id", itemOwnerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getRequestsByOwner(ownerId: string) {
  try {
    console.log("Fetching requests for owner:", ownerId);

    // First, get all items owned by this user
    const { data: userItems, error: itemsError } = await supabase
      .from("items")
      .select("id")
      .eq("donor_id", ownerId);

    if (itemsError) {
      console.error("Error fetching user items:", itemsError);
      throw itemsError;
    }

    console.log("User items:", userItems);

    if (!userItems || userItems.length === 0) {
      console.log("No items found for user");
      return [];
    }

    const itemIds = userItems.map((item) => item.id);

    // Then get requests for those items
    const { data, error } = await supabase
      .from("requests")
      .select(
        `
        *,
        item:items(*,
          donor:profiles(*),
          rt:rts(*)
        ),
        requester:profiles(*)
      `
      )
      .in("item_id", itemIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
      throw error;
    }

    console.log("Requests found:", data);
    return data || [];
  } catch (error) {
    console.error("Error in getRequestsByOwner:", error);
    throw error;
  }
}

export async function getItemRequests(itemId: string) {
  const { data: requests, error } = await supabase
    .from("requests")
    .select(
      `
      *,
      requester:profiles(*)
    `
    )
    .eq("item_id", itemId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return requests || [];
}

export async function getUserRequests(userId: string) {
  const { data: requests, error } = await supabase
    .from("requests")
    .select(
      `
      *,
      item:items(*,
        donor:profiles(*),
        rt:rts(*)
      )
    `
    )
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return requests || [];
}

// File upload utilities
export async function uploadItemPhoto(file: File, itemId?: string) {
  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const fileName = itemId
    ? `${itemId}-${timestamp}.${fileExt}`
    : `temp-${timestamp}.${fileExt}`;
  const filePath = itemId ? `${itemId}/${fileName}` : `temp/${fileName}`;

  const { error } = await supabase.storage
    .from("item-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("item-images").getPublicUrl(filePath);

  return { path: filePath, url: publicUrl };
}

export async function deleteItemPhoto(path: string) {
  const { error } = await supabase.storage.from("item-images").remove([path]);

  if (error) throw error;
}

export function getItemPhotoUrl(path: string) {
  // If path is already a full URL, return it as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("item-images").getPublicUrl(path);

  return publicUrl;
}

// QR Code utilities
export function generatePickupCode(): string {
  return crypto.randomUUID();
}

export async function validatePickupCode(code: string) {
  const { data: request, error } = await supabase
    .from("requests")
    .select(
      `
      *,
      item:items(*,
        donor:profiles(*),
        rt:rts(*)
      ),
      requester:profiles(*)
    `
    )
    .eq("pickup_code", code)
    .is("pickup_code_used_at", null)
    .eq("status", "accepted")
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return request;
}

export async function markPickupCodeUsed(requestId: string) {
  const { data, error } = await supabase
    .from("requests")
    .update({
      status: "collected",
      pickup_code_used_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select(
      `
      *,
      item:items(*,
        donor:profiles(*),
        rt:rts(*)
      ),
      requester:profiles(*)
    `
    )
    .single();

  if (error) throw error;
  return data;
}

// Likes utilities
export async function toggleItemLike(itemId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  // Check if like already exists
  const { data: existingLike, error: checkError } = await supabase
    .from("likes")
    .select("id")
    .eq("item_id", itemId)
    .eq("user_id", user.id)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    throw checkError;
  }

  if (existingLike) {
    // Unlike (delete like)
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("id", existingLike.id);

    if (error) throw error;
    return { liked: false };
  } else {
    // Like (create like)
    const { error } = await supabase
      .from("likes")
      .insert({ item_id: itemId, user_id: user.id });

    if (error) throw error;
    return { liked: true };
  }
}

export async function getItemLikesCount(itemId: string) {
  const { count, error } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("item_id", itemId);

  if (error) throw error;
  return count || 0;
}

export async function isItemLikedByUser(itemId: string, userId: string) {
  const { data, error } = await supabase
    .from("likes")
    .select("id")
    .eq("item_id", itemId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return !!data;
}

// Comments utilities
export async function getItemComments(itemId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      user:profiles(*)
    `
    )
    .eq("item_id", itemId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addItemComment(itemId: string, body: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("comments")
    .insert({
      item_id: itemId,
      user_id: user.id,
      body: body.trim(),
    })
    .select(
      `
      *,
      user:profiles(*)
    `
    )
    .single();

  if (error) throw error;
  return data;
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) throw error;
}

export async function getItemCommentsCount(itemId: string) {
  const { count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("item_id", itemId);

  if (error) throw error;
  return count || 0;
}

// Get item stats (likes and comments count)
export async function getItemStats(itemId: string) {
  const [likesCount, commentsCount] = await Promise.all([
    getItemLikesCount(itemId),
    getItemCommentsCount(itemId),
  ]);

  return { likesCount, commentsCount };
}

// Notification utilities
export interface Notification {
  id: string;
  user_id: string;
  type: "like" | "comment" | "request" | "accept" | "reject" | "reply";
  title: string;
  message: string;
  related_id?: string;
  related_type?: "item" | "request" | "comment";
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Create a new notification
export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedId,
  relatedType,
}: {
  userId: string;
  type: Notification["type"];
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: Notification["related_type"];
}) {
  console.log("Creating notification:", {
    userId,
    type,
    title,
    message,
    relatedId,
    relatedType,
  });

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      message,
      related_id: relatedId,
      related_type: relatedType,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      full_error: error,
    });
    throw error;
  }

  console.log("Notification created successfully:", data);
  return data;
}

// Get user notifications
export async function getUserNotifications(userId: string, limit: number = 20) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Get unread notifications count
export async function getUnreadNotificationsCount(userId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
  return count || 0;
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw error;
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
}

// Delete notification
export async function deleteNotification(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) throw error;
}

// Helper functions to create specific notifications
export async function notifyItemLiked(
  itemOwnerId: string,
  likerName: string,
  itemTitle: string,
  itemId: string
) {
  if (!itemOwnerId) {
    console.log("notifyItemLiked: No itemOwnerId provided");
    return;
  }

  console.log("Creating like notification:", {
    itemOwnerId,
    likerName,
    itemTitle,
    itemId,
  });

  try {
    const result = await createNotification({
      userId: itemOwnerId,
      type: "like",
      title: "Item Disukai",
      message: `${likerName} menyukai item "${itemTitle}"`,
      relatedId: itemId,
      relatedType: "item",
    });
    console.log("Like notification created:", result);
    return result;
  } catch (error) {
    console.error("Error creating like notification:", error);
    throw error;
  }
}

export async function notifyItemCommented(
  itemOwnerId: string,
  commenterName: string,
  itemTitle: string,
  itemId: string
) {
  if (!itemOwnerId) return;

  return createNotification({
    userId: itemOwnerId,
    type: "comment",
    title: "Komentar Baru",
    message: `${commenterName} berkomentar di item "${itemTitle}"`,
    relatedId: itemId,
    relatedType: "item",
  });
}

export async function notifyItemRequested(
  itemOwnerId: string,
  requesterName: string,
  itemTitle: string,
  requestId: string
) {
  if (!itemOwnerId) return;

  return createNotification({
    userId: itemOwnerId,
    type: "request",
    title: "Permintaan Baru",
    message: `${requesterName} meminta item "${itemTitle}"`,
    relatedId: requestId,
    relatedType: "request",
  });
}

export async function notifyRequestAccepted(
  requesterId: string,
  itemTitle: string,
  requestId: string
) {
  if (!requesterId) return;

  return createNotification({
    userId: requesterId,
    type: "accept",
    title: "Permintaan Diterima",
    message: `Permintaan Anda untuk item "${itemTitle}" telah diterima`,
    relatedId: requestId,
    relatedType: "request",
  });
}

export async function notifyRequestRejected(
  requesterId: string,
  itemTitle: string,
  requestId: string
) {
  if (!requesterId) return;

  return createNotification({
    userId: requesterId,
    type: "reject",
    title: "Permintaan Ditolak",
    message: `Permintaan Anda untuk item "${itemTitle}" telah ditolak`,
    relatedId: requestId,
    relatedType: "request",
  });
}

export async function notifyRequestReplied(
  requesterId: string,
  itemTitle: string,
  requestId: string
) {
  if (!requesterId) return;

  return createNotification({
    userId: requesterId,
    type: "reply",
    title: "Balasan Permintaan",
    message: `Ada balasan untuk permintaan item "${itemTitle}"`,
    relatedId: requestId,
    relatedType: "request",
  });
}
