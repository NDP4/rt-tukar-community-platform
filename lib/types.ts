import { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type RT = Database["public"]["Tables"]["rts"]["Row"];
export type Member = Database["public"]["Tables"]["members"]["Row"] & {
  profile?: Profile;
  rt?: RT;
};
export type Item = Database["public"]["Tables"]["items"]["Row"] & {
  donor?: Profile;
  rt?: RT;
};
export type Request = Database["public"]["Tables"]["requests"]["Row"] & {
  item?: Item;
  requester?: Profile;
  reply_message?: string | null;
  replied_at?: string | null;
};
export type Comment = Database["public"]["Tables"]["comments"]["Row"] & {
  user?: Profile;
};

export type ItemStatus = "available" | "requested" | "reserved" | "collected";
export type RequestStatus = "pending" | "accepted" | "rejected" | "collected";
export type UserRole = "admin" | "member";
export type ItemCondition = "new" | "like_new" | "good" | "fair";

export interface ItemWithDetails extends Item {
  donor: Profile;
  rt: RT;
  _count?: {
    requests: number;
    comments: number;
  };
}

export interface RequestWithDetails extends Request {
  item: ItemWithDetails;
  requester: Profile;
}

export interface MemberWithDetails extends Member {
  profile: Profile;
  rt: RT;
}
