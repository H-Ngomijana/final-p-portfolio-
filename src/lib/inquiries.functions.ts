import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { requireAdminSession } from "@/lib/admin-auth.functions";
import { updatePortfolioData } from "@/lib/portfolio-store.server";
import { inquirySchema } from "./inquiry-schema";
import { z } from "zod";

export const deleteInquiry = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const deleted = await updatePortfolioData((content) => {
      const exists = content.inquiries.some((item) => item.id === data.id);
      if (!exists) return false;
      content.inquiries = content.inquiries.filter((item) => item.id !== data.id);
      return true;
    });
    if (!deleted) throw new Error("Message could not be found.");
    return { success: true };
  });

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((data) => inquirySchema.parse(data))
  .handler(async ({ data }) => {
    const now = Date.now();
    await updatePortfolioData((content) => {
      const recentSubmissions = content.inquiries.filter(
        (inquiry) =>
          inquiry.email.toLowerCase() === data.email.toLowerCase() &&
          now - new Date(inquiry.created_at).getTime() < 60 * 60 * 1000,
      ).length;
      if (recentSubmissions >= 3) {
        throw new Error("Please wait before sending another inquiry.");
      }

      content.inquiries.push({
        id: randomUUID(),
        name: data.name,
        email: data.email,
        company: data.company || (data.orderSubmission ? data.country : ""),
        message: [
          data.message,
          ...(data.orderSubmission
            ? [
                `Phone: ${data.phone || "Not provided"}`,
                `Country / region: ${data.country || "Not provided"}`,
                `Payment preference: ${
                  data.paymentOption === "once"
                    ? "One-time payment (10% estimate discount)"
                    : "Milestone payments"
                }`,
                "Project agreement: accepted",
              ]
            : []),
        ].join("\n\n"),
        package_id: data.packageId || null,
        package_name: data.packageName,
        created_at: new Date(now).toISOString(),
      });
    });
    return { success: true };
  });
