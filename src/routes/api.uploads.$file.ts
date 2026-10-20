import { createFileRoute } from "@tanstack/react-router";
import { getPortfolioUpload } from "@/lib/portfolio-store.server";

export const Route = createFileRoute("/api/uploads/$file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const match = /^([0-9a-f-]{36})\.(jpg|png|webp)$/i.exec(params.file);
        if (!match?.[1]) return new Response("Not found", { status: 404 });

        const upload = await getPortfolioUpload(match[1]);
        if (!upload) return new Response("Not found", { status: 404 });
        return new Response(upload.content, {
          headers: {
            "Content-Type": upload.content_type,
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
