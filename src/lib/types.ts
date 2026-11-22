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

export type AdminAction = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; name: string; email: string; role: Role };
};

export type ModerationFlag = {
  id: string;
  reason: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  action: "NONE" | "HIDE" | "APPROVE";
  resolutionNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  issue: {
    id: string;
    title: string;
    category: IssueCategory;
    status: IssueStatus;
    moderationStatus: "VISIBLE" | "HIDDEN";
  };
  reporter: { id: string; name: string; email: string };
  resolvedBy: { id: string; name: string } | null;
};

export type ModerationFlagsParams = {
  status?: ModerationFlag["status"] | "";
  page?: number;
  limit?: number;
};

export type AdminAnalytics = {
  days: number;
  totalIssues: number;
  resolved: number;
  pending: number;
  highPriority: number;
  resolutionRate: number;
  averageResolutionHours: number;
  newUsers: number;
  issuesByDay: Array<{ date: string; count: number }>;
  usersByDay: Array<{ date: string; count: number }>;
  categories: Array<{ category: IssueCategory; count: number }>;
};

export type AppSetting = {
  key: string;
  value: string;
  updatedAt: string;
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

export type AIProviderName = "local" | "openai" | "gemini" | "local-fallback";

export type AIUsage = {
  usedToday: number;
  limit: number;
  remaining: number;
};

export type AIAttribution = {
  provider: AIProviderName;
  degraded: boolean;
  reason?: string;
  cached: boolean;
  usage: AIUsage;
};

export type AICapability = {
  task: string;
  name: string;
  description: string;
  advanced: boolean;
};

export type AICapabilities = {
  provider: Exclude<AIProviderName, "local-fallback">;
  capabilities: AICapability[];
  usage: AIUsage;
  cachingEnabled: boolean;
};

export type AICategorySuggestion = {
  category: IssueCategory;
  confidence: number;
  alternatives: Array<{ category: IssueCategory; score: number }>;
  keywords: string[];
  rationale: string;
  attribution: AIAttribution;
};

export type AIPrioritySuggestion = {
  priority: IssuePriority;
  urgencyScore: number;
  confidence: number;
  reasons: string[];
  attribution: AIAttribution;
};

export type AISummarySuggestion = {
  summary: string;
  keyPoints: string[];
  attribution: AIAttribution;
};

export type AISimilarIssue = {
  id: string;
  title: string;
  category: IssueCategory;
  status: IssueStatus;
  location: string;
  similarity: number;
};

export type AIAssigneeRecommendation = {
  id: string;
  name: string;
  score: number;
  reason: string;
  activeCount: number;
};

export type AISuggestedAction = {
  type: "SET_CATEGORY" | "SET_PRIORITY" | "ASSIGN" | "ADD_NOTE";
  value: string;
  reason: string;
};

export type AITriageSuggestion = {
  category: Omit<AICategorySuggestion, "attribution">;
  priority: Omit<AIPrioritySuggestion, "attribution">;
  summary: Omit<AISummarySuggestion, "attribution">;
  duplicates: AISimilarIssue[];
  actions: AISuggestedAction[];
  confidence: number;
  rationale: string;
  attribution: AIAttribution;
};

export type AIPayload = {
  title: string;
  description: string;
  category?: IssueCategory | "";
  location?: string;
  issueId?: string;
};
