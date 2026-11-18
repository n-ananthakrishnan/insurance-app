"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { DashboardStats } from "./DashboardStats";
import { RecentClaimsQueue } from "./RecentClaimsQueue";
import { RecentAuditActivity } from "./RecentAuditActivity";

interface DashboardData {
  claimsInQueue: number;
  activePolicies: number;
  newCustomers: number;
  pendingDocuments: number;
  recentClaims: Array<{
    id: string;
    claimNumber: string;
    customer: { nameJa: string; nameEn: string };
    status: string;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    resourceType: string;
    resourceId: string;
    actorNameJa: string;
    actorNameEn: string;
    createdAt: string;
  }>;
}

export function Dashboard() {
  const t = useTranslations("admin.dashboard");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [stats, claims, activity] = await Promise.all([
          api.get<{ claimsInQueue: number; activePolicies: number; newCustomers: number; pendingDocuments: number }>("/admin/stats"),
          api.get<{ items: DashboardData["recentClaims"] }>("/admin/claim-queue"),
          api.get<{ items: DashboardData["recentActivity"] }>("/admin/audit-log?pageSize=5"),
        ]);

        if (!cancelled) {
          setData({
            claimsInQueue: stats.claimsInQueue,
            activePolicies: stats.activePolicies,
            newCustomers: stats.newCustomers,
            pendingDocuments: stats.pendingDocuments,
            recentClaims: claims.items,
            recentActivity: activity.items,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load dashboard data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <DashboardStats
        claimsInQueue={data.claimsInQueue}
        activePolicies={data.activePolicies}
        newCustomers={data.newCustomers}
        pendingDocuments={data.pendingDocuments}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("claimsQueue.title")}</CardTitle>
            <p className="text-sm text-muted-500">{t("claimsQueue.subtitle")}</p>
          </CardHeader>
          <CardContent>
            <RecentClaimsQueue items={data.recentClaims} t={t} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("activities.title")}</CardTitle>
            <p className="text-sm text-muted-500">{t("activities.subtitle")}</p>
          </CardHeader>
          <CardContent>
            <RecentAuditActivity items={data.recentActivity} t={t} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
