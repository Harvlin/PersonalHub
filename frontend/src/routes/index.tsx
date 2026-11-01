import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, CircleAlert, Inbox, Menu, Plus, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "../landing.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Personal Inkwell — Your work, without the noise" },
      { name: "description", content: "A calm personal operating system for projects, tasks, schedules, and relationships." },
    ],
  }),
  component: LandingPage,
});

const NAV = [
  ["Principle", "#principle"],
  ["Workflow", "#workflow"],
  ["System", "#system"],
  ["Craft", "#craft"],
] as const;

const TICKER = ["Projects", "Tasks", "Relationships", "Ideas", "Schedules", "Decisions", "Notes", "Rituals"];

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`lp-reveal ${shown ? "is-in" : ""} ${className}`} style={{ "--d": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

function Lines({ lines }: { lines: ReactNode[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span className="lp-line" key={i}>
          <span style={{ "--i": i } as CSSProperties}>{line}</span>
        </span>
      ))}
    </>
  );
}

function Eyebrow({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="lp-eyebrow">
      <i /> {children} <span>/ {n}</span>
    </p>
  );
}

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [capture, setCapture] = useState("");
  const [captured, setCaptured] = useState<string[]>([]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitCapture = (e: React.FormEvent) => {
    e.preventDefault();
    const value = capture.trim();
    if (!value) return;
    setCaptured((items) => [value, ...items].slice(0, 3));
    setCapture("");
  };

  return (
    <div className="lp">
      <div className="lp-progress" style={{ transform: `scaleX(${progress})` }} />
      <div className="lp-grain" aria-hidden />

      <header className={`lp-nav ${scrolled ? "is-scrolled" : ""}`}>
        <Link to="/" className="lp-brand">
          <span>
            Personal <em>Inkwell</em>
          </span>
        </Link>
        <nav className="lp-links" aria-label="Primary">
          {NAV.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="lp-nav-end">
          <span className="lp-status">
            <i /> Online
          </span>
          <Link to="/dashboard" className="lp-btn lp-btn-dark lp-btn-sm">
            Open hub <ArrowUpRight size={14} />
          </Link>
        </div>
        <button className="lp-burger" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {menuOpen ? (
        <nav className="lp-mobile" aria-label="Mobile">
          {NAV.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
            Open hub <ArrowUpRight size={18} />
          </Link>
        </nav>
      ) : null}

      <main>
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <Eyebrow n="01">A personal operating system</Eyebrow>
            <h1 className="lp-display">
              <Lines lines={["Your work,", <em key="e">without the noise.</em>]} />
            </h1>
            <Reveal delay={500}>
              <p className="lp-lede">
                Projects, tasks, relationships and schedules in one quiet workspace — designed to show you what needs a decision, not everything that exists.
              </p>
              <div className="lp-actions">
                <Link to="/dashboard" className="lp-btn lp-btn-dark">
                  Open Personal Inkwell <ArrowUpRight size={16} />
                </Link>
                <a href="#principle" className="lp-btn lp-btn-ghost">
                  See how it thinks
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={300} className="lp-stage-wrap">
            <div
              className="lp-stage"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
              }}
              onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            >
              <div className="lp-ring r1" />
              <div className="lp-ring r2" />
              <div className="lp-window" style={{ transform: `perspective(1200px) rotateY(${tilt.x * 5}deg) rotateX(${tilt.y * -4}deg)` }}>
                <div className="lp-win-top">
                  <span className="lp-window-brand">PERSONAL INKWELL</span>
                  <span className="lp-mono">Today · Mon 14</span>
                  <span className="lp-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
                <div className="lp-win-greet">
                  <span>Good morning, Harvlin.</span>
                  <b className="lp-mono">03 focus</b>
                </div>
                <div className="lp-alert">
                  <div>
                    <span className="lp-red lp-mono">
                      <CircleAlert size={12} /> Needs attention
                    </span>
                    <strong>2 items need a decision</strong>
                  </div>
                  <ArrowUpRight size={16} />
                </div>
                <ul className="lp-win-list">
                  {(
                    [
                      ["Build authentication flow", "09:00", true],
                      ["Physics assignment", "13:30", false],
                      ["Follow up with Alex", "16:00", false],
                    ] as const
                  ).map(([t, time, active]) => (
                    <li key={t}>
                      <span className={`lp-dot ${active ? "on" : ""}`} />
                      <span>{t}</span>
                      <b className="lp-mono">{time}</b>
                    </li>
                  ))}
                </ul>
                <div className="lp-win-foot lp-mono">
                  <span>
                    <Inbox size={12} /> 3 in inbox
                  </span>
                  <span>
                    <Check size={12} /> 4 clear
                  </span>
                </div>
              </div>
              <div className="lp-float f1 lp-mono" style={{ transform: `translate(${tilt.x * -10}px, ${tilt.y * -10}px)` }}>
                <i /> Only what matters now
              </div>
              <div className="lp-float f2 lp-mono" style={{ transform: `translate(${tilt.x * 12}px, ${tilt.y * 12}px)` }}>
                Built for one · 2026
              </div>
            </div>
          </Reveal>
        </section>

        <div className="lp-ticker" aria-hidden>
          <div className="lp-ticker-track">
            {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
              <span key={i}>
                {t} <i>✦</i>
              </span>
            ))}
          </div>
        </div>

        <section id="principle" className="lp-section">
          <Reveal>
            <Eyebrow n="02">The principle</Eyebrow>
            <h2 className="lp-h2">
              A system that knows what <em>deserves</em> your attention.
            </h2>
          </Reveal>
          <div className="lp-compare">
            <Reveal className="lp-panel lp-panel-noise">
              <div className="lp-panel-label lp-mono">
                Traditional tools <span>Too much signal</span>
              </div>
              <div className="lp-chips">
                {["17 tasks", "8 projects", "12 reminders", "6 contacts", "4 overdue"].map((c, i) => (
                  <b key={c} className={i === 4 ? "lp-red" : ""} style={{ "--r": `${(i % 3) - 1}deg` } as CSSProperties}>
                    {c}
                  </b>
                ))}
              </div>
              <div className="lp-bars">
                {Array.from({ length: 7 }).map((_, i) => (
                  <i key={i} style={{ width: `${40 + ((i * 17) % 55)}%` }} />
                ))}
              </div>
            </Reveal>
            <Reveal delay={150} className="lp-panel lp-panel-calm">
              <div className="lp-panel-label lp-mono">
                Personal Inkwell <span>Just enough</span>
              </div>
              <div className="lp-big">
                02<small>items need you</small>
              </div>
              <div className="lp-row">
                <span className="lp-dot on" /> Configure OAuth callback <CircleAlert size={14} className="lp-red" />
              </div>
              <div className="lp-row">
                <span className="lp-dot" /> Alex — project collaboration <em className="lp-mono">Ping</em>
              </div>
              <p className="lp-quiet">+ everything else, quietly held</p>
            </Reveal>
          </div>
        </section>

        <section id="workflow" className="lp-section lp-split">
          <Reveal>
            <Eyebrow n="03">The workflow</Eyebrow>
            <h2 className="lp-h2">
              Capture first. <em>Organize later.</em>
            </h2>
            <p className="lp-body">Ideas shouldn't require paperwork. Put the thought somewhere safe, then give it shape when you have the context.</p>
            <ol className="lp-steps">
              {["Capture", "Clarify", "Move forward"].map((s, i) => (
                <li key={s}>
                  <b className="lp-mono">0{i + 1}</b> {s}
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={150}>
            <form className="lp-card lp-capture" onSubmit={submitCapture}>
              <div className="lp-card-head lp-mono">
                <span>Inbox / Quick capture</span>
                <Inbox size={15} />
              </div>
              <label htmlFor="capture-input">What needs to leave your head?</label>
              <div className="lp-input">
                <input id="capture-input" value={capture} onChange={(e) => setCapture(e.target.value)} placeholder="Call the landlord about the lease…" autoComplete="off" />
                <button type="submit" aria-label="Capture">
                  <Plus size={16} />
                </button>
              </div>
              <ul className="lp-captured">
                {captured.length === 0 ? <li className="empty">Nothing captured yet. Try it.</li> : null}
                {captured.map((c, i) => (
                  <li key={`${c}-${i}`}>
                    <Check size={13} /> {c} <span className="lp-mono">Inbox</span>
                  </li>
                ))}
              </ul>
            </form>
          </Reveal>
        </section>

        <section id="system" className="lp-section">
          <Reveal>
            <Eyebrow n="04">The system</Eyebrow>
            <h2 className="lp-h2">
              Complex work, <em>broken into decisions.</em>
            </h2>
          </Reveal>
          <div className="lp-bento">
            <Reveal className="lp-card lp-b-main">
              <div className="lp-card-head lp-mono">
                <span>Software project</span>
                <span>04 milestones</span>
              </div>
              <h3>Personal Inkwell</h3>
              <div className="lp-track">
                {["Foundation", "Core workflow", "CRM", "Calendar"].map((m, i) => (
                  <span key={m} className={i === 0 ? "done" : i === 1 ? "cur" : ""}>
                    <b className="lp-mono">0{i + 1}</b>
                    {m}
                  </span>
                ))}
              </div>
              <div className="lp-row">
                <span className="lp-dot on" /> Implement email digest <em className="lp-mono lp-red">Blocked</em>
              </div>
            </Reveal>
            <Reveal delay={100} className="lp-card">
              <div className="lp-card-head lp-mono">
                <span>Lightweight</span>
              </div>
              <h3>CS Assignment</h3>
              <div className="lp-row"><Check size={14} /> Research topic</div>
              <div className="lp-row"><span className="lp-dot on" /> Write report</div>
              <div className="lp-row"><span className="lp-dot" /> Submit assignment</div>
            </Reveal>
            <Reveal delay={200} className="lp-card lp-b-dark">
              <div className="lp-card-head lp-mono">
                <span>Personal CRM</span>
              </div>
              <div className="lp-big">
                34<small>days since you spoke to Alex</small>
              </div>
              <Link to="/contacts" className="lp-link">
                Send a ping <ArrowUpRight size={14} />
              </Link>
            </Reveal>
            <Reveal delay={100} className="lp-card lp-b-phone">
              <div className="lp-card-head lp-mono">
                <span>Pocket-sized</span>
              </div>
              <h3>Capture anywhere. Check priorities in seconds.</h3>
            </Reveal>
          </div>
        </section>

        <section id="craft" className="lp-craft">
          <Reveal>
            <Eyebrow n="05">Built for one</Eyebrow>
            <h2 className="lp-h2 lp-center">
              Private by design. <em>Simple by architecture.</em>
            </h2>
            <div className="lp-stack lp-mono">
              {["Personal Inkwell", "TanStack Start", "Spring Boot", "PostgreSQL", "Docker"].map((s, i) => (
                <span key={s}>
                  {s}
                  {i < 4 ? <i>→</i> : null}
                </span>
              ))}
            </div>
            <p className="lp-body lp-center">
              A focused single-user architecture without multi-tenant complexity. Session-based authentication, automated backups, and environment-first configuration.
            </p>
          </Reveal>
        </section>

        <section className="lp-cta">
          <Reveal>
            <Eyebrow n="06">Make room</Eyebrow>
            <h2 className="lp-display lp-cta-title">
              Make space for <em>the work that matters.</em>
            </h2>
            <p className="lp-lede">Not more productivity. Less friction.</p>
            <Link to="/dashboard" className="lp-btn lp-btn-light">
              Open Personal Inkwell <ArrowUpRight size={16} />
            </Link>
          </Reveal>
        </section>
      </main>

      <footer className="lp-footer lp-mono">
        <span>Personal Inkwell © 2026</span>
        <span>TanStack Start × Spring Boot × PostgreSQL</span>
      </footer>
    </div>
  );
}
