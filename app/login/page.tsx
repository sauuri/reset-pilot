"use client";

import { supabase } from "../utils/supabase";

async function isCapacitor(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export default function LoginPage() {
  async function signInWithApple() {
    const native = await isCapacitor();

    if (native) {
      // 네이티브 Apple 로그인
      try {
        const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");
        const result = await SignInWithApple.authorize({
          clientId: "com.sauuri.resetpilot",
          redirectURI: "https://reset-pilot.vercel.app/auth/callback",
          scopes: "email name",
          nonce: Math.random().toString(36).substring(2),
        });

        const { identityToken } = result.response;
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: identityToken,
        });

        if (!error) window.location.href = "/";
        else alert("로그인 실패: " + error.message);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.includes("cancel")) alert("로그인 오류: " + msg);
      }
    } else {
      // 웹 OAuth 리다이렉트
      await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    }
  }

  return (
    <main
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "80px 24px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✈️</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 8 }}>
          Reset Pilot
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
          로그인하면 기기를 바꿔도<br />복구 기록이 유지돼요.
        </p>
      </div>

      <button
        onClick={signInWithApple}
        style={{
          width: "100%",
          maxWidth: 320,
          padding: "16px 24px",
          borderRadius: 14,
          border: "none",
          background: "white",
          color: "#000",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        Apple로 로그인
      </button>

      <button
        onClick={() => (window.location.href = "/")}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.45)",
          fontSize: 13,
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        로그인 없이 계속하기
      </button>
    </main>
  );
}
