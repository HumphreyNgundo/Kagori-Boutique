import { PageHeader, TableWrap, Td, Th } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { listAudit } from "@/lib/repo/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Activity log" };

export default async function AuditPage() {
  await requirePermission("audit:view");
  const entries = await listAudit(100);

  return (
    <>
      <PageHeader
        title="Activity log"
        subtitle="Every state change, who made it and when — the answer to “who cancelled that order?”"
      />

      <TableWrap>
        <thead className="bg-surface-2">
          <tr>
            <Th>When</Th>
            <Th>Who</Th>
            <Th>Action</Th>
            <Th>Target</Th>
            <Th>Details</Th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-t border-line">
              <Td className="whitespace-nowrap text-xs text-subtle">
                {new Date(entry.createdAt).toLocaleString("en-KE", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Td>
              <Td className="font-medium">{entry.actorName}</Td>
              <Td>
                <span className="badge bg-surface-2 font-mono text-xs text-muted">{entry.action}</span>
              </Td>
              <Td className="text-muted">
                {entry.entity}:{entry.entityId}
              </Td>
              <Td className="text-xs text-subtle">
                {Object.entries(entry.meta)
                  .filter(([, v]) => v !== null && v !== "")
                  .map(([k, v]) => `${k}=${v}`)
                  .join(" · ") || "—"}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </>
  );
}
