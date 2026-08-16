"use client";

import { useEffect, useRef, useState } from "react";
import { PortfolioView } from "../../components/PortfolioView";
import { sanitizeSiteData, type SiteData, type SiteExperience, type SitePost, type SiteProject } from "../../lib/site-content";

type Tab = "basics" | "writing" | "projects" | "experience" | "design" | "advanced";
type SaveState = "idle" | "saving" | "saved" | "error";

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function Studio({ initialData, userName }: { initialData: SiteData; userName: string }) {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<Tab>("basics");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [jsonDraft, setJsonDraft] = useState(JSON.stringify(initialData, null, 2));
  const revision = useRef(0);

  useEffect(() => {
    let active = true;
    fetch("/api/site", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("load")))
      .then((result: { data: SiteData }) => {
        if (!active) return;
        setData(result.data);
        setJsonDraft(JSON.stringify(result.data, null, 2));
      })
      .catch(() => setMessage("当前显示默认内容，首次保存后会创建你的站点。"));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const currentRevision = ++revision.current;
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/site", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(result.error || "保存失败");
        if (revision.current === currentRevision) {
          setSaveState("saved");
          setDirty(false);
          setMessage("");
        }
        const channel = new BroadcastChannel("portfolio-live");
        channel.postMessage(data);
        channel.close();
      } catch (error) {
        setSaveState("error");
        setMessage(error instanceof Error ? error.message : "保存失败，请重试");
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [data, dirty]);

  const update = (next: SiteData | ((current: SiteData) => SiteData)) => {
    setData(next);
    setDirty(true);
  };

  const setBasic = (key: keyof SiteData["basics"], value: string) =>
    update((current) => ({ ...current, basics: { ...current.basics, [key]: value } }));

  const setCopy = (key: keyof SiteData["copy"], value: string) =>
    update((current) => ({ ...current, copy: { ...current.copy, [key]: value } }));

  const setTheme = (key: keyof SiteData["theme"], value: string) =>
    update((current) => ({ ...current, theme: { ...current.theme, [key]: value } } as SiteData));

  const updateProject = (id: string, patch: Partial<SiteProject>) =>
    update((current) => ({ ...current, projects: current.projects.map((item) => item.id === id ? { ...item, ...patch } : item) }));

  const updatePost = (id: string, patch: Partial<SitePost>) =>
    update((current) => ({ ...current, posts: current.posts.map((item) => item.id === id ? { ...item, ...patch } : item) }));

  const updateExperience = (id: string, patch: Partial<SiteExperience>) =>
    update((current) => ({ ...current, experience: current.experience.map((item) => item.id === id ? { ...item, ...patch } : item) }));

  const switchTab = (next: Tab) => {
    if (next === "advanced") setJsonDraft(JSON.stringify(data, null, 2));
    setTab(next);
  };

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.replace("/studio/login");
  };

  const applyJson = () => {
    try {
      const next = sanitizeSiteData(JSON.parse(jsonDraft));
      update(next);
      setJsonDraft(JSON.stringify(next, null, 2));
      setMessage("JSON 已应用，正在保存。 ");
    } catch {
      setMessage("JSON 格式有误，请检查逗号、引号与括号。 ");
      setSaveState("error");
    }
  };

  return (
    <main className="studio-shell">
      <header className="studio-topbar">
        <div className="studio-brand"><span>PS</span><div><strong>Portfolio Studio</strong><small>为 {userName} 编辑</small></div></div>
        <div className={`save-status is-${saveState}`}><span />{saveState === "saving" ? "正在保存" : saveState === "saved" ? "已实时发布" : saveState === "error" ? "保存失败" : "所有更改自动保存"}</div>
        <div className="studio-actions"><a href="/" target="_blank">打开网站 ↗</a><button type="button" onClick={signOut}>退出</button></div>
      </header>

      <div className="studio-body">
        <aside className="studio-panel">
          <nav className="studio-tabs" aria-label="编辑分区">
            {([
              ["basics", "基本信息"], ["writing", "文章"], ["projects", "项目"], ["experience", "经历"], ["design", "设计"], ["advanced", "高级"],
            ] as Array<[Tab, string]>).map(([key, label]) => <button className={tab === key ? "is-active" : ""} key={key} onClick={() => switchTab(key)}>{label}</button>)}
          </nav>

          <div className="studio-fields">
            {message && <div className="studio-message">{message}</div>}

            {tab === "basics" && <>
              <EditorSection title="个人资料" description="这些内容会出现在首屏和页脚。">
                <Field label="姓名"><input value={data.basics.name} onChange={(event) => setBasic("name", event.target.value)} /></Field>
                <Field label="标志缩写"><input value={data.basics.initials} maxLength={8} onChange={(event) => setBasic("initials", event.target.value)} /></Field>
                <Field label="身份标签"><input value={data.basics.eyebrow} onChange={(event) => setBasic("eyebrow", event.target.value)} /></Field>
                <Field label="主标题"><textarea rows={3} value={data.basics.role} onChange={(event) => setBasic("role", event.target.value)} /><Hint>换行会保留在页面中。</Hint></Field>
                <Field label="个人简介"><textarea rows={5} value={data.basics.intro} onChange={(event) => setBasic("intro", event.target.value)} /></Field>
                <Field label="所在地"><input value={data.basics.location} onChange={(event) => setBasic("location", event.target.value)} /></Field>
                <Field label="联系邮箱"><input type="email" value={data.basics.email} onChange={(event) => setBasic("email", event.target.value)} /></Field>
                <Field label="档期状态"><input value={data.basics.availability} onChange={(event) => setBasic("availability", event.target.value)} /></Field>
                <Field label="头像图片链接"><input placeholder="https://…" value={data.basics.portraitUrl} onChange={(event) => setBasic("portraitUrl", event.target.value)} /></Field>
                <Field label="简历链接"><input placeholder="https://…" value={data.basics.resumeUrl} onChange={(event) => setBasic("resumeUrl", event.target.value)} /></Field>
              </EditorSection>
              <EditorSection title="页面文案" description="自由改变网站的语气与表达。">
                <Field label="滚动宣言"><input value={data.copy.manifesto} onChange={(event) => setCopy("manifesto", event.target.value)} /></Field>
                <Field label="文章区标题"><input value={data.copy.writingTitle} onChange={(event) => setCopy("writingTitle", event.target.value)} /></Field>
                <Field label="关于标题"><textarea rows={3} value={data.copy.aboutTitle} onChange={(event) => setCopy("aboutTitle", event.target.value)} /></Field>
                <Field label="关于正文"><textarea rows={8} value={data.copy.aboutBody} onChange={(event) => setCopy("aboutBody", event.target.value)} /></Field>
                <Field label="联系标题"><textarea rows={3} value={data.copy.contactTitle} onChange={(event) => setCopy("contactTitle", event.target.value)} /></Field>
              </EditorSection>
            </>}

            {tab === "writing" && <EditorSection title="Blog posts" description="文章会按这里的顺序展示；关闭 Published 可暂时隐藏。">
              {data.posts.map((post, index) => <div className="repeat-card" key={post.id}>
                <div className="repeat-title"><strong>Post {String(index + 1).padStart(2, "0")}</strong><button onClick={() => update((current) => ({ ...current, posts: current.posts.filter((item) => item.id !== post.id) }))}>删除</button></div>
                <Field label="Title"><input value={post.title} onChange={(event) => updatePost(post.id, { title: event.target.value })} /></Field>
                <Field label="URL slug"><input value={post.slug} onChange={(event) => updatePost(post.id, { slug: event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} /><Hint>Use lowercase English letters, numbers, and hyphens.</Hint></Field>
                <div className="field-row"><Field label="Category"><input value={post.category} onChange={(event) => updatePost(post.id, { category: event.target.value })} /></Field><Field label="Date"><input value={post.date} onChange={(event) => updatePost(post.id, { date: event.target.value })} /></Field></div>
                <Field label="Reading time"><input value={post.readingTime} onChange={(event) => updatePost(post.id, { readingTime: event.target.value })} /></Field>
                <Field label="Excerpt"><textarea rows={4} value={post.excerpt} onChange={(event) => updatePost(post.id, { excerpt: event.target.value })} /></Field>
                <Field label="Article"><textarea rows={12} value={post.content} onChange={(event) => updatePost(post.id, { content: event.target.value })} /><Hint>Separate paragraphs with a blank line. Start a section heading with ##.</Hint></Field>
                <label className="toggle-row"><span>Published</span><input type="checkbox" checked={post.published} onChange={(event) => updatePost(post.id, { published: event.target.checked })} /></label>
              </div>)}
              <button className="add-button" onClick={() => update((current) => ({ ...current, posts: [...current.posts, { id: uid("post"), slug: `note-${current.posts.length + 1}`, title: "Article title", excerpt: "[Add a short summary of this note.]", date: "20XX.XX.XX", readingTime: "X min read", category: "Notes", content: "[Write your article here.]", published: false }] }))}>＋ 添加文章</button>
            </EditorSection>}

            {tab === "projects" && <EditorSection title="精选项目" description="最多展示 12 个项目。">
              {data.projects.map((project, index) => <div className="repeat-card" key={project.id}>
                <div className="repeat-title"><strong>项目 {String(index + 1).padStart(2, "0")}</strong><button onClick={() => update((current) => ({ ...current, projects: current.projects.filter((item) => item.id !== project.id) }))}>删除</button></div>
                <Field label="项目名称"><input value={project.title} onChange={(event) => updateProject(project.id, { title: event.target.value })} /></Field>
                <Field label="一句话介绍"><textarea rows={3} value={project.summary} onChange={(event) => updateProject(project.id, { summary: event.target.value })} /></Field>
                <div className="field-row"><Field label="年份"><input value={project.year} onChange={(event) => updateProject(project.id, { year: event.target.value })} /></Field><Field label="主题色"><input type="color" value={project.accent} onChange={(event) => updateProject(project.id, { accent: event.target.value })} /></Field></div>
                <Field label="标签（逗号分隔）"><input value={project.tags.join(", ")} onChange={(event) => updateProject(project.id, { tags: event.target.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) })} /></Field>
                <Field label="项目链接"><input value={project.url} onChange={(event) => updateProject(project.id, { url: event.target.value })} /></Field>
                <Field label="封面图片链接"><input placeholder="留空使用自动生成的图形" value={project.image} onChange={(event) => updateProject(project.id, { image: event.target.value })} /></Field>
              </div>)}
              <button className="add-button" onClick={() => update((current) => ({ ...current, projects: [...current.projects, { id: uid("project"), title: "Project title", summary: "[Add a short description of the project and your role.]", tags: ["Discipline", "Your role"], year: "20XX", url: "#", image: "", accent: current.theme.accent }] }))}>＋ 添加项目</button>
            </EditorSection>}

            {tab === "experience" && <EditorSection title="工作经历" description="按时间从近到远排列。">
              {data.experience.map((item, index) => <div className="repeat-card" key={item.id}>
                <div className="repeat-title"><strong>经历 {String(index + 1).padStart(2, "0")}</strong><button onClick={() => update((current) => ({ ...current, experience: current.experience.filter((row) => row.id !== item.id) }))}>删除</button></div>
                <Field label="时间"><input value={item.period} onChange={(event) => updateExperience(item.id, { period: event.target.value })} /></Field>
                <Field label="职位"><input value={item.role} onChange={(event) => updateExperience(item.id, { role: event.target.value })} /></Field>
                <Field label="公司 / 团队"><input value={item.company} onChange={(event) => updateExperience(item.id, { company: event.target.value })} /></Field>
                <Field label="工作简介"><textarea rows={3} value={item.summary} onChange={(event) => updateExperience(item.id, { summary: event.target.value })} /></Field>
              </div>)}
              <button className="add-button" onClick={() => update((current) => ({ ...current, experience: [...current.experience, { id: uid("experience"), period: "20XX — now", role: "Role title", company: "Studio / company", summary: "[Add a brief note about this experience.]" }] }))}>＋ 添加经历</button>
            </EditorSection>}

            {tab === "design" && <>
              <EditorSection title="品牌配色" description="调整后会立即反映在右侧预览。">
                <ColorField label="页面背景" value={data.theme.background} onChange={(value) => setTheme("background", value)} />
                <ColorField label="卡片背景" value={data.theme.surface} onChange={(value) => setTheme("surface", value)} />
                <ColorField label="主要文字" value={data.theme.text} onChange={(value) => setTheme("text", value)} />
                <ColorField label="辅助文字" value={data.theme.muted} onChange={(value) => setTheme("muted", value)} />
                <ColorField label="强调色" value={data.theme.accent} onChange={(value) => setTheme("accent", value)} />
                <ColorField label="第二强调色" value={data.theme.accent2} onChange={(value) => setTheme("accent2", value)} />
                <Field label="圆角风格"><select value={data.theme.radius} onChange={(event) => setTheme("radius", event.target.value)}><option value="sharp">锐利</option><option value="soft">柔和</option><option value="round">圆润</option></select></Field>
              </EditorSection>
              <EditorSection title="深色模式配色" description="访客切换到深色模式时使用这一组颜色。">
                <ColorField label="深色背景" value={data.theme.darkBackground} onChange={(value) => setTheme("darkBackground", value)} />
                <ColorField label="深色卡片" value={data.theme.darkSurface} onChange={(value) => setTheme("darkSurface", value)} />
                <ColorField label="深色主要文字" value={data.theme.darkText} onChange={(value) => setTheme("darkText", value)} />
                <ColorField label="深色辅助文字" value={data.theme.darkMuted} onChange={(value) => setTheme("darkMuted", value)} />
                <ColorField label="深色强调色" value={data.theme.darkAccent} onChange={(value) => setTheme("darkAccent", value)} />
                <ColorField label="深色第二强调色" value={data.theme.darkAccent2} onChange={(value) => setTheme("darkAccent2", value)} />
              </EditorSection>
              <EditorSection title="显示版块" description="关闭后该版块会从公开页面隐藏。">
                {(Object.keys(data.sections) as Array<keyof SiteData["sections"]>).map((key) => <label className="toggle-row" key={key}><span>{{ writing: "博客文章", about: "关于我", work: "项目作品", experience: "工作经历", services: "服务能力", contact: "联系信息" }[key]}</span><input type="checkbox" checked={data.sections[key]} onChange={(event) => update((current) => ({ ...current, sections: { ...current.sections, [key]: event.target.checked } }))} /></label>)}
              </EditorSection>
            </>}

            {tab === "advanced" && <EditorSection title="高级 JSON 编辑" description="适合批量修改、备份或迁移全部内容。保存前会自动校验并清理不安全字段。">
              <textarea className="json-editor" spellCheck={false} value={jsonDraft} onChange={(event) => setJsonDraft(event.target.value)} />
              <button className="apply-button" onClick={applyJson}>校验并应用</button>
            </EditorSection>}
          </div>
        </aside>

        <section className="studio-preview-area">
          <div className="preview-toolbar"><span>实时预览</span><div><button className={previewMode === "desktop" ? "is-active" : ""} onClick={() => setPreviewMode("desktop")} aria-label="桌面预览">▰</button><button className={previewMode === "mobile" ? "is-active" : ""} onClick={() => setPreviewMode("mobile")} aria-label="手机预览">▯</button></div></div>
          <div className={`preview-device is-${previewMode}`}><PortfolioView data={data} preview /></div>
        </section>
      </div>
    </main>
  );
}

function EditorSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="editor-section"><div className="editor-section-title"><h2>{title}</h2><p>{description}</p></div>{children}</section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="studio-field"><span>{label}</span>{children}</label>;
}

function Hint({ children }: { children: React.ReactNode }) { return <small className="field-hint">{children}</small>; }

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="color-field"><span>{label}</span><div><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /><input value={value} onChange={(event) => onChange(event.target.value)} /></div></label>;
}
