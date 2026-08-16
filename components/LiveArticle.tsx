"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteData, SitePost } from "../lib/site-content";
import { getSiteStyle } from "./PortfolioView";
import { ThemeToggle } from "./ThemeToggle";

export function LiveArticle({ initialData, slug }: { initialData: SiteData; slug: string }) {
  const [data, setData] = useState(initialData);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/site", { cache: "no-store" });
      if (!response.ok) return;
      const result = (await response.json()) as { data: SiteData };
      setData(result.data);
    } catch {
      // The server-rendered article remains readable while offline.
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, 3000);
    const channel = new BroadcastChannel("portfolio-live");
    channel.onmessage = (event: MessageEvent<SiteData>) => setData(event.data);
    return () => { window.clearInterval(timer); channel.close(); };
  }, [refresh]);

  const post = data.posts.find((item) => item.slug === slug && item.published);
  if (!post) return <MissingArticle data={data} />;
  return <ArticleView data={data} post={post} />;
}

function ArticleView({ data, post }: { data: SiteData; post: SitePost }) {
  const blocks = post.content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  return (
    <main className="article-shell" style={getSiteStyle(data)}>
      <nav className="article-nav"><a href="/">← {data.basics.name}</a><div><ThemeToggle /><span>{data.basics.initials}</span></div></nav>
      <header className="article-header">
        <div className="post-meta"><span>{post.category}</span><time>{post.date}</time><span>{post.readingTime}</span></div>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
      </header>
      <article className="article-body">
        {blocks.map((block, index) => block.startsWith("## ")
          ? <h2 key={`${index}-${block}`}>{block.slice(3)}</h2>
          : <p key={`${index}-${block}`}>{block}</p>)}
      </article>
      <footer className="article-footer"><span>Written by {data.basics.name}</span><a href="/#writing">Back to all notes ↑</a></footer>
    </main>
  );
}

function MissingArticle({ data }: { data: SiteData }) {
  return <main className="article-shell" style={getSiteStyle(data)}><nav className="article-nav"><a href="/">← Home</a><div><ThemeToggle /><span>{data.basics.initials}</span></div></nav><header className="article-header"><p className="eyebrow">Not found</p><h1>This note is no longer published.</h1></header></main>;
}
