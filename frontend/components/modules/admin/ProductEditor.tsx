"use client";

import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { CategoryService } from "@/services/api/category.service";
import { ProductService } from "@/services/api/product.Service";
import type { Product } from "@/types/product.types";
import type { Category } from "@/types/category.type";
import styles from "@/app/(admin)/admin/products/page.module.scss";

export default function ProductEditor({ product, onClose, onChanged }: {
  product: Product | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(product?.imageUrl ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    dialog.current?.showModal();
    CategoryService.getAllCategories({ limit: 100 }).then((result) => setCategories(result.data))
      .catch(() => setError("Không tải được danh mục. Đóng biểu mẫu và mở lại để thử lại."));
  }, []);

  useEffect(() => {
    return () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); };
  }, [preview]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const data = {
      name: String(form.get("name")).trim(), description: String(form.get("description")).trim(),
      sku: String(form.get("sku")).trim(), categoryId: String(form.get("categoryId")),
      price: Number(form.get("price")), stock: Number(form.get("stock")),
    };
    setBusy(true);
    setError("");
    try {
      if (product) {
        await ProductService.updateProduct(product.id, data, file ?? undefined);
      } else {
        if (!file) throw new Error("Vui lòng chọn ảnh sản phẩm.");
        await ProductService.createProduct(data, file);
      }
      onChanged();
      onClose();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      setError("Không lưu được sản phẩm. " +
        (Array.isArray(message) ? message.join(", ") : message || (err instanceof Error ? err.message : "Vui lòng thử lại.")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog ref={dialog} className={styles.editor} aria-labelledby="product-editor-title"
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
      <form onSubmit={save}>
        <h2 id="product-editor-title">{product ? "Sửa sản phẩm và ảnh" : "Thêm sản phẩm"}</h2>
        <fieldset disabled={busy}>
          <label>Tên sản phẩm<input className="admin-input" name="name" required maxLength={100} defaultValue={product?.name} /></label>
          <label>SKU<input className="admin-input" name="sku" required maxLength={50} defaultValue={product?.sku} /></label>
          <label>Mô tả<textarea className="admin-input" name="description" defaultValue={product?.description} /></label>
          <label>Danh mục<select className="admin-input" name="categoryId" required defaultValue={product?.categoryId ?? ""}>
            <option value="" disabled>Chọn danh mục</option>
            {product && !categories.some((category) => category.id === product.categoryId) &&
              <option value={product.categoryId}>{product.category}</option>}
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select></label>
          <label>Giá (USD)<input className="admin-input" name="price" type="number" min="0" step="0.01" required defaultValue={product?.price} /></label>
          <label>Tồn kho<input className="admin-input" name="stock" type="number" min="0" step="1" required defaultValue={product?.stock ?? 0} /></label>
          <label>Ảnh sản phẩm {product?.imageUrl ? "(chọn để thay ảnh hiện tại)" : "(bắt buộc)"} — JPEG, PNG hoặc WebP, tối đa 5 MB
            <input type="file" required={!product?.imageUrl} accept="image/jpeg,image/png,image/webp" onChange={(event) => {
              const selected = event.target.files?.[0];
              if (!selected) return;
              if (selected.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
                setError("Chọn ảnh JPEG, PNG hoặc WebP có dung lượng tối đa 5 MB.");
                event.target.value = "";
                setFile(null);
                setPreview(product?.imageUrl ?? "");
                return;
              }
              setError(""); setFile(selected); setPreview(URL.createObjectURL(selected));
            }} />
          </label>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview && <img className={styles.imagePreview} src={preview} alt="Xem trước ảnh sản phẩm" />}
        </fieldset>
        {error && <p role="alert" className={styles.editorError}>{error}</p>}
        <div className={styles.editorActions}>
          <button type="button" className="admin-btn-ghost" disabled={busy} onClick={onClose}>Đóng</button>
          <button type="submit" className="admin-btn-primary" disabled={busy}>{busy ? "Đang lưu…" : "Lưu sản phẩm"}</button>
        </div>
      </form>
    </dialog>
  );
}
