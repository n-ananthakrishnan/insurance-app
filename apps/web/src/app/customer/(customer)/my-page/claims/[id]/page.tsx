"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Claim = { id: string; claimNumber: string; status: string; type: string; policyNumber: string; accidentDate: string; descriptionEn: string; descriptionJa: string; injuredPeople: number; policeReported: boolean; createdAt: string; statusHistory: Array<{ id: string; toStatus: string; commentEn?: string | null; changedAt: string }> };
export default function CustomerClaimDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { let cancelled = false; api.get<Claim>(`/claims/${id}`).then(data => { if (!cancelled) setClaim(data); }).catch(() => { if (!cancelled) setError("Claim not found or your session has expired."); }); return () => { cancelled = true; }; }, [id]);
  return <section className="mx-auto max-w-3xl px-4 py-10"><Link href="/customer/claims" className="text-sm underline">← My claims</Link>{error ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">{error}</p> : !claim ? <p className="mt-6">Loading claim…</p> : <article className="mt-5 rounded-2xl border bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-sm text-muted-500">{claim.claimNumber}</p><h1 className="mt-1 text-2xl font-bold">Accident report</h1></div><span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">{claim.status.replaceAll("_", " ")}</span></div><dl className="mt-6 grid gap-4 sm:grid-cols-2"><div><dt className="text-sm text-muted-500">Policy</dt><dd>{claim.policyNumber}</dd></div><div><dt className="text-sm text-muted-500">Incident type</dt><dd>{claim.type}</dd></div><div><dt className="text-sm text-muted-500">Incident date</dt><dd>{new Date(claim.accidentDate).toLocaleString()}</dd></div><div><dt className="text-sm text-muted-500">People injured</dt><dd>{claim.injuredPeople}</dd></div></dl><div className="mt-6"><h2 className="font-semibold">Description</h2><p className="mt-2 whitespace-pre-wrap text-muted-700">{claim.descriptionEn}</p></div><div className="mt-6"><h2 className="font-semibold">Progress</h2><ol className="mt-3 space-y-3">{claim.statusHistory.map(entry => <li key={entry.id} className="border-l-2 border-navy-200 pl-4"><p className="font-medium">{entry.toStatus.replaceAll("_", " ")}</p><p className="text-sm text-muted-600">{entry.commentEn}</p><time className="text-xs text-muted-500">{new Date(entry.changedAt).toLocaleString()}</time></li>)}</ol></div></article>}</section>;
}
