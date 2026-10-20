import { randomUUID } from "node:crypto";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import { fallbackPackages } from "./package-catalog";
import type { PortfolioProject, PortfolioTool } from "./portfolio-content";

export type StoredPackage = {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  currency: "RWF" | "USD";
  published: boolean;
  created_at: string;
};

export type StoredInquiry = {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  package_id: string | null;
  package_name: string;
  created_at: string;
};

type StoredProject = PortfolioProject & { created_at: string };
type StoredTool = PortfolioTool & { created_at: string };
type PortfolioData = {
  packages: StoredPackage[];
  inquiries: StoredInquiry[];
  projects: StoredProject[];
  tools: StoredTool[];
};
type PortfolioDatabase = ReturnType<typeof postgres>;

const timestamp = "2026-01-01T00:00:00.000Z";

function createInitialData(): PortfolioData {
  const projects: Omit<StoredProject, "created_at">[] = [
    {
      id: randomUUID(),
      title: "Arena X",
      category: "Esports platform",
      image_url: "/projects/arena-x.png",
      alt: "Arena X esports platform interface",
      tags: ["React", "Competition UX", "Platform"],
      description:
        "A competitive esports platform for matches, teams, discovery, and online tournament energy.",
      details:
        "Arena X focuses on high-intensity navigation, clear player journeys, and a digital product feel built for gaming communities that need action, trust, and speed.",
      href: "https://arena-x-esport-platform.vercel.app/",
      published: true,
    },
    {
      id: randomUUID(),
      title: "Les Arsene",
      category: "Brand website",
      image_url: "/projects/les-arsene.png",
      alt: "Les Arsene website preview",
      tags: ["Website", "Brand system", "Responsive"],
      description:
        "A polished public website shaped around brand presence, clarity, and fast browsing.",
      details:
        "The experience balances an elegant visual rhythm with practical content structure so visitors can understand the brand quickly and move through the site without friction.",
      href: "http://lesarsene.rw/",
      published: true,
    },
    {
      id: randomUUID(),
      title: "CJ Flix",
      category: "Streaming experience",
      image_url: "/projects/cj-flix.png",
      alt: "CJ Flix streaming platform preview",
      tags: ["Entertainment", "Catalog UX", "Netlify"],
      description:
        "A streaming-style interface designed for browsing media with a clean and cinematic feel.",
      details:
        "CJ Flix uses familiar media patterns, strong hierarchy, and fast content scanning to make the platform feel natural for viewers from the first click.",
      href: "https://cj-flix.netlify.app/",
      published: true,
    },
    {
      id: randomUUID(),
      title: "Micorp",
      category: "Business platform",
      image_url: "/projects/micorp.png",
      alt: "Micorp professional platform preview",
      tags: ["Corporate UX", "Web app", "Conversion"],
      description:
        "A professional business platform with sharp presentation and direct service discovery.",
      details:
        "Micorp is built around credibility: focused pages, confident calls to action, and a layout that supports both exploration and conversion.",
      href: "https://micorp.pro/",
      published: true,
    },
  ];
  const toolSeeds = [
    ["JavaScript", "Language", "interactive product logic", "javascript"],
    ["TypeScript", "Language", "stable scalable code", "typescript"],
    ["React", "Frontend", "smooth app interfaces", "react"],
    ["HTML5", "Markup", "accessible structure", "html5"],
    ["CSS", "Styling", "responsive systems", "css"],
    ["Python", "Language", "automation and APIs", "python"],
    ["Node.js", "Runtime", "server workflows", "nodedotjs"],
    ["Docker", "DevOps", "containers and delivery", "docker"],
    ["Tailwind CSS", "Styling", "design implementation", "tailwindcss"],
    ["Git", "Version control", "clean collaboration", "git"],
    ["Figma", "Design", "interface planning", "figma"],
    ["NestJS", "Backend", "structured server applications", "nestjs"],
  ] as const;
  const tools: Omit<StoredTool, "created_at">[] = toolSeeds.map(
    ([name, role, note, icon_slug]) => ({
      id: randomUUID(),
      name,
      role,
      note,
      icon_slug,
      published: true,
    }),
  );

  return {
    packages: fallbackPackages.map((item) => ({
      ...item,
      id: randomUUID(),
      currency: item.currency as StoredPackage["currency"],
      published: true,
      created_at: timestamp,
    })),
    inquiries: [],
    projects: projects.map((item) => ({ ...item, created_at: timestamp })),
    tools: tools.map((item) => ({ ...item, created_at: timestamp })),
  };
}

function getDataDirectory() {
  return path.resolve(process.env["PORTFOLIO_DATA_DIR"] || path.join(process.cwd(), "data"));
}

let initializeDataFile: Promise<void> | undefined;
let database: PortfolioDatabase | undefined;
let initializeDatabase: Promise<void> | undefined;

function getDatabase(): PortfolioDatabase | undefined {
  const connectionString = process.env["DATABASE_URL"] || process.env["POSTGRES_URL"];
  if (!connectionString) {
    if (process.env["NODE_ENV"] === "production") {
      throw new Error("Set DATABASE_URL to a persistent PostgreSQL database before deployment.");
    }
    return undefined;
  }
  database ??= postgres(connectionString, { max: 5, connect_timeout: 10 });
  return database;
}

async function ensureDatabase(database: PortfolioDatabase) {
  if (!initializeDatabase) {
    initializeDatabase = (async () => {
      await database`
        CREATE TABLE IF NOT EXISTS portfolio_content_store (
          id smallint PRIMARY KEY CHECK (id = 1),
          content jsonb NOT NULL
        )
      `;
      await database`
        CREATE TABLE IF NOT EXISTS portfolio_uploads (
          id uuid PRIMARY KEY,
          content_type text NOT NULL CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp')),
          content bytea NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await database`
        INSERT INTO portfolio_content_store (id, content)
        VALUES (1, ${database.json(createInitialData())})
        ON CONFLICT (id) DO NOTHING
      `;
    })().catch((error: unknown) => {
      initializeDatabase = undefined;
      throw new Error("The shared portfolio database could not be initialized.", { cause: error });
    });
  }
  await initializeDatabase;
}

async function ensureDataFile(directory: string, filePath: string) {
  if (!initializeDataFile) {
    initializeDataFile = (async () => {
      await mkdir(directory, { recursive: true });
      try {
        await access(filePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        await writeFile(filePath, JSON.stringify(createInitialData(), null, 2), {
          flag: "wx",
        }).catch(async (writeError: NodeJS.ErrnoException) => {
          if (writeError.code !== "EEXIST") throw writeError;
        });
      }
    })();
  }
  await initializeDataFile;
}

async function readData(): Promise<PortfolioData> {
  const database = getDatabase();
  if (database) {
    await ensureDatabase(database);
    const [row] = await database<{ content: PortfolioData }[]>`
      SELECT content FROM portfolio_content_store WHERE id = 1
    `;
    if (!row) throw new Error("The shared portfolio data record is missing.");
    return row.content;
  }

  const directory = getDataDirectory();
  const filePath = path.join(directory, "portfolio-content.json");
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as PortfolioData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT")
      throw new Error("Portfolio data could not be read.", { cause: error });
    await ensureDataFile(directory, filePath);
    try {
      return JSON.parse(await readFile(filePath, "utf8")) as PortfolioData;
    } catch (readError) {
      throw new Error("Portfolio data could not be read.", { cause: readError });
    }
  }
}

let writeQueue: Promise<void> = Promise.resolve();

async function writeData(data: PortfolioData) {
  const directory = getDataDirectory();
  await mkdir(directory, { recursive: true });
  const filePath = path.join(directory, "portfolio-content.json");
  const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(data, null, 2), "utf8");
  await rename(temporaryPath, filePath);
}

export async function updatePortfolioData<T>(
  update: (data: PortfolioData) => T | Promise<T>,
): Promise<T> {
  const database = getDatabase();
  if (database) {
    await ensureDatabase(database);
    return database.begin(async (transaction) => {
      const [row] = await transaction<{ content: PortfolioData }[]>`
        SELECT content FROM portfolio_content_store WHERE id = 1 FOR UPDATE
      `;
      if (!row) throw new Error("The shared portfolio data record is missing.");
      const result = await update(row.content);
      await transaction`
        UPDATE portfolio_content_store
        SET content = ${transaction.json(row.content)}
        WHERE id = 1
      `;
      return result;
    });
  }

  const operation = writeQueue.then(async () => {
    const data = await readData();
    const result = await update(data);
    await writeData(data);
    return result;
  });
  writeQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

export async function getPortfolioData() {
  await writeQueue;
  return readData();
}

export async function savePortfolioUpload(
  bytes: Buffer,
  extension: string,
  contentType: "image/jpeg" | "image/png" | "image/webp",
) {
  const database = getDatabase();
  if (database) {
    await ensureDatabase(database);
    const id = randomUUID();
    await database`
      INSERT INTO portfolio_uploads (id, content_type, content)
      VALUES (${id}, ${contentType}, ${bytes})
    `;
    return `/api/uploads/${id}.${extension}`;
  }

  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(directory, filename), bytes, { flag: "wx" });
  return `/uploads/${filename}`;
}

export async function getPortfolioUpload(id: string) {
  const database = getDatabase();
  if (!database) return null;
  await ensureDatabase(database);
  const [upload] = await database<{ content_type: string; content: Buffer }[]>`
    SELECT content_type, content FROM portfolio_uploads WHERE id = ${id}
  `;
  return upload ?? null;
}
