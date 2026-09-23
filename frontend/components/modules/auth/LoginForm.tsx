"use client";
import styles from "./login-form.module.scss";
import React, { FormEvent, useState } from "react";
import { Info, Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";

const LoginForm = () => {
  const { error, isLoading, login } = useAuth();
  const [email, setEmail] = useState("user@exmaple.com");
  const [password, setPassword] = useState("Abc123@ab");
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const success = await login({ email, password });

    if (success) {
      const redirect = searchParams.get("redirect") ?? "/";
      router.push(redirect);
    }
  };
  return (
    <section className={styles.section}>
      {/* container */}
      <div className={styles.container}>
        {/* form */}
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Chào mừng bạn trở lại!</h1>
          <p className={styles.subtitle}>
            Vui lòng đăng nhập tài khoản để tiếp tục
          </p>
          {/* Check error */}
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.error}>
                <Info size={20} />
                {error}
              </div>
            )}

            {/* Input login */}

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user1@gmail.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Abc123@ab"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className={styles.spinner} />
                  Đang đăng nhập ...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
