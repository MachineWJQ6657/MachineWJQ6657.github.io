import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Menu, 
  X, 
  ArrowRight, 
  BookOpen, 
  Coffee, 
  PenTool, 
  Trash2, 
  Calendar,
  User,
  Send,
  Moon,
  Sun,
  Globe,
  Lock,
  Unlock,
  Settings,
  Save,
  AlertTriangle,
  Loader2
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics"; // Added Analytics import
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged,
  type User as FirebaseUser // FIXED: Added 'type' keyword here
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBlQdNWxuD2uDrnf1FEw47UUS7yRWcutZA",
  authDomain: "personal-web-9ff9e.firebaseapp.com",
  projectId: "personal-web-9ff9e",
  storageBucket: "personal-web-9ff9e.firebasestorage.app",
  messagingSenderId: "107628261788",
  appId: "1:107628261788:web:a791f29843111b0d359859",
  measurementId: "G-HGZ4YDE8S7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services (博客功能必须)
const auth = getAuth(app);
const db = getFirestore(app);
// 如果不需要 Analytics 可以注释掉下面这行
// const analytics = getAnalytics(app); 

// Local App ID for database path isolation
const appId = 'my-personal-blog'; 

// --- Types ---
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: any;
  readTime: string;
  tags: string[];
}

interface UserProfile {
  name: string;
  avatar: string;
  bio: string;
}

// --- Localization (i18n) Dictionary ---
const t = {
  en: {
    home: 'Home',
    about: 'About',
    blog: 'Blog',
    available: 'Available for freelance work',
    heroTitlePre: 'Designing digital',
    heroTitleHighlight: 'experiences',
    heroTitlePost: 'that matter.',
    heroDesc: 'I\'m a minimalist designer and developer based in the digital realm. I build accessible, pixel-perfect, and performant web applications.',
    readThoughts: 'Read my thoughts',
    moreAbout: 'More about me',
    aboutTitle: 'About Me',
    aboutDesc1: 'Hello! I\'m a creative developer with a passion for design systems and user experience.',
    aboutDesc2: 'My philosophy is simple: Make it work, make it right, make it fast.',
    techStack: 'Tech Stack',
    aboutOutro: 'When I\'m not at the computer, I\'m usually hanging out with my cat, reading sci-fi novels, or trying to brew the perfect cup of coffee.',
    journalTitle: 'Journal',
    journalDesc: 'Thoughts on development, design, and life.',
    adminLogin: 'Admin Login',
    adminLogout: 'Logout',
    writePost: 'Write New Post',
    noPosts: 'No posts found. Be the first to write one!',
    justNow: 'Just now',
    readArticle: 'Read Article',
    backToJournal: 'Back to Journal',
    thanksReading: 'Thanks for reading!',
    shareText: 'If you enjoyed this article, feel free to share it or check out my other posts.',
    readMore: 'Read more articles',
    cancel: 'Cancel',
    composeTitle: 'Compose New Entry',
    titleLabel: 'Title',
    excerptLabel: 'Excerpt',
    contentLabel: 'Content (Markdown Supported)',
    tagsLabel: 'Tags (comma separated)',
    publish: 'Publish Article',
    publishing: 'Publishing...',
    footerRights: 'All rights reserved.',
    contact: 'Contact',
    editProfile: 'Edit Profile',
    profileName: 'Display Name',
    profileAvatar: 'Avatar URL (Image Link)',
    profileBio: 'Short Bio',
    saveProfile: 'Save Profile',
    loginPlaceholder: 'Enter password (admin123)',
    loginError: 'Incorrect password',
    loginBtn: 'Login',
    deleteConfirmTitle: 'Delete Post?',
    deleteConfirmDesc: 'This action cannot be undone.',
    deleteConfirmBtn: 'Delete',
    loading: 'Loading posts...',
  },
  zh: {
    home: '首页',
    about: '关于',
    blog: '博客',
    available: '接受自由职业委托',
    heroTitlePre: '设计那些',
    heroTitleHighlight: '触动人心',
    heroTitlePost: '的数字体验。',
    heroDesc: '我是一名追求极简主义的设计师和开发者。我致力于构建无障碍、像素级完美且高性能的 Web 应用程序。',
    readThoughts: '阅读我的想法',
    moreAbout: '了解更多',
    aboutTitle: '关于我',
    aboutDesc1: '你好！我是一名热衷于设计系统和用户体验的创意开发者。',
    aboutDesc2: '我的哲学很简单：先让它跑起来，再把它做对，最后让它变快。',
    techStack: '技术栈',
    aboutOutro: '当我不在电脑前时，我通常在撸猫、看科幻小说，或者试图冲泡一杯完美的咖啡。',
    journalTitle: '日志',
    journalDesc: '关于开发、设计和生活的思考。',
    adminLogin: '管理员登录',
    adminLogout: '退出登录',
    writePost: '写新文章',
    noPosts: '暂无文章。成为第一个写文章的人吧！',
    justNow: '刚刚',
    readArticle: '阅读全文',
    backToJournal: '返回日志',
    thanksReading: '感谢阅读！',
    shareText: '如果你喜欢这篇文章，欢迎分享或查看我的其他文章。',
    readMore: '阅读更多文章',
    cancel: '取消',
    composeTitle: '撰写新条目',
    titleLabel: '标题',
    excerptLabel: '摘要',
    contentLabel: '内容 (支持 Markdown)',
    tagsLabel: '标签 (用逗号分隔)',
    publish: '发布文章',
    publishing: '发布中...',
    footerRights: '版权所有。',
    contact: '联系方式',
    editProfile: '编辑个人资料',
    profileName: '显示名称',
    profileAvatar: '头像链接 (URL)',
    profileBio: '简短简介',
    saveProfile: '保存资料',
    loginPlaceholder: '请输入密码 (admin123)',
    loginError: '密码错误',
    loginBtn: '登录',
    deleteConfirmTitle: '确认删除？',
    deleteConfirmDesc: '此操作无法撤销。',
    deleteConfirmBtn: '确认删除',
    loading: '正在加载文章...',
  }
};

// --- Enhanced Markdown Parser Component ---
const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) return null;

  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold text-zinc-900 dark:text-zinc-100">{part.slice(2, -2)}</strong>;
      if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400 border border-zinc-200 dark:border-zinc-700/50">{part.slice(1, -1)}</code>;
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const [label, url] = part.slice(1, -1).split('](');
        return <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline decoration-indigo-300 underline-offset-2">{label}</a>;
      }
      return part;
    });
  };

  const elements: JSX.Element[] = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for code block start/end
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of block
        elements.push(
          <div key={`code-${i}`} className="my-6 rounded-xl overflow-hidden bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 shadow-lg group relative">
            {/* macOS Style Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-white/5">
               <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 transition-colors"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 transition-colors"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 transition-colors"></div>
               </div>
               <span className="text-xs text-zinc-500 font-mono font-medium uppercase tracking-wider select-none">{codeBlockLang || 'CODE'}</span>
               <div className="w-10"></div> {/* Spacer for centering */}
            </div>
            <div className="p-5 overflow-x-auto">
              <pre className="font-mono text-sm text-zinc-300 leading-relaxed">
                <code>{codeBlockContent.join('\n')}</code>
              </pre>
            </div>
          </div>
        );
        codeBlockContent = [];
        codeBlockLang = '';
        inCodeBlock = false;
      } else {
        // Start of block
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Normal line parsing
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="font-serif text-3xl font-bold mb-4 mt-8 text-zinc-900 dark:text-white">{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="font-serif text-2xl font-bold mb-3 mt-6 text-zinc-900 dark:text-white">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="font-serif text-xl font-bold mb-2 mt-4 text-zinc-900 dark:text-white">{line.slice(4)}</h3>);
    } else if (line.startsWith('> ')) {
      elements.push(<blockquote key={i} className="border-l-4 border-indigo-500 pl-4 italic my-6 py-2 bg-zinc-50 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300 font-serif rounded-r-lg">{parseInline(line.slice(2))}</blockquote>);
    } else if (line.startsWith('- ')) {
      elements.push(<li key={i} className="ml-4 list-disc text-zinc-700 dark:text-zinc-300 mb-2 pl-2 marker:text-indigo-500">{parseInline(line.slice(2))}</li>);
    } else if (line.trim() === '') {
      elements.push(<br key={i} />);
    } else {
      elements.push(<p key={i} className="mb-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">{parseInline(line)}</p>);
    }
  }

  if (inCodeBlock && codeBlockContent.length > 0) {
    elements.push(
      <div key="code-unclosed" className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-mono text-sm overflow-x-auto my-4">
        <pre>{codeBlockContent.join('\n')}</pre>
      </div>
    );
  }

  return <div className="markdown-body font-sans">{elements}</div>;
};


// --- Modals ---

const LoginModal = ({ isOpen, onClose, onLogin, lang }: any) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const texts = t[lang as keyof typeof t];

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      onLogin();
      onClose();
    } else {
      setError(texts.loginError);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-serif flex items-center">
            <Lock className="w-5 h-5 mr-2 text-indigo-600" />
            {texts.adminLogin}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder={texts.loginPlaceholder}
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white mb-2 outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
          />
          {error && <p className="text-red-500 text-sm mb-4 flex items-center"><AlertTriangle size={12} className="mr-1" /> {error}</p>}
          {!error && <div className="h-4 mb-4"></div>} 
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {texts.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
            >
              {texts.loginBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ isOpen, onClose, onConfirm, lang }: any) => {
  if (!isOpen) return null;
  const texts = t[lang as keyof typeof t];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
             <Trash2 size={24} />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-serif mb-2">
            {texts.deleteConfirmTitle}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            {texts.deleteConfirmDesc}
          </p>
          <div className="flex w-full space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
            >
              {texts.cancel}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
            >
              {texts.deleteConfirmBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Components ---

// 1. Navigation
const Navbar = ({ view, setView, mobileMenuOpen, setMobileMenuOpen, theme, toggleTheme, lang, toggleLang }: any) => {
  const texts = t[lang as keyof typeof t];
  const navLinks = [
    { name: texts.home, value: 'home' },
    { name: texts.about, value: 'about' },
    { name: texts.blog, value: 'blog' },
  ];

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md transition-colors duration-300 font-sans">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between px-6 py-4">
        <button 
          onClick={() => setView('home')} 
          className="flex items-center space-x-2 rtl:space-x-reverse group"
        >
          <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <span className="text-white dark:text-zinc-900 font-bold font-serif italic text-lg">P</span>
          </div>
          <span className="self-center text-xl font-semibold whitespace-nowrap text-zinc-900 dark:text-white tracking-tight font-serif">
            Portfolio<span className="text-indigo-600 dark:text-indigo-400">.</span>
          </span>
        </button>
        
        <div className="flex items-center md:order-2 space-x-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button onClick={toggleLang} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors flex items-center font-mono text-xs font-bold">
            <Globe size={20} className="mr-1" /> {lang.toUpperCase()}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-zinc-500 rounded-lg md:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden w-full md:block md:w-auto md:order-1">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0">
            {navLinks.map((link) => (
              <li key={link.name}>
                <button
                  onClick={() => setView(link.value)}
                  className={`block py-2 px-3 rounded md:p-0 transition-colors duration-200 ${
                    view === link.value 
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {mobileMenuOpen && (
          <div className="w-full md:hidden border-t border-zinc-100 dark:border-zinc-800 mt-4 pt-2 md:order-1">
            <ul className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => {
                      setView(link.value);
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left py-2 px-3 rounded ${
                      view === link.value 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

// 2. Hero Section
const Hero = ({ setView, lang }: any) => {
  const texts = t[lang as keyof typeof t];
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 pt-20 text-center animate-fade-in-up font-sans">
      <div className="inline-flex items-center px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-8 transition-colors">
        <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mr-2 animate-pulse"></span>
        {texts.available}
      </div>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 dark:text-white mb-6 leading-tight transition-colors font-serif">
        {texts.heroTitlePre} <br className="hidden md:block" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 italic pr-2">
          {texts.heroTitleHighlight}
        </span> {texts.heroTitlePost}
      </h1>
      <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mb-10 leading-relaxed transition-colors font-light">
        {texts.heroDesc}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => setView('blog')}
          className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all hover:scale-105 shadow-lg shadow-zinc-900/20 dark:shadow-white/10"
        >
          {texts.readThoughts}
          <BookOpen className="ml-2 -mr-1 w-5 h-5" />
        </button>
        <button 
          onClick={() => setView('about')}
          className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all hover:scale-105"
        >
          {texts.moreAbout}
          <User className="ml-2 -mr-1 w-5 h-5" />
        </button>
      </div>
      
      <div className="mt-16 flex space-x-6 text-zinc-400 dark:text-zinc-500">
        <Github className="w-6 h-6 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors" />
        <Twitter className="w-6 h-6 hover:text-blue-400 cursor-pointer transition-colors" />
        <Linkedin className="w-6 h-6 hover:text-blue-700 cursor-pointer transition-colors" />
      </div>
    </div>
  );
};

// 3. About Section
const About = ({ lang, profile }: any) => {
  const texts = t[lang as keyof typeof t];
  return (
    <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 animate-fade-in font-sans">
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center transition-colors font-serif">
        <Coffee className="mr-3 text-indigo-600 dark:text-indigo-400" />
        {texts.aboutTitle}
      </h2>
      
      {/* Profile Snippet */}
      <div className="flex items-center space-x-6 mb-10 p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl">
        <img 
          src={profile.avatar || "https://ui-avatars.com/api/?name=User&background=random"} 
          alt="Profile" 
          className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-zinc-700 shadow-md"
        />
        <div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-serif">{profile.name}</h3>
          <p className="text-zinc-500 dark:text-zinc-400">{profile.bio}</p>
        </div>
      </div>

      <div className="prose prose-lg prose-zinc dark:prose-invert text-zinc-600 dark:text-zinc-300">
        <p className="mb-6">{texts.aboutDesc1}</p>
        <p className="mb-6">{texts.aboutDesc2}</p>
        
        <div className="my-12 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-colors">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 font-serif">{texts.techStack}</h3>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Firebase', 'Figma', 'Next.js'].map(skill => (
              <span key={skill} className="px-3 py-1 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-md text-sm text-zinc-600 dark:text-zinc-200 shadow-sm transition-colors font-mono">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <p>{texts.aboutOutro}</p>
      </div>
    </div>
  );
};

// 4. Blog List & Logic
const Blog = ({ posts, isLoading, setView, setSelectedPost, isAdmin, onRequestLogin, onRequestLogout, onRequestDelete, lang }: any) => {
  const texts = t[lang as keyof typeof t];
  return (
    <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 animate-fade-in font-sans">
      <div className="flex justify-between items-end mb-12 border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2 transition-colors font-serif">{texts.journalTitle}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-light">{texts.journalDesc}</p>
        </div>
        
        <button 
          onClick={isAdmin ? onRequestLogout : onRequestLogin}
          className={`flex items-center text-sm font-medium transition-colors px-3 py-2 rounded-lg ${isAdmin ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
        >
          {isAdmin ? <Unlock size={16} className="mr-2" /> : <Lock size={16} className="mr-2" />}
          {isAdmin ? texts.adminLogout : texts.adminLogin}
        </button>
      </div>

      {isAdmin && (
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setView('create-post')}
            className="flex-1 py-4 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex items-center justify-center"
          >
            <PenTool className="w-5 h-5 mr-2" />
            {texts.writePost}
          </button>
           <button
            onClick={() => setView('edit-profile')}
            className="flex-1 py-4 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center justify-center"
          >
            <Settings className="w-5 h-5 mr-2" />
            {texts.editProfile}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-zinc-400 text-sm">{texts.loading}</p>
        </div>
      ) : (
        <div className="grid gap-10">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
              <p className="text-zinc-400">{texts.noPosts}</p>
            </div>
          ) : (
            posts.map((post: BlogPost) => (
              <article 
                key={post.id} 
                className="group cursor-pointer"
                onClick={() => {
                  setSelectedPost(post);
                  setView('post-detail');
                }}
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 text-xs text-zinc-400 font-medium uppercase tracking-wider mb-2">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {post.date?.seconds ? new Date(post.date.seconds * 1000).toLocaleDateString() : texts.justNow}
                      </span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-serif leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                       <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                        {texts.readArticle} <ArrowRight className="ml-1 w-4 h-4" />
                      </span>
                      {isAdmin && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onRequestDelete(post.id);
                          }}
                          className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// 5. Single Post Detail
const PostDetail = ({ post, setView, lang, profile }: any) => {
  if (!post) return null;
  const texts = t[lang as keyof typeof t];

  return (
    <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 animate-fade-in font-sans">
      <button 
        onClick={() => setView('blog')}
        className="mb-8 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center text-sm font-medium transition-colors"
      >
        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
        {texts.backToJournal}
      </button>
      
      <header className="mb-10">
        <div className="flex gap-3 mb-6">
          {post.tags.map((tag: string) => (
            <span key={tag} className="text-xs px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full font-bold tracking-wide uppercase font-mono">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white mb-8 leading-tight font-serif">{post.title}</h1>
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-8">
           <div className="flex items-center space-x-4">
             <img 
               src={profile.avatar || "https://ui-avatars.com/api/?name=User"} 
               className="w-12 h-12 rounded-full object-cover bg-zinc-200 dark:bg-zinc-700"
               alt="Author"
             />
             <div>
               <p className="text-sm font-bold text-zinc-900 dark:text-white font-serif">{profile.name}</p>
               <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {post.date?.seconds ? new Date(post.date.seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
               </p>
             </div>
           </div>
           <span className="text-sm text-zinc-400 font-mono">{post.readTime} read</span>
        </div>
      </header>

      <MarkdownRenderer content={post.content} />
      
      <div className="mt-16 pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <h4 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white font-serif">{texts.thanksReading}</h4>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">{texts.shareText}</p>
        <button 
          onClick={() => setView('blog')}
          className="inline-flex items-center px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
        >
          {texts.readMore}
        </button>
      </div>
    </div>
  );
};

// 6. Create Post Form
const CreatePost = ({ setView, user, lang }: any) => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const texts = t[lang as keyof typeof t];

  // Handle Tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      // Insert 2 spaces for tab
      e.currentTarget.value = value.substring(0, start) + '  ' + value.substring(end);
      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
      setContent(e.currentTarget.value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const wordCount = content.split(/\s+/).length;
      const readTime = `${Math.ceil(wordCount / 200)} min`;

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), {
        title,
        excerpt,
        content,
        tags: tagArray,
        readTime,
        date: serverTimestamp(),
        authorId: user.uid
      });
      setView('blog');
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-32 pb-20 animate-fade-in font-sans">
       <button onClick={() => setView('blog')} className="mb-6 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 flex items-center text-sm"><ArrowRight className="w-4 h-4 mr-2 rotate-180" /> {texts.cancel}</button>
      
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-zinc-900 dark:text-white font-serif">
          <PenTool className="mr-3 text-indigo-600 dark:text-indigo-400" />
          {texts.composeTitle}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{texts.titleLabel}</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{texts.excerptLabel}</label>
            <input type="text" required value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{texts.contentLabel}</label>
            <textarea 
              required 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              onKeyDown={handleKeyDown}
              rows={12} 
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{texts.tagsLabel}</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-indigo-600/30">
            {isSubmitting ? texts.publishing : <>{texts.publish} <Send className="ml-2 w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

// 7. Profile Editor
const ProfileEditor = ({ setView, profile, lang }: any) => {
  const [name, setName] = useState(profile.name || '');
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const texts = t[lang as keyof typeof t];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Using setDoc with merge to update or create profile
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profile', 'main'), {
        name,
        avatar,
        bio
      }, { merge: true });
      setView('blog');
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 pt-32 pb-20 animate-fade-in font-sans">
       <button onClick={() => setView('blog')} className="mb-6 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 flex items-center text-sm"><ArrowRight className="w-4 h-4 mr-2 rotate-180" /> {texts.cancel}</button>
       
       <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
         <h2 className="text-2xl font-bold mb-8 flex items-center text-zinc-900 dark:text-white font-serif">
           <Settings className="mr-3 text-indigo-600 dark:text-indigo-400" />
           {texts.editProfile}
         </h2>
         
         <form onSubmit={handleSave} className="space-y-6">
            <div className="flex justify-center mb-6">
              <img src={avatar || "https://ui-avatars.com/api/?name=?"} className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50 dark:border-indigo-900/30" alt="Preview" onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=?')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{texts.profileName}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{texts.profileAvatar}</label>
              <input type="text" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{texts.profileBio}</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <button type="submit" disabled={isSaving} className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium py-3 rounded-lg transition-colors flex items-center justify-center hover:opacity-90">
              {isSaving ? 'Saving...' : <>{texts.saveProfile} <Save className="ml-2 w-4 h-4" /></>}
            </button>
         </form>
       </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [view, setView] = useState('home');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('en');
  const [profile, setProfile] = useState<UserProfile>({ name: 'Author', avatar: '', bio: 'Digital Creator' });
  
  // Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  const handleLoginRequest = () => setShowLoginModal(true);
  const handleLogoutRequest = () => setIsAdmin(false);

  const handleDeleteRequest = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (postToDelete) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', postToDelete));
      } catch (err) { 
        console.error(err); 
      }
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  // 1. Authenticate
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  // 2. Fetch Posts
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[];
      setPosts(postData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // 3. Fetch Profile
  useEffect(() => {
    if (!user) return;
    const profileDoc = doc(db, 'artifacts', appId, 'public', 'data', 'profile', 'main');
    const unsubscribe = onSnapshot(profileDoc, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [view]);

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
      `}</style>
      
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
        <Navbar 
          view={view} 
          setView={setView} 
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          theme={theme}
          toggleTheme={toggleTheme}
          lang={lang}
          toggleLang={toggleLang}
        />

        <main className="min-h-screen">
          {view === 'home' && <Hero setView={setView} lang={lang} />}
          {view === 'about' && <About lang={lang} profile={profile} />}
          {view === 'blog' && (
            <Blog 
              posts={posts} 
              isLoading={isLoading}
              setView={setView} 
              setSelectedPost={setSelectedPost} 
              isAdmin={isAdmin}
              onRequestLogin={handleLoginRequest}
              onRequestLogout={handleLogoutRequest}
              onRequestDelete={handleDeleteRequest}
              lang={lang}
            />
          )}
          {view === 'post-detail' && <PostDetail post={selectedPost} setView={setView} lang={lang} profile={profile} />}
          {view === 'create-post' && <CreatePost setView={setView} user={user} lang={lang} />}
          {view === 'edit-profile' && <ProfileEditor setView={setView} profile={profile} lang={lang} />}
        </main>

        {/* Modals */}
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={() => setIsAdmin(true)}
          lang={lang}
        />
        <DeleteModal 
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          lang={lang}
        />

        <footer className="border-t border-zinc-100 dark:border-zinc-800 py-12 bg-zinc-50 dark:bg-zinc-900 mt-auto transition-colors">
          <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center font-sans">
            <p className="text-zinc-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} {profile.name || 'Portfolio'}. {t[lang as keyof typeof t].footerRights}
            </p>
            <div className="flex space-x-6 text-sm text-zinc-500 dark:text-zinc-400">
              <button onClick={() => setView('home')} className="hover:text-zinc-900 dark:hover:text-white">{t[lang as keyof typeof t].home}</button>
              <button onClick={() => setView('blog')} className="hover:text-zinc-900 dark:hover:text-white">{t[lang as keyof typeof t].blog}</button>
            </div>
          </div>
        </footer>
        
        <style>{`
          .font-serif { font-family: 'Playfair Display', serif; }
          .font-sans { font-family: 'Inter', sans-serif; }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
          .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
}
