import type { CSSProperties } from "react";
import type { SiteData } from "../lib/site-content";

type PortfolioStyle = CSSProperties & {
  "--site-bg": string;
  "--site-surface": string;
  "--site-text": string;
  "--site-muted": string;
  "--site-accent": string;
  "--site-accent-2": string;
  "--site-radius": string;
};

export function PortfolioView({ data, preview = false }: { data: SiteData; preview?: boolean }) {
  const style: PortfolioStyle = {
    "--site-bg": data.theme.background,
    "--site-surface": data.theme.surface,
    "--site-text": data.theme.text,
    "--site-muted": data.theme.muted,
    "--site-accent": data.theme.accent,
    "--site-accent-2": data.theme.accent2,
    "--site-radius": data.theme.radius === "sharp" ? "0px" : data.theme.radius === "round" ? "32px" : "14px",
  };

  const mailHref = `mailto:${data.basics.email}`;

  return (
    <main className={`portfolio-site${preview ? " is-preview" : ""}`} style={style}>
      <nav className="site-nav" aria-label="主导航">
        <a className="site-logo" href="#top" aria-label="返回首页">
          <span>{data.basics.initials}</span>
        </a>
        <div className="site-nav-links">
          {data.sections.work && <a href="#work">Work</a>}
          {data.sections.about && <a href="#about">About</a>}
          {data.sections.experience && <a href="#experience">Experience</a>}
          {data.sections.contact && <a href="#contact">Contact</a>}
        </div>
        <a className="availability-pill" href={mailHref}>
          <span aria-hidden="true" />
          {data.basics.availability}
        </a>
      </nav>

      <header className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>✦</span>{data.basics.eyebrow}</p>
          <h1>{data.basics.role.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
          <div className="hero-lower">
            <p>{data.basics.intro}</p>
            <a className="round-link" href="#work" aria-label="查看作品">↘</a>
          </div>
        </div>
        <div className="portrait-wrap" aria-label={`Portrait of ${data.basics.name}`}>
          <div className="portrait-card">
            {data.basics.portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.basics.portraitUrl} alt={`Portrait of ${data.basics.name}`} />
            ) : (
              <div className="portrait-placeholder">
                <span>{data.basics.initials}</span>
                <i />
              </div>
            )}
            <div className="portrait-note">BASED IN<br />{data.basics.location.toUpperCase()}</div>
          </div>
        </div>
      </header>

      <div className="manifesto-strip" aria-label={data.copy.manifesto}>
        <div>
          <span>{data.copy.manifesto}</span><b>✦</b>
          <span>{data.copy.manifesto}</span><b>✦</b>
          <span>{data.copy.manifesto}</span><b>✦</b>
        </div>
      </div>

      {data.sections.work && (
        <section className="work-section site-section" id="work">
          <div className="section-heading">
            <p className="eyebrow">{data.copy.workEyebrow}</p>
            <h2>{data.copy.workTitle}</h2>
            <span className="section-count">0{data.projects.length}</span>
          </div>
          <div className="project-grid">
            {data.projects.map((project, index) => (
              <a className="project-card" href={project.url || "#"} key={project.id} target={project.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                <div className="project-visual" style={{ "--project-accent": project.accent } as CSSProperties}>
                  {project.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.image} alt="" />
                  ) : (
                    <div className={`project-art project-art-${(index % 3) + 1}`}>
                      <span>{project.title.slice(0, 1)}</span>
                      <i>{String(index + 1).padStart(2, "0")}</i>
                    </div>
                  )}
                  <span className="project-arrow">↗</span>
                </div>
                <div className="project-meta">
                  <div><span>{project.year}</span><h3>{project.title}</h3></div>
                  <p>{project.summary}</p>
                  <ul>{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {data.sections.about && (
        <section className="about-section site-section" id="about">
          <div className="about-intro">
            <p className="eyebrow">{data.copy.aboutEyebrow}</p>
            <h2>{data.copy.aboutTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</h2>
          </div>
          <div className="about-copy">
            {data.copy.aboutBody.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {data.basics.resumeUrl && <a href={data.basics.resumeUrl} target="_blank" rel="noreferrer">下载完整简历 ↗</a>}
          </div>
          {data.stats.length > 0 && <div className="stats-grid">
            {data.stats.map((stat) => <div key={`${stat.value}-${stat.label}`}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
          </div>}
        </section>
      )}

      {data.sections.experience && (
        <section className="experience-section site-section" id="experience">
          <div className="section-heading compact"><p className="eyebrow">Notes / Experience</p><h2>{data.copy.experienceTitle}</h2></div>
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
        <section className="services-section site-section" id="services">
          <div className="section-heading compact"><p className="eyebrow">Practice / What I do</p><h2>{data.copy.servicesTitle}</h2></div>
          <div className="services-list">
            {data.services.map((item) => (
              <article key={item.id}><span>{item.index}</span><h3>{item.title}</h3><p>{item.description}</p><i>↗</i></article>
            ))}
          </div>
        </section>
      )}

      {data.sections.contact && (
        <footer className="contact-section" id="contact">
          <p className="eyebrow">{data.copy.contactEyebrow}</p>
          <h2>{data.copy.contactTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</h2>
          <p className="contact-body">{data.copy.contactBody}</p>
          <a className="email-link" href={mailHref}>{data.basics.email}<span>↗</span></a>
          <div className="footer-row">
            <p>© {new Date().getFullYear()} {data.basics.name}</p>
            <div>{data.socials.map((social) => <a href={social.url} key={social.label} target="_blank" rel="noreferrer">{social.label}</a>)}</div>
            <a href="/studio">Edit site</a>
          </div>
        </footer>
      )}
    </main>
  );
}
