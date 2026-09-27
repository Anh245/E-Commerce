"use client";
import styles from "./register-form.module.scss";
import React, { FormEvent, useState } from "react";
import { Info, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RegisterForm = () => {
  const { error, isLoading, register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setClientError(null);

    // Validate confirm password (client-side only)
    if (password !== confirmPassword) {
      setClientError("Mật khẩu xác nhận không khớp.");
      return;
    }

    const success = await register({
      email,
      password,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    });

    if (success) {
      router.push("/");
    }
  };

  const displayError = clientError || error;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          {/* Header */}
          <div className={styles.logoMark}>◆ STOREFRONT</div>
          <h1 className={styles.title}>Tạo tài khoản mới</h1>
          <p className={styles.subtitle}>
            Tham gia cùng chúng tôi — mua sắm dễ dàng hơn!
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Error banner */}
            {displayError && (
              <div className={styles.error}>
                <Info size={16} />
                <span>{displayError}</span>
              </div>
            )}

            {/* Row: Họ + Tên */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="firstName">Họ</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nguyễn"
                  disabled={isLoading}
                  autoComplete="given-name"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="lastName">Tên</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Văn A"
                  disabled={isLoading}
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label htmlFor="email">
                Email <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label htmlFor="password">
                Mật khẩu <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className={styles.hint}>
                Cần có: chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)
              </p>
            </div>

            {/* Confirm Password */}
            <div className={styles.field}>
              <label htmlFor="confirmPassword">
                Xác nhận mật khẩu <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  type={showConfirm ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className={styles.spinner} />
                  Đang tạo tài khoản...
                </>
              ) : (
                "Đăng ký ngay"
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className={styles.loginLink}>
            Đã có tài khoản?{" "}
            <Link href="/auth/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegisterForm;
