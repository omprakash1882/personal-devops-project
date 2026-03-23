import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { getPool, initSchema, insertContactMessage, listProjects, seedIfEmpty } from "./db.js";

const app = express();

const port = Number(process.env.PORT ?? 8080);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";

app.use(
  cors({
    origin: webOrigin
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));

app.get("/readyz", async (_req, res) => {
  try {
    const pool = getPool();
    await pool.execute("SELECT 1");
    res.status(200).json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

app.get("/api/projects", async (_req, res) => {
  const projects = await listProjects();
  res.json({ projects });
});

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  message: z.string().min(1).max(2000)
});

app.post("/api/contact", async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const id = await insertContactMessage(parsed.data.name, parsed.data.email, parsed.data.message);
  res.status(201).json({ id });
});

async function main() {
  await initSchema();
  await seedIfEmpty();

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`backend listening on :${port} (MySQL via mysql2)`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
