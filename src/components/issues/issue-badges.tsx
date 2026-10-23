import {
  ArrowDown,
  ArrowUp,
  CircleEllipsis,
  Droplets,
  Lightbulb,
  Minus,
  Road,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  categoryAccentClasses,
  priorityBadgeClasses,
  priorityLabels,
  roleBadgeClasses,
  roleLabels,
  statusBadgeClasses,
  statusLabels,
  userStatusBadgeClasses,
} from "@/lib/constants";
import { cn } from "@/lib/format";
import type {
  IssueCategory,
  IssuePriority,
  IssueStatus,
  Role,
  UserStatus,
} from "@/lib/types";

const categoryIcons = {
  ROADS: Road,
  STREETLIGHTS: Lightbulb,
  WATER: Droplets,
  WASTE: Trash2,
  OTHER: CircleEllipsis,
};

const priorityIcons = {
  LOW: ArrowDown,
  MEDIUM: Minus,
  HIGH: ArrowUp,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: IssueCategory;
  className?: string;
}) {
  const Icon = categoryIcons[category];
  return <Icon className={className} />;
}

export function CategoryTile({
  category,
  className,
}: {
  category: IssueCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl",
        categoryAccentClasses[category],
        className,
      )}
    >
      <CategoryIcon category={category} className="h-5 w-5" />
    </span>
  );
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <Badge dot className={statusBadgeClasses[status]}>
      {statusLabels[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  const Icon = priorityIcons[priority];
  return (
    <Badge className={priorityBadgeClasses[priority]}>
      <Icon className="h-3 w-3" />
      {priorityLabels[priority]}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  return <Badge className={roleBadgeClasses[role]}>{roleLabels[role]}</Badge>;
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const label =
    status === "ACTIVE"
      ? "Active"
      : status === "BLOCKED"
        ? "Blocked"
        : "Deleted";
  return (
    <Badge dot className={userStatusBadgeClasses[status]}>
      {label}
    </Badge>
  );
}
