export type Role = "CITIZEN" | "ADMIN" | "PERSONNEL";

export type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED";

export type IssueCategory =
  | "ROADS"
  | "STREETLIGHTS"
  | "WATER"
  | "WASTE"
  | "OTHER";

export type IssuePriority = "LOW" | "MEDIUM" | "HIGH";

export type IssueStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUser = Omit<AuthUser, "updatedAt"> & {
  updatedAt?: string;
  _count: {
    reportedIssues: number;
    assignedIssues: number;
  };
};

export type IssuePerson = {
  id: string;
  name: string;
  imageUrl: string | null;
};

export type Issue = {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  imageUrl: string | null;
  priority: IssuePriority;
  status: IssueStatus;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: IssuePerson;
  assignee: IssuePerson | null;
};

export type IssueHistoryEntry = {
  id: string;
  oldStatus: IssueStatus | null;
  newStatus: IssueStatus;
  note: string | null;
  createdAt: string;
  changedBy: {
    id: string;
    name: string;
    role: Role;
  };
};

export type IssueStats = {
  scope: "ALL" | "ASSIGNED" | "OWN";
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
  statusDistribution: {
    PENDING: number;
    IN_PROGRESS: number;
    RESOLVED: number;
  };
  recentIssues: Issue[];
};

export type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Meta;
};

export type PageResult<T> = {
  items: T[];
  meta: Meta;
};

export type RegistrationOtp = {
  expiresIn: number;
  expiresAt: string;
  sessionExpiresIn: number;
};

export type IssueListParams = {
  search?: string;
  category?: IssueCategory | "";
  priority?: IssuePriority | "";
  status?: IssueStatus | "";
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest";
};

export type AdminUsersParams = {
  search?: string;
  role?: Role | "";
  status?: UserStatus | "";
  page?: number;
  limit?: number;
};

export type CreateIssuePayload = {
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  priority: IssuePriority;
};

export type UpdateIssuePayload = Partial<
  Pick<CreateIssuePayload, "title" | "description" | "category" | "location">
>;

export type UpdateStatusPayload = {
  status: IssueStatus;
  resolutionNote?: string;
};
