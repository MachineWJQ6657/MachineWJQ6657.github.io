import type { CSSProperties } from "react";
import type { SiteData } from "../lib/site-content";
import { ThemeToggle } from "./ThemeToggle";

export type SiteStyle = CSSProperties & {
  "--site-bg": string;
  "--site-surface": string;
  "--site-text": string;
  "--site-muted": string;
  "--site-accent": string;
  "--site-accent-2": string;
  "--site-dark-bg": string;
  "--site-dark-surface": string;
  "--site-dark-text": string;
  "--site-dark-muted": string;
  "--site-dark-accent": string;
  "--site-dark-accent-2": string;
  "--site-radius": string;
};

export function getSiteStyle(data: SiteData): SiteStyle {
  return {
    "--site-bg": data.theme.background,
    "--site-surface": data.theme.surface,
    "--site-text": data.theme.text,
    "--site-muted": data.theme.muted,
    "--site-accent": data.theme.accent,
    "--site-accent-2": data.theme.accent2,
    "--site-dark-bg": data.theme.darkBackground,
    "--site-dark-surface": data.theme.darkSurface,
    "--site-dark-text": data.theme.darkText,
    "--site-dark-muted": data.theme.darkMuted,
    "--site-dark-accent": data.theme.darkAccent,
    "--site-dark-accent-2": data.theme.darkAccent2,
    "--site-radius": data.theme.radius === "sharp" ? "0px" : data.theme.radius === "round" ? "28px" : "12px",
  };
}

export function PortfolioView({ data, preview = false }: { data: SiteData; preview?: boolean }) {
  const mailHref = `mailto:${data.basics.email}`;
  const publishedPosts = data.posts.filter((post) => post.published);

  return (
    <main className={`portfolio-site journal-site${preview ? " is-preview" : ""}`} style={getSiteStyle(data)}>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="site-identity" href="#top" aria-label="Back to top">
          <span>{data.basics.initials}</span>
          <strong>{data.basics.name}</strong>
        </a>
        <div className="site-nav-links">
          {data.sections.writing && <a href="#writing">Writing</a>}
          {data.sections.about && <a href="#about">About</a>}
          {data.sections.work && <a href="#work">Work</a>}
          {data.sections.contact && <a href="#contact">Contact</a>}
        </div>
        <div className="nav-actions"><p className="nav-location">{data.basics.location}</p><ThemeToggle /></div>
      </nav>

      <header className="journal-hero" id="top">
        <div className="journal-hero-title">
          <p className="eyebrow">{data.basics.eyebrow}</p>
          <h1>{data.basics.role.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
        </div>
        <aside className="intro-card">
          <div className="intro-portrait">
            {data.basics.portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.basics.portraitUrl} alt={`Portrait of ${data.basics.name}`} />
            ) : <span>{data.basics.initials}</span>}
          </div>
          <p>{data.basics.intro}</p>
          <div className="intro-meta">
            <span>{data.basics.availability}</span>
            <a href={mailHref}>{data.basics.email}</a>
          </div>
        </aside>
      </header>

      <div className="manifesto-line"><span>{data.copy.manifesto}</span><i>↓</i></div>

      {data.sections.writing && (
        <section className="writing-section site-section" id="writing">
          <div className="journal-section-heading">
            <div><p className="eyebrow">{data.copy.writingEyebrow}</p><h2>{data.copy.writingTitle}</h2></div>
            <span>{String(publishedPosts.length).padStart(2, "0")}</span>
          </div>
          <div className="post-list">
            {publishedPosts.map((post, index) => (
              <a className={`post-row${index === 0 ? " is-featured" : ""}`} href={`/writing/${post.slug}`} key={post.id}>
                <div className="post-number">{String(index + 1).padStart(2, "0")}</div>
                <div className="post-copy">
                  <div className="post-meta"><span>{post.category}</span><time>{post.date}</time><span>{post.readingTime}</span></div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
                <span className="post-arrow">↗</span>
              </a>
            ))}
            {publishedPosts.length === 0 && <p className="empty-note">No published notes yet.</p>}
          </div>
        </section>
      )}

      {data.sections.about && (
        <section className="journal-about site-section" id="about">
          <div className="journal-section-heading simple">
            <div><p className="eyebrow">{data.copy.aboutEyebrow}</p><h2>{data.copy.aboutTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</h2></div>
          </div>
          <div className="about-reading-column">
            {data.copy.aboutBody.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {data.basics.resumeUrl && <a href={data.basics.resumeUrl} target="_blank" rel="noreferrer">Open résumé ↗</a>}
          </div>
          {data.stats.length > 0 && <div className="stats-grid">
            {data.stats.map((stat) => <div key={`${stat.value}-${stat.label}`}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
          </div>}
        </section>
      )}

      {data.sections.work && (
        <section className="journal-work site-section" id="work">
          <div className="journal-section-heading">
            <div><p className="eyebrow">{data.copy.workEyebrow}</p><h2>{data.copy.workTitle}</h2></div>
            <span>{String(data.projects.length).padStart(2, "0")}</span>
          </div>
          <div className="work-list">
            {data.projects.map((project, index) => (
              <a href={project.url || "#"} className="work-row" key={project.id} target={project.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                <div className="work-swatch" style={{ background: project.accent }}><span>{String(index + 1).padStart(2, "0")}</span></div>
                <div className="work-title"><span>{project.year}</span><h3>{project.title}</h3></div>
                <p>{project.summary}</p>
                <ul>{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                <i>↗</i>
              </a>
            ))}
          </div>
        </section>
      )}

      {data.sections.experience && (
        <section className="journal-experience site-section" id="experience">
          <div className="journal-section-heading simple"><div><p className="eyebrow">Timeline / Experience</p><h2>{data.copy.experienceTitle}</h2></div></div>
          <div className="experience-list">
            {data.experience.map((item) => (
              <article key={item.id}>
                <time>{item.period}</time>
                <div><h3>{item.role}</h3><span>{item.company}</span></div>
                <p>{item.summary}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {data.sections.services && (
        <section className="journal-services site-section" id="services">
          <div className="journal-section-heading simple"><div><p className="eyebrow">Practice / What I do</p><h2>{data.copy.servicesTitle}</h2></div></div>
          <div className="services-list">
            {data.services.map((item) => <article key={item.id}><span>{item.index}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}
          </div>
        </section>
      )}

      {data.sections.contact && (
        <footer className="journal-contact" id="contact">
          <p className="eyebrow">{data.copy.contactEyebrow}</p>
          <h2>{data.copy.contactTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</h2>
          <div className="contact-lower">
            <p>{data.copy.contactBody}</p>
            <a className="email-link" href={mailHref}>{data.basics.email}<span>↗</span></a>
          </div>
          <div className="footer-row">
            <p>© {new Date().getFullYear()} {data.basics.name}</p>
            <div>{data.socials.map((social) => <a href={social.url} key={social.label} target={social.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{social.label}</a>)}</div>
            <a href="/studio">Edit site</a>
          </div>
        </footer>
      )}
    </main>
  );
}
