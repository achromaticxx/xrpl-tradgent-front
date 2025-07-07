
import { useEffect, useState, useCallback } from "react";
import sdk from "@crossmarkio/sdk";

type CrossmarkAccount = string | null;

export function useCrossmark() {
  const [account, setAccount] = useState<CrossmarkAccount>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. localStorage에서 우선 복원
    const stored = window.localStorage.getItem("crossmarkAccount");
    if (stored && typeof stored === "string" && stored.length > 0) setAccount(stored);

    // 2. SDK 세션/이벤트 처리 (복원 전까지는 null로 덮어쓰지 않음)
    let ignore = false;
    if (sdk && sdk.methods && typeof sdk.methods.isConnected === "function") {
      const result = sdk.methods.isConnected();
      if (result && typeof result.then === "function") {
        result.then((connected: boolean) => {
          if (ignore) return;
          if (connected && sdk.session?.address) {
            setAccount(sdk.session.address);
            window.localStorage.setItem("crossmarkAccount", sdk.session.address);
          } else if (!connected) {
            // 연결이 명확히 해제된 경우에만 null로
            setAccount(null);
            window.localStorage.removeItem("crossmarkAccount");
          }
        }).catch(() => {
          if (!ignore) {
            setAccount(null);
            window.localStorage.removeItem("crossmarkAccount");
          }
        });
      }
    }

    // user-change 이벤트 핸들러 (sdk.events가 undefined일 수 있으므로 방어)
    const handler = (user: { address?: string }) => {
      if (user?.address) {
        setAccount(user.address);
        window.localStorage.setItem("crossmarkAccount", user.address);
      } else {
        setAccount(null);
        window.localStorage.removeItem("crossmarkAccount");
      }
    };
    if (sdk && sdk.events && typeof sdk.events.on === "function") {
      sdk.events.on("user-change", handler);
    }

    return () => {
      ignore = true;
      if (sdk && sdk.events && typeof sdk.events.off === "function") {
        sdk.events.off("user-change", handler);
      }
    };
  }, []);

  // Crossmark 연결
  const connect = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sdk.methods.signInAndWait();
      const address = response?.data?.address || sdk.session?.address;
      if (address) {
        setAccount(address);
        window.localStorage.setItem("crossmarkAccount", address);
        return address;
      } else {
        setAccount(null);
        window.localStorage.removeItem("crossmarkAccount");
        return null;
      }
    } catch (e) {
      setAccount(null);
      window.localStorage.removeItem("crossmarkAccount");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crossmark 연결 해제
  const disconnect = useCallback(() => {
    sdk.methods.signout?.();
    setAccount(null);
    window.localStorage.removeItem("crossmarkAccount");
  }, []);

  return { account, connect, disconnect, loading };
}
