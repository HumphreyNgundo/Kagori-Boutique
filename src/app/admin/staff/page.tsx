import { PageHeader, Panel, TableWrap, Td, Th } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { listStaff } from "@/lib/repo/admin";
import { setStaffActiveAction } from "@/lib/actions/admin";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, ROLE_PERMISSIONS, type Permission } from "@/lib/auth/rbac";
import type { Role } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Staff & roles" };

const ROLES: Role[] = ["OWNER", "MANAGER", "SALES", "FULFILMENT", "RIDER", "CUSTOMER"];

export default async function StaffPage() {
  const me = await requirePermission("staff:manage");
  const staff = await listStaff();

  // The permission matrix, rendered from the same constants the guards use.
  const allPermissions = [...new Set(ROLES.flatMap((r) => [...ROLE_PERMISSIONS[r]]))] as Permission[];

  return (
    <>
      <PageHeader title="Staff & roles" subtitle="Who can do what, and who is currently allowed in." />

      <TableWrap>
        <thead className="bg-surface-2">
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Last signed in</Th>
            <Th className="text-right">Access</Th>
          </tr>
        </thead>
        <tbody>
          {staff.map((user) => (
            <tr key={user.id} className="border-t border-line">
              <Td className="font-medium">
                {user.name}
                {user.id === me.id && <span className="ml-2 badge bg-[var(--brand-soft)] text-brand">you</span>}
              </Td>
              <Td className="text-muted">{user.email}</Td>
              <Td>
                <span className="badge bg-surface-2 text-muted">{ROLE_LABELS[user.role]}</span>
              </Td>
              <Td className="text-muted">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString("en-KE", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Never"}
              </Td>
              <Td className="text-right">
                {user.role === "OWNER" ? (
                  <span className="text-xs text-subtle">Always on</span>
                ) : (
                  <form action={setStaffActiveAction} className="inline">
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="active" value={(!user.active).toString()} />
                    <button
                      type="submit"
                      className="btn btn-outline btn-sm"
                      style={user.active ? undefined : { color: "var(--danger)", borderColor: "var(--danger)" }}
                    >
                      {user.active ? "Active" : "Suspended"}
                    </button>
                  </form>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      <Panel title="Permission matrix" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <Th>Permission</Th>
                {ROLES.map((role) => (
                  <Th key={role} className="text-center">{ROLE_LABELS[role]}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPermissions.map((permission) => (
                <tr key={permission} className="border-t border-line">
                  <Td className="font-mono text-xs">{permission}</Td>
                  {ROLES.map((role) => (
                    <Td key={role} className="text-center">
                      {ROLE_PERMISSIONS[role].includes(permission) ? (
                        <span style={{ color: "var(--positive)" }}>●</span>
                      ) : (
                        <span className="text-subtle">·</span>
                      )}
                    </Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 space-y-1.5 text-xs text-muted">
          {ROLES.map((role) => (
            <li key={role}>
              <strong className="text-ink">{ROLE_LABELS[role]}</strong> — {ROLE_DESCRIPTIONS[role]}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
