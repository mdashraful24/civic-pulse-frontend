import type {
  IssueCategory,
  IssuePriority,
  IssueStatus,
  Role,
  UserStatus,
} from "@/lib/types";

export const CATEGORY_OPTIONS: ReadonlyArray<{
  value: IssueCategory;
  label: string;
  description: string;
}> = [
  {
    value: "ROADS",
    label: "Roads & potholes",
    description: "Damaged roads, footpaths and crossings",
  },
  {
    value: "STREETLIGHTS",
    label: "Streetlights",
    description: "Dark streets, broken lamps and signals",
  },
  {
    value: "WATER",
    label: "Water & drainage",
    description: "Leaks, blocked drains and flooding",
  },
  {
    value: "WASTE",
    label: "Waste & sanitation",
    description: "Missed collection, dumping and cleanliness",
  },
  {
    value: "OTHER",
    label: "Other",
    description: "Anything else that needs attention",
  },
];

export const PRIORITY_OPTIONS: ReadonlyArray<{
  value: IssuePriority;
  label: string;
}> = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

export const STATUS_OPTIONS: ReadonlyArray<{
  value: IssueStatus;
  label: string;
}> = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
];

export const ROLE_OPTIONS: ReadonlyArray<{ value: Role; label: string }> = [
  { value: "CITIZEN", label: "Citizen" },
  { value: "ADMIN", label: "Admin" },
  { value: "PERSONNEL", label: "Personnel" },
];

export const USER_STATUS_OPTIONS: ReadonlyArray<{
  value: UserStatus;
  label: string;
}> = [
  { value: "ACTIVE", label: "Active" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "DELETED", label: "Deleted" },
];

export const categoryLabels = Object.fromEntries(
  CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<IssueCategory, string>;

export const priorityLabels = Object.fromEntries(
  PRIORITY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<IssuePriority, string>;

export const statusLabels = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<IssueStatus, string>;

export const roleLabels = Object.fromEntries(
  ROLE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<Role, string>;

export const statusBadgeClasses: Record<IssueStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  IN_PROGRESS: "bg-sky-50 text-sky-800 ring-sky-200",
  RESOLVED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};

export const priorityBadgeClasses: Record<IssuePriority, string> = {
  LOW: "bg-stone-100 text-stone-600 ring-stone-200",
  MEDIUM: "bg-orange-50 text-orange-700 ring-orange-200",
  HIGH: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const roleBadgeClasses: Record<Role, string> = {
  CITIZEN: "bg-teal-50 text-teal-700 ring-teal-200",
  ADMIN: "bg-violet-50 text-violet-700 ring-violet-200",
  PERSONNEL: "bg-blue-50 text-blue-700 ring-blue-200",
};

export const userStatusBadgeClasses: Record<UserStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  BLOCKED: "bg-rose-50 text-rose-700 ring-rose-200",
  DELETED: "bg-stone-100 text-stone-500 ring-stone-200",
};

export const categoryAccentClasses: Record<IssueCategory, string> = {
  ROADS: "bg-amber-100 text-amber-700",
  STREETLIGHTS: "bg-indigo-100 text-indigo-700",
  WATER: "bg-sky-100 text-sky-700",
  WASTE: "bg-lime-100 text-lime-700",
  OTHER: "bg-stone-200 text-stone-700",
};

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
