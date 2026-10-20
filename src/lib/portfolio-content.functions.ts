import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { requireAdminSession } from "@/lib/admin-auth.functions";
import {
  getPortfolioData,
  savePortfolioUpload,
  updatePortfolioData,
} from "@/lib/portfolio-store.server";
import {
  deletePortfolioContentSchema,
  portfolioImageSchema,
  portfolioProjectSchema,
  portfolioToolSchema,
} from "./portfolio-content";

export const listPortfolioContent = createServerFn({ method: "GET" }).handler(async () => {
  const data = await getPortfolioData();
  return {
    projects: data.projects.filter((item) => item.published),
    tools: data.tools.filter((item) => item.published),
  };
});

export const savePortfolioProject = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((data) => portfolioProjectSchema.parse(data))
  .handler(async ({ data }) =>
    updatePortfolioData((content) => {
      const now = new Date().toISOString();
      const { id, ...values } = data;
      const project = { ...values, id: id ?? randomUUID(), created_at: now };
      const index = content.projects.findIndex((item) => item.id === project.id);
      if (id && index === -1) throw new Error("Project could not be saved.");
      if (!id) content.projects.push(project);
      else {
        const existing = content.projects[index];
        if (!existing) throw new Error("Project could not be saved.");
        content.projects[index] = { ...existing, ...values };
      }
      return { id: project.id };
    }),
  );

export const savePortfolioTool = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((data) => portfolioToolSchema.parse(data))
  .handler(async ({ data }) =>
    updatePortfolioData((content) => {
      const now = new Date().toISOString();
      const { id, ...values } = data;
      const tool = { ...values, id: id ?? randomUUID(), created_at: now };
      const index = content.tools.findIndex((item) => item.id === tool.id);
      if (id && index === -1) throw new Error("Tool could not be saved.");
      if (!id) content.tools.push(tool);
      else {
        const existing = content.tools[index];
        if (!existing) throw new Error("Tool could not be saved.");
        content.tools[index] = { ...existing, ...values };
      }
      return { id: tool.id };
    }),
  );

export const deletePortfolioContent = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((data) => deletePortfolioContentSchema.parse(data))
  .handler(async ({ data }) => {
    await updatePortfolioData((content) => {
      if (data.kind === "project") {
        content.projects = content.projects.filter((item) => item.id !== data.id);
      } else {
        content.tools = content.tools.filter((item) => item.id !== data.id);
      }
    });
    return { success: true };
  });

export const uploadPortfolioImage = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((data) => portfolioImageSchema.parse(data))
  .handler(async ({ data }) => {
    const bytes = Buffer.from(data.base64, "base64");
    if (bytes.byteLength > 5 * 1024 * 1024) throw new Error("Choose an image smaller than 5 MB.");
    const validSignature =
      (data.contentType === "image/jpeg" &&
        bytes[0] === 0xff &&
        bytes[1] === 0xd8 &&
        bytes[2] === 0xff) ||
      (data.contentType === "image/png" &&
        bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
      (data.contentType === "image/webp" &&
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP");
    if (!validSignature)
      throw new Error("The image file is invalid or uses an unsupported format.");

    const extension =
      data.contentType === "image/jpeg" ? "jpg" : data.contentType === "image/png" ? "png" : "webp";
    return { imageUrl: await savePortfolioUpload(bytes, extension, data.contentType) };
  });
