import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { logoutFn } from "@/services/auth";
import {
  adminCheckRole,
  adminListApplications,
  adminUpdateApplicationStatus,
  adminDeleteApplication,
} from "@/services/admin";

const STATUSES = ["new", "reviewing", "accepted", "rejected"] as const;
type Status = (typeof STATUSES)[number];

export default function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const checkRole = useServerFn(adminCheckRole);
  const listApps = useServerFn(adminListApplications);
  const updateStatus = useServerFn(adminUpdateApplicationStatus);
  const deleteApp = useServerFn(adminDeleteApplication);

  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const roleQuery = useQuery({ queryKey: ["admin", "role"], queryFn: () => checkRole() });
  const appsQuery = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: () => listApps(),
    enabled: roleQuery.data?.isAdmin === true,
  });

  if (roleQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!roleQuery.data?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center gap-4">
        <h1 className="font-display text-4xl font-bold">Not authorized</h1>
        <p className="text-muted-foreground text-sm max-w-md">
          You're signed in but not an admin. First sign-up using{" "}
          <span className="font-semibold">socialcloutt@gmail.com</span> automatically becomes admin.
        </p>
        <Button
          variant="outline"
          onClick={async () => {
            await logoutFn();
            navigate({ to: "/auth" });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  const apps = appsQuery.data ?? [];
  const filtered = apps.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.type?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCsv = () => {
    const rows = [
      ["Type", "Name", "Email", "Phone", "Status", "Submitted", "Details"],
      ...filtered.map((a) => [
        a.type,
        a.name,
        a.email,
        a.phone ?? "",
        a.status,
        new Date(a.created_at).toISOString(),
        JSON.stringify(a.details),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `social-cloutt-applications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onStatusChange = async (id: string, status: Status) => {
    try {
      await updateStatus({ data: { id, status } });
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin", "applications"] });
    } catch {
      toast.error("Update failed");
    }
  };
  const onDelete = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    try {
      await deleteApp({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "applications"] });
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/90 backdrop-blur z-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-cloutt" />
            <span className="font-display text-xl font-bold">Social Cloutt · Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await logoutFn();
              navigate({ to: "/auth" });
            }}
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 md:px-8 py-10">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-5xl font-bold tracking-tight">Applications</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {apps.length} total · {apps.filter((a) => a.status === "new").length} new
            </p>
          </div>
          <Button onClick={exportCsv} variant="outline">
            Export CSV
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <input
            placeholder="Search by name, email, type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] h-10 rounded-md border border-input bg-background px-3 text-sm"
          />
          <div className="flex gap-2">
            {(["all", ...STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={
                  "px-3 h-9 text-xs font-semibold rounded-full transition-all capitalize " +
                  (filter === s
                    ? "bg-foreground text-background"
                    : "border border-foreground/20 hover:border-foreground")
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {appsQuery.isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading applications…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border border-dashed rounded-md">
            No applications {filter !== "all" ? `with status "${filter}"` : "yet"}.
          </div>
        ) : (
          <div className="border border-border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Submitted</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="p-3">
                        <span className="text-xs uppercase tracking-widest font-semibold">
                          {a.type}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{a.name}</td>
                      <td className="p-3 text-muted-foreground">{a.email}</td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <select
                          value={a.status}
                          onChange={(e) => onStatusChange(a.id, e.target.value as Status)}
                          className="h-8 px-2 rounded-md border border-input bg-background text-xs"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <details className="inline-block text-left">
                          <summary className="text-xs cursor-pointer text-foreground/60 hover:text-foreground">
                            View
                          </summary>
                          <pre className="mt-2 p-3 bg-muted text-[10px] rounded-md max-w-md whitespace-pre-wrap break-all">
                            {JSON.stringify(a.details, null, 2)}
                          </pre>
                        </details>
                        <button
                          onClick={() => onDelete(a.id)}
                          className="ml-3 text-xs text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
