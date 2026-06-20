/** Firestore collection paths (backward-compatible with existing `matches` docs). */
export const COLLECTIONS = {
  MATCHES: "matches",
  TEAMS: "teams",
  PLAYERS: "players",
  USERS: "users",
  TOURNAMENTS: "tournaments",
  IMPORTS: "imports",
  SCORER_REQUESTS: "scorer_requests",
};

/** User roles — lightweight RBAC. */
export const USER_ROLES = {
  ADMIN: "admin",
  SCORER: "scorer",
  VIEWER: "viewer",
};

/** Roles allowed to create/edit/score matches. */
export const SCORER_ROLES = [USER_ROLES.ADMIN, USER_ROLES.SCORER];

/** Match lifecycle statuses used in existing documents. */
export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
};

/** Default list limits for dashboard and queries. */
export const QUERY_LIMITS = {
  DASHBOARD_MATCHES: 50,
  ONGOING: 10,
  UPCOMING: 10,
  COMPLETED: 10,
  RECENT_ACTIVITY: 8,
};

/** Firestore field names for consistent querying. */
export const MATCH_FIELDS = {
  STATUS: "status",
  UPDATED_AT: "updatedAt",
  CREATED_AT: "createdAt",
  IS_PUBLIC: "isPublic",
};

/** Public viewer route prefixes (no auth required). */
export const PUBLIC_ROUTE_PREFIXES = ["/live/", "/scorecard/", "/discover"];
