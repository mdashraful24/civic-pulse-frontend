"use client";

import { type CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useEffect, useRef, useState } from "react";

type GoogleIdentityButtonProps = {
  disabled?: boolean;
  onSuccess: (idToken: string) => Promise<void> | void;
  onError: () => void;
};

export function GoogleIdentityButton({
  disabled = false,
  onSuccess,
  onError,
}: GoogleIdentityButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      const clientWidth = containerRef.current?.clientWidth;
      if (clientWidth && clientWidth > 0) {
        setWidth(Math.max(200, Math.min(clientWidth, 400)));
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const blocked = disabled || busy;

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      onError();
      return;
    }

    setBusy(true);
    try {
      await onSuccess(response.credential);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 w-full rounded-xl border border-brand/20 bg-brand-soft/70 p-2 shadow-sm shadow-brand/10 dark:border-brand/30 dark:bg-brand-soft/40">
      <div
        ref={containerRef}
        style={{
          opacity: blocked ? 0.55 : 1,
          pointerEvents: blocked ? "none" : "auto",
        }}
        className="flex w-full justify-center"
      >
        <GoogleLogin
          key={width}
          onSuccess={(response) => void handleSuccess(response)}
          onError={onError}
          theme="outline"
          shape="rectangular"
          size="large"
          text="continue_with"
          logo_alignment="left"
          width={width}
        />
      </div>
    </div>
  );
}
