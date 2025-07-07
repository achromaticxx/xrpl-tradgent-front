import { useEffect, useState } from "react";
// Crossmark SDK는 https://docs.crossmark.io/ 참고
// npm install @crossmarkio/sdk 필요

let crossmark: any = null;
if (typeof window !== "undefined") {
  // 동적 import로 SSR 이슈 방지
  import("@crossmarkio/sdk").then((mod) => {
    crossmark = mod.Crossmark;
  });
}

export function useCrossmark() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!crossmark) return;
    crossmark.on("connect", (address: string) => {
      setAccount(address);
    });
    crossmark.on("disconnect", () => {
      setAccount(null);
    });
    // 초기 연결 상태 확인
    crossmark.isConnected().then((connected: boolean) => {
      if (connected) setAccount(crossmark.account.address);
    });
    return () => {
      crossmark.off("connect");
      crossmark.off("disconnect");
    };
  }, []);

  const connect = async () => {
    setLoading(true);
    try {
      await crossmark.connect();
      setAccount(crossmark.account.address);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    crossmark.disconnect();
    setAccount(null);
  };

  return { account, connect, disconnect, loading };
}
