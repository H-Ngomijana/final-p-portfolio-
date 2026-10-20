import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { requireAdminSession } from "@/lib/admin-auth.functions";
import { getPortfolioData, updatePortfolioData } from "@/lib/portfolio-store.server";
import { packageSchema } from "./packages-schema";

export const listPackages = createServerFn({ method: "GET" }).handler(async () => {
  const data = await getPortfolioData();
  return data.packages
    .filter((item) => item.published)
    .map(({ id, name, description, features, price, currency }) => ({
      id,
      name,
      description,
      features,
      price,
      currency,
    }));
});

export const adminDashboard = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async () => {
    const { packages, inquiries, projects, tools } = await getPortfolioData();
    return {
      packages,
      inquiries: [...inquiries].reverse().slice(0, 100),
      projects,
      tools,
    };
  });

export const savePackage = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((data) => packageSchema.parse(data))
  .handler(async ({ data }) =>
    updatePortfolioData((content) => {
      const now = new Date().toISOString();
      const { id, ...values } = data;
      const item = { ...values, id: id ?? randomUUID(), created_at: now };
      const index = content.packages.findIndex((entry) => entry.id === item.id);
      if (id && index === -1) throw new Error("Package could not be saved.");
      if (!id) content.packages.push(item);
      else {
        const existing = content.packages[index];
        if (!existing) throw new Error("Package could not be saved.");
        content.packages[index] = { ...existing, ...values };
      }
      return { id: item.id };
    }),
  );

export const deletePackage = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((data) => packageSchema.pick({ id: true }).required().parse(data))
  .handler(async ({ data }) => {
    await updatePortfolioData((content) => {
      content.packages = content.packages.filter((item) => item.id !== data.id);
      content.inquiries = content.inquiries.map((inquiry) =>
        inquiry.package_id === data.id ? { ...inquiry, package_id: null } : inquiry,
      );
    });
    return { success: true };
  });
