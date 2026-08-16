import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveArticle } from "../../../components/LiveArticle";
import { readSite } from "../../../lib/site-store";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await readSite();
  const post = data.posts.find((item) => item.slug === slug && item.published);
  if (!post) return { title: "Note not found" };
  return { title: `${post.title} · ${data.basics.name}`, description: post.excerpt };
}

export default async function WritingPage({ params }: PageProps) {
  const { slug } = await params;
  const { data } = await readSite();
  if (!data.posts.some((item) => item.slug === slug && item.published)) notFound();
  return <LiveArticle initialData={data} slug={slug} />;
}
