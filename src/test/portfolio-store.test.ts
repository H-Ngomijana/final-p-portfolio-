import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getPortfolioData, updatePortfolioData } from "@/lib/portfolio-store.server";

describe("local portfolio store", () => {
  const previousDataDirectory = process.env["PORTFOLIO_DATA_DIR"];
  let dataDirectory: string;

  beforeEach(async () => {
    dataDirectory = await mkdtemp(path.join(tmpdir(), "portfolio-store-"));
    process.env["PORTFOLIO_DATA_DIR"] = dataDirectory;
  });

  afterEach(async () => {
    if (previousDataDirectory === undefined) delete process.env["PORTFOLIO_DATA_DIR"];
    else process.env["PORTFOLIO_DATA_DIR"] = previousDataDirectory;
    await rm(dataDirectory, { recursive: true, force: true });
  });

  it("seeds the current content and persists admin changes", async () => {
    const initial = await Promise.all([getPortfolioData(), getPortfolioData()]);
    expect(initial[0]?.projects.map((item) => item.id)).toEqual(
      initial[1]?.projects.map((item) => item.id),
    );
    expect(initial[0]?.projects).toHaveLength(4);
    expect(initial[0]?.tools).toHaveLength(12);
    expect(initial[0]?.packages).toHaveLength(3);

    const project = initial[0]?.projects[0];
    expect(project).toBeDefined();
    await updatePortfolioData((data) => {
      const target = data.projects.find((item) => item.id === project?.id);
      if (!target) throw new Error("Seed project was not found.");
      target.published = false;
    });

    const saved = await getPortfolioData();
    expect(saved.projects.find((item) => item.id === project?.id)?.published).toBe(false);
  });
});
