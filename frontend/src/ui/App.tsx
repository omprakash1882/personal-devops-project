import { useEffect, useMemo, useState } from "react";

type Project = {
  id: string;
  name: string;
  description: string;
  tags: string;
  createdAt: string;
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8081";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

export function App() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const canSend = useMemo(() => {
    return contactName.trim().length > 0 && contactEmail.trim().length > 0 && contactMessage.trim().length > 0;
  }, [contactName, contactEmail, contactMessage]);

  useEffect(() => {
    let cancelled = false;
    apiGet<{ projects: Project[] }>("/api/projects")
      .then((data) => {
        if (cancelled) return;
        setProjects(data.projects);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setProjectsError(e instanceof Error ? e.message : "Failed to load projects");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmitContact(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setContactStatus("sending");
    try {
      await apiPost<{ id: string }>("/api/contact", {
        name: contactName,
        email: contactEmail,
        message: contactMessage
      });
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      setContactStatus("sent");
      window.setTimeout(() => setContactStatus("idle"), 2500);
    } catch {
      setContactStatus("error");
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">
            <div className="brand__dot" />
            <div>
              <div className="brand__title">Personal Project</div>
              <div className="brand__subtitle">Full-stack site for DevOps practice</div>
            </div>
          </div>
          <nav className="nav">
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h1>Build, ship, observe.</h1>
          <p>
            Use this repo to practice Docker, CI/CD, migrations, health checks, and deployments with a real full-stack
            app.
          </p>
          <div className="hero__row">
            <a className="button" href="#projects">
              View projects
            </a>
            <a className="button button--ghost" href={`${API_BASE}/healthz`} target="_blank" rel="noreferrer">
              API health
            </a>
          </div>
        </section>

        <section id="projects" className="section">
          <div className="section__header">
            <h2>Projects</h2>
            <div className="muted">Loaded from MySQL via the backend API</div>
          </div>

          {projectsError ? <div className="card card--error">{projectsError}</div> : null}

          {projects ? (
            <div className="grid">
              {projects.map((p) => (
                <article key={p.id} className="card">
                  <div className="card__title">{p.name}</div>
                  <div className="card__body">{p.description}</div>
                  <div className="pillRow">
                    {p.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .slice(0, 6)
                      .map((t) => (
                        <span key={t} className="pill">
                          {t}
                        </span>
                      ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="card">Loading…</div>
          )}
        </section>

        <section id="contact" className="section">
          <div className="section__header">
            <h2>Contact</h2>
            <div className="muted">Writes to MySQL via `POST /api/contact`</div>
          </div>

          <form className="card form" onSubmit={onSubmitContact}>
            <label className="label">
              Name
              <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your name" />
            </label>
            <label className="label">
              Email
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
              />
            </label>
            <label className="label">
              Message
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="What would you like to build?"
                rows={5}
              />
            </label>

            <div className="form__row">
              <button className="button" type="submit" disabled={!canSend || contactStatus === "sending"}>
                {contactStatus === "sending" ? "Sending…" : "Send"}
              </button>
              {contactStatus === "sent" ? <span className="ok">Sent</span> : null}
              {contactStatus === "error" ? <span className="error">Failed</span> : null}
            </div>
          </form>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <span className="muted">
            Tip: practice CI with build + test, then deploy using containers.
          </span>
        </div>
      </footer>
    </div>
  );
}

