"use client";
import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/modules/admin/AdminHeader";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CategoryService } from "@/services/api/category.service";
import type { Category } from "@/types/category.type";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    CategoryService.getAllCategories({ limit: 100 })
      .then((res) => setCategories(res?.data ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await CategoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch { alert("Cannot delete category with associated products."); }
  };

  return (
    <>
      <AdminHeader title="Categories Management" subtitle={categories.length + " categories"} />
      <div className="admin-content">
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--admin-border)", display: "flex", justifyContent: "flex-end" }}>
            <button className="admin-btn-primary"><Plus size={15} /> Add Category</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Slug</th><th>Description</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                    <td key={j}><div style={{ height: 16, background: "#f1f5f9", borderRadius: 4 }} /></td>
                  ))}</tr>
                )) : categories.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>No categories</td></tr>
                ) : categories.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td><code style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)" }}>{c.slug}</code></td>
                    <td style={{ color: "var(--admin-text-muted)", fontSize: "0.83rem", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.description || "—"}</td>
                    <td><span className={"admin-badge " + (c.isActive ? "badge-delivered" : "badge-cancelled")}>{c.isActive ? "Active" : "Inactive"}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: "0.375rem" }}>
                        <button className="admin-btn-edit"><Pencil size={13} /></button>
                        <button className="admin-btn-danger" onClick={() => handleDelete(c.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
