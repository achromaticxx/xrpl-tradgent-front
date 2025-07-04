import { useEffect, useState } from "react";
import { XummPkce } from "xumm-oauth2-pkce";

const xumm = new XummPkce(process.env.NEXT_PUBLIC_XUMM_API_KEY!);

export function useXumm() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    xumm.on("retrieved", async () => {
      const state = await xumm.state();
      setAccount(state?.me?.sub ?? null);
    });
    xumm.on("success", async () => {
      const state = await xumm.state();
      setAccount(state?.me?.sub ?? null);
    });
    xumm.on("error", () => setAccount(null));
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const session = await xumm.authorize();
      setAccount(session?.me?.sub ?? null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    xumm.logout();
    setAccount(null);
  };

  return { account, login, logout, loading };
} 