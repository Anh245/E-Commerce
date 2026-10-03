"use client";
import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/modules/admin/AdminHeader";
import { Trash2, Search } from "lucide-react";
import { UserService, UserProfile } from "@/services/api/user.service";
import type { User } from "@/types/auth.type";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await UserService.getAllUsers();
      setUsers(Array.isArray(res) ? (res as unknown as User[]) : []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await UserService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) { console.error(e); }
    finally { setConfirmDelete(null); }
  };

  const filtered = users.filter((u) =>
    !search
    || (u.email ?? "").toLowerCase().includes(search.toLowerCase())
    || (u.firstName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AdminHeader title="Users Management" subtitle={users.length + " users total"} />
      <div className="admin-content">
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--admin-border)", display: "flex", gap: "1rem" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
              <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-text-muted)" }} />
              <input className="admin-input" style={{ paddingLeft: "2.25rem" }} placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 4 }).map((_, j) => (
                    <td key={j}><div style={{ height: 16, background: "#f1f5f9", borderRadius: 4 }} /></td>
                  ))}</tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>No users found</td></tr>
                ) : filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#818cf8,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: "0.85rem", flexShrink: 0 }}>
                          {u.firstName?.[0] ?? u.email?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                          {u.firstName ? (u.firstName + " " + (u.lastName ?? "")).trim() : "—"}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: "var(--admin-text-muted)", fontSize: "0.85rem" }}>{u.email}</td>
                    <td>
                      <span className={"admin-badge " + (u.role === "ADMIN" ? "badge-shipped" : "badge-delivered")}>
                        {u.role ?? "USER"}
                      </span>
                    </td>
                    <td>
                      <button className="admin-btn-danger" onClick={() => setConfirmDelete(u.id!)}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {confirmDelete && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div className="admin-card" style={{ maxWidth: 400, width: "90%", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <Trash2 size={22} color="#dc2626" />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Are you sure?</h3>
              <p style={{ color: "var(--admin-text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                This action cannot be undone. The user account will be permanently deleted.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <button className="admin-btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className="admin-btn-danger" onClick={() => handleDelete(confirmDelete)}>Confirm Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
