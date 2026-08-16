"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteData } from "../lib/site-content";
import { PortfolioView } from "./PortfolioView";

export function LivePortfolio({ initialData }: { initialData: SiteData }) {
  const [data, setData] = useState(initialData);
  const [isLive, setIsLive] = useState(false);
  const [etag, setEtag] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/site", {
        cache: "no-store",
        headers: etag ? { "If-None-Match": etag } : undefined,
      });
      if (response.status === 304) return;
      if (!response.ok) return;
      const result = (await response.json()) as { data: SiteData };
      setData(result.data);
      setEtag(response.headers.get("etag") ?? "");
      setIsLive(true);
    } catch {
      setIsLive(false);
    }
  }, [etag]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, 3000);
    const channel = new BroadcastChannel("portfolio-live");
    channel.onmessage = (event: MessageEvent<SiteData>) => {
      setData(event.data);
      setIsLive(true);
    };
    return () => {
      window.clearInterval(timer);
      channel.close();
    };
  }, [refresh]);

  return (
    <>
      <PortfolioView data={data} />
      <div className={`live-indicator${isLive ? " is-live" : ""}`} aria-live="polite">
        <span />{isLive ? "Live" : "Connecting"}
      </div>
    </>
  );
}
