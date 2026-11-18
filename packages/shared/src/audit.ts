// Shared audit-log entry type used by the admin UI.
// Kept in the shared package so the frontend can import it from
// `@sample-insurance/shared` without special-casing a web-only type.
export interface AuditLogEntry {
  id: string;
  action: string;
  adminId: string;
  targetType?: string | null;
  targetId?: string | null;
  detailsJa?: string | null;
  detailsEn?: string | null;
  createdAt: string;
}
