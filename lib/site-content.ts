export type SiteTheme = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  radius: "sharp" | "soft" | "round";
};

export type SiteProject = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  year: string;
  url: string;
  image: string;
  accent: string;
};

export type SiteExperience = {
  id: string;
  period: string;
  role: string;
  company: string;
  summary: string;
};

export type SiteService = {
  id: string;
  index: string;
  title: string;
  description: string;
};

export type SiteData = {
  basics: {
    name: string;
    initials: string;
    eyebrow: string;
    role: string;
    intro: string;
    location: string;
    email: string;
    availability: string;
    portraitUrl: string;
    resumeUrl: string;
  };
  copy: {
    manifesto: string;
    aboutEyebrow: string;
    aboutTitle: string;
    aboutBody: string;
    workEyebrow: string;
    workTitle: string;
    experienceTitle: string;
    servicesTitle: string;
    contactEyebrow: string;
    contactTitle: string;
    contactBody: string;
  };
  stats: Array<{ value: string; label: string }>;
  socials: Array<{ label: string; url: string }>;
  projects: SiteProject[];
  experience: SiteExperience[];
  services: SiteService[];
  sections: {
    about: boolean;
    work: boolean;
    experience: boolean;
    services: boolean;
    contact: boolean;
  };
  theme: SiteTheme;
};

export const DEFAULT_SITE: SiteData = {
  basics: {
    name: "Your Name",
    initials: "YN",
    eyebrow: "Your role / discipline",
    role: "A concise sentence about\nyour work or practice.",
    intro: "[Add a short introduction in your own words. Two or three sentences is usually enough.]",
    location: "City / time zone",
    email: "you@example.com",
    availability: "Current status",
    portraitUrl: "",
    resumeUrl: "",
  },
  copy: {
    manifesto: "A SHORT LINE ABOUT YOUR PRACTICE",
    aboutEyebrow: "About / A short introduction",
    aboutTitle: "A simple thought that\nfeels true to you.",
    aboutBody: "[Write a short introduction about your background, interests, and the way you work.]\n\n[Add another paragraph for the details that matter to you.]",
    workEyebrow: "Selected work / 20XX—20XX",
    workTitle: "Selected work",
    experienceTitle: "Experience",
    servicesTitle: "Areas of practice",
    contactEyebrow: "Contact / Say hello",
    contactTitle: "Add a quiet, personal\ninvitation to get in touch.",
    contactBody: "[Let people know what kind of messages you welcome, in your own tone of voice.]",
  },
  stats: [
    { value: "XX", label: "years of practice" },
    { value: "XX", label: "projects or collaborations" },
    { value: "XX", label: "another detail you value" },
  ],
  socials: [
    { label: "Social link 01", url: "#" },
    { label: "Social link 02", url: "#" },
    { label: "Social link 03", url: "#" },
  ],
  projects: [
    {
      id: "project-01",
      title: "Project title 01",
      summary: "[A short description of the project, your role, and why it mattered to you.]",
      tags: ["Discipline", "Your role"],
      year: "20XX",
      url: "#",
      image: "",
      accent: "#d8e3d4",
    },
    {
      id: "project-02",
      title: "Project title 02",
      summary: "[A short description of the project, your role, and why it mattered to you.]",
      tags: ["Discipline", "Your role"],
      year: "20XX",
      url: "#",
      image: "",
      accent: "#e6ded0",
    },
    {
      id: "project-03",
      title: "Project title 03",
      summary: "[A short description of the project, your role, and why it mattered to you.]",
      tags: ["Discipline", "Your role"],
      year: "20XX",
      url: "#",
      image: "",
      accent: "#d8dde4",
    },
  ],
  experience: [
    {
      id: "experience-01",
      period: "20XX — now",
      role: "Role title",
      company: "Studio / company",
      summary: "[A brief note about what you did, learned, or contributed here.]",
    },
    {
      id: "experience-02",
      period: "20XX — 20XX",
      role: "Role title",
      company: "Studio / company",
      summary: "[A brief note about what you did, learned, or contributed here.]",
    },
    {
      id: "experience-03",
      period: "20XX — 20XX",
      role: "Role title",
      company: "Studio / company",
      summary: "[A brief note about what you did, learned, or contributed here.]",
    },
  ],
  services: [
    {
      id: "practice-01",
      index: "01",
      title: "Area of practice 01",
      description: "[A simple description of what this part of your practice includes.]",
    },
    {
      id: "practice-02",
      index: "02",
      title: "Area of practice 02",
      description: "[A simple description of what this part of your practice includes.]",
    },
    {
      id: "practice-03",
      index: "03",
      title: "Area of practice 03",
      description: "[A simple description of what this part of your practice includes.]",
    },
  ],
  sections: {
    about: true,
    work: true,
    experience: true,
    services: true,
    contact: true,
  },
  theme: {
    background: "#f6f6f1",
    surface: "#ffffff",
    text: "#171a17",
    muted: "#747a74",
    accent: "#d8e3d4",
    accent2: "#737d71",
    radius: "sharp",
  },
};

const text = (value: unknown, fallback: string, max = 2000) =>
  typeof value === "string" ? value.slice(0, max) : fallback;

const color = (value: unknown, fallback: string) =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;

const bool = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const list = (value: unknown) => (Array.isArray(value) ? value : []);

export function sanitizeSiteData(value: unknown): SiteData {
  const root = record(value);
  const basics = record(root.basics);
  const copy = record(root.copy);
  const sections = record(root.sections);
  const theme = record(root.theme);

  const projects = list(root.projects)
    .slice(0, 12)
    .map((item, index) => {
      const row = record(item);
      const fallback = DEFAULT_SITE.projects[index % DEFAULT_SITE.projects.length];
      return {
        id: text(row.id, `project-${index + 1}`, 80),
        title: text(row.title, fallback.title, 120),
        summary: text(row.summary, fallback.summary, 500),
        tags: list(row.tags).slice(0, 8).map((tag) => text(tag, "", 40)).filter(Boolean),
        year: text(row.year, fallback.year, 16),
        url: text(row.url, "#", 500),
        image: text(row.image, "", 1000),
        accent: color(row.accent, fallback.accent),
      };
    });

  const experience = list(root.experience)
    .slice(0, 12)
    .map((item, index) => {
      const row = record(item);
      const fallback = DEFAULT_SITE.experience[index % DEFAULT_SITE.experience.length];
      return {
        id: text(row.id, `experience-${index + 1}`, 80),
        period: text(row.period, fallback.period, 60),
        role: text(row.role, fallback.role, 120),
        company: text(row.company, fallback.company, 120),
        summary: text(row.summary, fallback.summary, 500),
      };
    });

  const services = list(root.services)
    .slice(0, 8)
    .map((item, index) => {
      const row = record(item);
      const fallback = DEFAULT_SITE.services[index % DEFAULT_SITE.services.length];
      return {
        id: text(row.id, `service-${index + 1}`, 80),
        index: text(row.index, String(index + 1).padStart(2, "0"), 8),
        title: text(row.title, fallback.title, 120),
        description: text(row.description, fallback.description, 500),
      };
    });

  return {
    basics: {
      name: text(basics.name, DEFAULT_SITE.basics.name, 80),
      initials: text(basics.initials, DEFAULT_SITE.basics.initials, 8),
      eyebrow: text(basics.eyebrow, DEFAULT_SITE.basics.eyebrow, 120),
      role: text(basics.role, DEFAULT_SITE.basics.role, 180),
      intro: text(basics.intro, DEFAULT_SITE.basics.intro, 700),
      location: text(basics.location, DEFAULT_SITE.basics.location, 120),
      email: text(basics.email, DEFAULT_SITE.basics.email, 200),
      availability: text(basics.availability, DEFAULT_SITE.basics.availability, 100),
      portraitUrl: text(basics.portraitUrl, "", 1000),
      resumeUrl: text(basics.resumeUrl, "", 1000),
    },
    copy: {
      manifesto: text(copy.manifesto, DEFAULT_SITE.copy.manifesto, 160),
      aboutEyebrow: text(copy.aboutEyebrow, DEFAULT_SITE.copy.aboutEyebrow, 120),
      aboutTitle: text(copy.aboutTitle, DEFAULT_SITE.copy.aboutTitle, 240),
      aboutBody: text(copy.aboutBody, DEFAULT_SITE.copy.aboutBody, 2400),
      workEyebrow: text(copy.workEyebrow, DEFAULT_SITE.copy.workEyebrow, 120),
      workTitle: text(copy.workTitle, DEFAULT_SITE.copy.workTitle, 160),
      experienceTitle: text(copy.experienceTitle, DEFAULT_SITE.copy.experienceTitle, 160),
      servicesTitle: text(copy.servicesTitle, DEFAULT_SITE.copy.servicesTitle, 160),
      contactEyebrow: text(copy.contactEyebrow, DEFAULT_SITE.copy.contactEyebrow, 120),
      contactTitle: text(copy.contactTitle, DEFAULT_SITE.copy.contactTitle, 240),
      contactBody: text(copy.contactBody, DEFAULT_SITE.copy.contactBody, 700),
    },
    stats: list(root.stats).slice(0, 6).map((item, index) => {
      const row = record(item);
      const fallback = DEFAULT_SITE.stats[index % DEFAULT_SITE.stats.length];
      return {
        value: text(row.value, fallback.value, 24),
        label: text(row.label, fallback.label, 80),
      };
    }),
    socials: list(root.socials).slice(0, 8).map((item, index) => {
      const row = record(item);
      const fallback = DEFAULT_SITE.socials[index % DEFAULT_SITE.socials.length];
      return {
        label: text(row.label, fallback.label, 40),
        url: text(row.url, fallback.url, 500),
      };
    }),
    projects: projects.length ? projects : DEFAULT_SITE.projects,
    experience: experience.length ? experience : DEFAULT_SITE.experience,
    services: services.length ? services : DEFAULT_SITE.services,
    sections: {
      about: bool(sections.about, DEFAULT_SITE.sections.about),
      work: bool(sections.work, DEFAULT_SITE.sections.work),
      experience: bool(sections.experience, DEFAULT_SITE.sections.experience),
      services: bool(sections.services, DEFAULT_SITE.sections.services),
      contact: bool(sections.contact, DEFAULT_SITE.sections.contact),
    },
    theme: {
      background: color(theme.background, DEFAULT_SITE.theme.background),
      surface: color(theme.surface, DEFAULT_SITE.theme.surface),
      text: color(theme.text, DEFAULT_SITE.theme.text),
      muted: color(theme.muted, DEFAULT_SITE.theme.muted),
      accent: color(theme.accent, DEFAULT_SITE.theme.accent),
      accent2: color(theme.accent2, DEFAULT_SITE.theme.accent2),
      radius: ["sharp", "soft", "round"].includes(String(theme.radius))
        ? (theme.radius as SiteTheme["radius"])
        : DEFAULT_SITE.theme.radius,
    },
  };
}
