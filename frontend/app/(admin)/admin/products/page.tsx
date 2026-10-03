"use client";
import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/modules/admin/AdminHeader";
import { Plus, Pencil, Trash2, Search, Filter } from "lucide-react";
import { ProductService } from "@/services/api/product.Service";
import type { Product } from "@/types/product.types";
import styles from "./page.module.scss";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const limit = 10;

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await ProductService.getProducts({ page, limit, search: search || undefined });
      setProducts(res.data);
      setMeta({ total: res.meta.total, totalPages: res.meta.totalPages });
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const getStockBadge = (stock: number) => {
    if (stock <= 0) return <span className="admin-badge badge-cancelled">Out of Stock</span>;
    if (stock <= 10) return <span className="admin-badge badge-pending">{"Low Stock (" + stock + ")"}</span>;
    return <span className="admin-badge badge-delivered">{"In Stock (" + stock + ")"}</span>;
  };

  return (
    <>
      <AdminHeader title="Products Management" subtitle={meta.total + " products total"} />
      <div className="admin-content">
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className="admin-input"
                style={{ paddingLeft: "2.25rem" }}
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="admin-btn-ghost"><Filter size={15} /> Filter</button>
              <button className="admin-btn-primary"><Plus size={15} /> Add Product</button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div className={styles.skRow} /></td>
                  ))}</tr>
                )) : products.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>No products found</td></tr>
                ) : products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.productCell}>
                        <div className={styles.productThumb}>
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <div className={styles.thumbPlaceholder} />}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>{p.name}</span>
                      </div>
                    </td>
                    <td><code style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)" }}>{p.sku}</code></td>
                    <td style={{ color: "var(--admin-text-muted)", fontSize: "0.85rem" }}>{p.category}</td>
                    <td style={{ fontWeight: 600 }}>{"$" + Number(p.price).toFixed(2)}</td>
                    <td>{getStockBadge(p.stock)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.375rem" }}>
                        <button className="admin-btn-edit"><Pencil size={13} /></button>
                        <button className="admin-btn-danger"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta.totalPages > 1 && (
            <div className={styles.pagination}>
              <button className="admin-btn-ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
              <span style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>{"Page " + page + " of " + meta.totalPages}</span>
              <button className="admin-btn-ghost" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}>Next</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
