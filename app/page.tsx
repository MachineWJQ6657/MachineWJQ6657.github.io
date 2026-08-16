import { LivePortfolio } from "../components/LivePortfolio";
import { DEFAULT_SITE } from "../lib/site-content";

export default function Home() {
  return <LivePortfolio initialData={DEFAULT_SITE} />;
}
