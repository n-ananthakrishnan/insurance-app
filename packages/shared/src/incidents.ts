import { z } from "zod";

export const IncidentReasonSchema = z.enum([
  "auto_accident",
  "fire_damage",
  "flood_damage",
  "theft",
  "vandalism",
  "medical_emergency",
  "other",
]);

export interface IncidentReason {
  value: "auto_accident" | "fire_damage" | "flood_damage" | "theft" | "vandalism" | "medical_emergency" | "other";
  label: string;
}

export const INCIDENT_REASONS: IncidentReason[] = [
  { value: "auto_accident", label: "自動車事故" },
  { value: "fire_damage", label: "火災被害" },
  { value: "flood_damage", label: "水害被害" },
  { value: "theft", label: "盗難" },
  { value: "vandalism", label: "破壊・被害" },
  { value: "medical_emergency", label: "医療緊急事態" },
  { value: "other", label: "その他" },
];

const incidentReasonMap: Record<string, string> = {
  auto_accident: "自動車事故",
  fire_damage: "火災被害",
  flood_damage: "水害被害",
  theft: "盗難",
  vandalism: "破壊・被害",
  medical_emergency: "医療緊急事態",
  other: "その他",
};

export function getIncidentReasonLabel(value: string): string {
  return incidentReasonMap[value] ?? value;
}

export const IncidentSeveritySchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);

export interface IncidentSeverity {
  value: "low" | "medium" | "high" | "critical";
  label: string;
}

export const INCIDENT_SEVERITIES: IncidentSeverity[] = [
  { value: "low", label: "軽度" },
  { value: "medium", label: "中程度" },
  { value: "high", label: "重度" },
  { value: "critical", label: "重大な緊急事態" },
];

export const incidentSeverityMap: Record<string, string> = {
  low: "軽度",
  medium: "中程度",
  high: "重度",
  critical: "重大な緊急事態",
};

export function getIncidentSeverityLabel(value: string): string {
  return incidentSeverityMap[value] ?? value;
}
