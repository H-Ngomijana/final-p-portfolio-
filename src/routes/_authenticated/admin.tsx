import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState, type FormEvent } from "react";
import { Plus, Save, LogOut, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { adminDashboard, deletePackage, savePackage } from "@/lib/packages.functions";
import { deleteInquiry } from "@/lib/inquiries.functions";
import { packageSchema } from "@/lib/packages-schema";
import { logoutAdmin } from "@/lib/admin-auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminContentManager } from "@/components/admin-content-manager";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Studio management — Hugues B." },
      {
        name: "description",
        content: "Manage Hugues B. development packages and client inquiries.",
      },
      { property: "og:title", content: "Studio management — Hugues B." },
      {
        property: "og:description",
        content: "Private owner workspace for packages and inquiries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [tab, setTab] = useState<"packages" | "projects" | "tools" | "messages">("packages");
  const fetchDashboard = useServerFn(adminDashboard);
  const save = useServerFn(savePackage);
  const remove = useServerFn(deletePackage);
  const removeInquiry = useServerFn(deleteInquiry);
  const signOut = useServerFn(logoutAdmin);
  const client = useQueryClient();
  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: ["owner-dashboard"],
    queryFn: () => fetchDashboard(),
    retry: false,
    refetchInterval: 3_000,
  });
  const [edit, setEdit] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [messageOrder, setMessageOrder] = useState<"newest" | "oldest">("newest");
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const selected = data?.packages.find((item) => item.id === edit);
  const filteredInquiries = useMemo(() => {
    const query = messageSearch.trim().toLowerCase();
    const inquiries = (data?.inquiries ?? []).filter(
      (item) =>
        !query ||
        [item.name, item.email, item.company, item.message, item.package_name]
          .join(" ")
          .toLowerCase()
          .includes(query),
    );
    return inquiries.sort((a, b) => {
      const difference = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return messageOrder === "newest" ? -difference : difference;
    });
  }, [data?.inquiries, messageOrder, messageSearch]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = packageSchema.safeParse({
      id: edit === "new" ? undefined : edit,
      name: form.get("name"),
      description: form.get("description"),
      features: String(form.get("features"))
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean),
      price: Number(form.get("price")),
      currency: form.get("currency"),
      published: form.get("published") === "on",
    });
    if (!parsed.success) {
      setNotice("Enter a name, description, positive price and valid currency.");
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      await save({ data: parsed.data });
      await client.invalidateQueries({ queryKey: ["owner-dashboard"] });
      await client.invalidateQueries({ queryKey: ["public-packages"] });
      setEdit(null);
      setNotice("Package saved.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Could not save package.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    setNotice("");
    try {
      await signOut();
      client.clear();
      window.location.assign("/auth");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Could not sign out. Please try again.");
      setSigningOut(false);
    }
  }

  async function removePackage(id: string, name: string) {
    if (!window.confirm(`Delete package “${name}”?`)) return;
    setBusy(true);
    setNotice("");
    try {
      await remove({ data: { id } });
      await client.invalidateQueries({ queryKey: ["owner-dashboard"] });
      await client.invalidateQueries({ queryKey: ["public-packages"] });
      if (edit === id) setEdit(null);
      setNotice("Package deleted.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Package could not be deleted.");
    } finally {
      setBusy(false);
    }
  }

  async function removeMessage(id: string, name: string) {
    if (!window.confirm(`Delete the message from ${name}? This cannot be undone.`)) return;
    setDeletingMessageId(id);
    setNotice("");
    try {
      await removeInquiry({ data: { id } });
      await client.invalidateQueries({ queryKey: ["owner-dashboard"] });
      setNotice("Message deleted.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Message could not be deleted.");
    } finally {
      setDeletingMessageId(null);
    }
  }

  return (
    <main className="admin-page section-container">
      <header className="admin-header">
        <Link className="brand" to="/">
          Hugues B.
        </Link>
        <Button variant="ghost" disabled={signingOut} onClick={handleSignOut}>
          <LogOut />
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </header>
      <span className="eyebrow">Private studio</span>
      <h1 className="section-title">
        Your <em>workspace.</em>
      </h1>
      {isPending ? (
        <p>Opening your workspace…</p>
      ) : error ? (
        <p role="alert">{error.message}</p>
      ) : (
        <>
          <div className="admin-toolbar">
            <div className="admin-tabs" role="group" aria-label="Workspace sections">
              <Button
                id="admin-tab-packages"
                aria-pressed={tab === "packages"}
                variant={tab === "packages" ? "default" : "ghost"}
                onClick={() => setTab("packages")}
              >
                Packages
              </Button>
              <Button
                id="admin-tab-projects"
                aria-pressed={tab === "projects"}
                variant={tab === "projects" ? "default" : "ghost"}
                onClick={() => setTab("projects")}
              >
                Projects
              </Button>
              <Button
                id="admin-tab-tools"
                aria-pressed={tab === "tools"}
                variant={tab === "tools" ? "default" : "ghost"}
                onClick={() => setTab("tools")}
              >
                Tools
              </Button>
              <Button
                id="admin-tab-messages"
                aria-pressed={tab === "messages"}
                variant={tab === "messages" ? "default" : "ghost"}
                onClick={() => setTab("messages")}
              >
                Messages ({data?.inquiries.length ?? 0})
              </Button>
            </div>
            <Button variant="outline" disabled={isFetching} onClick={() => refetch()}>
              <RefreshCw className={isFetching ? "animate-spin" : ""} />
              {isFetching ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
          {tab === "packages" ? (
            <section id="admin-panel-packages" role="region" aria-labelledby="admin-tab-packages">
              <Button
                onClick={() => {
                  setEdit("new");
                  setNotice("");
                }}
              >
                <Plus />
                New package
              </Button>
              {edit && (
                <form key={edit} className="inquiry-form admin-form" onSubmit={submit}>
                  <label>
                    Package name
                    <Input
                      name="name"
                      required
                      minLength={2}
                      maxLength={100}
                      defaultValue={selected?.name}
                    />
                  </label>
                  <label>
                    Description
                    <Textarea
                      name="description"
                      required
                      minLength={10}
                      maxLength={2000}
                      defaultValue={selected?.description}
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Price
                      <Input
                        name="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        max="9999999999"
                        required
                        defaultValue={selected?.price}
                      />
                    </label>
                    <label>
                      Currency
                      <select name="currency" defaultValue={selected?.currency ?? "RWF"}>
                        <option value="RWF">RWF</option>
                        <option value="USD">USD</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Included features — one per line
                    <Textarea
                      name="features"
                      maxLength={3000}
                      defaultValue={selected?.features.join("\n")}
                    />
                  </label>
                  <label className="admin-checkbox">
                    <input type="checkbox" name="published" defaultChecked={selected?.published} />
                    Publish package
                  </label>
                  <div className="flex gap-3">
                    <Button disabled={busy} type="submit">
                      <Save />
                      {busy ? "Saving…" : "Save package"}
                    </Button>
                    <Button variant="ghost" onClick={() => setEdit(null)} type="button">
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
              <div className="admin-list">
                {data?.packages.map((item) => (
                  <article key={item.id}>
                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        {item.currency} {Number(item.price).toLocaleString()} ·{" "}
                        {item.published ? "Published" : "Draft"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setEdit(item.id)}>
                        <Pencil />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={busy}
                        aria-label={`Delete ${item.name}`}
                        onClick={() => void removePackage(item.id, item.name)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </article>
                ))}
                {!data?.packages.length && (
                  <p>No packages yet. Create one to make it available for project inquiries.</p>
                )}
              </div>
            </section>
          ) : tab === "projects" || tab === "tools" ? (
            <section id={`admin-panel-${tab}`} role="region" aria-labelledby={`admin-tab-${tab}`}>
              <AdminContentManager
                kind={tab === "projects" ? "project" : "tool"}
                projects={data?.projects ?? []}
                tools={data?.tools ?? []}
                onRefresh={() => refetch()}
              />
            </section>
          ) : (
            <section id="admin-panel-messages" role="region" aria-labelledby="admin-tab-messages">
              <div className="admin-message-tools">
                <label htmlFor="admin-message-search">Search messages</label>
                <Input
                  id="admin-message-search"
                  type="search"
                  placeholder="Name, email, company, package, or message"
                  value={messageSearch}
                  onChange={(event) => setMessageSearch(event.target.value)}
                />
                <label htmlFor="admin-message-order">Order messages</label>
                <select
                  id="admin-message-order"
                  className="admin-select"
                  value={messageOrder}
                  onChange={(event) =>
                    setMessageOrder(event.target.value === "oldest" ? "oldest" : "newest")
                  }
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
                <p role="status">
                  Showing {filteredInquiries.length} of {data?.inquiries.length ?? 0}
                  messages
                  {(data?.inquiries.length ?? 0) === 100 ? " (latest 100)" : ""}
                  {" · Updates every 3 seconds while this tab is open"}
                </p>
              </div>
              <div className="admin-list">
                {filteredInquiries.map((item) => (
                  <article className="admin-message" key={item.id}>
                    <div className="admin-message-heading">
                      <span className="eyebrow">
                        {new Date(item.created_at).toLocaleString()}
                        {item.package_name && ` / ${item.package_name}`}
                      </span>
                      <Button
                        variant="ghost"
                        disabled={deletingMessageId === item.id}
                        aria-label={`Delete message from ${item.name}`}
                        onClick={() => void removeMessage(item.id, item.name)}
                      >
                        <Trash2 />
                        {deletingMessageId === item.id ? "Deleting…" : "Delete"}
                      </Button>
                    </div>
                    <h3>{item.name}</h3>
                    <p>{item.email}</p>
                    {item.company && <p>{item.company}</p>}
                    <p className="whitespace-pre-wrap">{item.message}</p>
                  </article>
                ))}
                {!filteredInquiries.length && (
                  <p>{messageSearch ? "No messages match your search." : "No messages yet."}</p>
                )}
              </div>
            </section>
          )}
        </>
      )}
      {notice && (
        <p role="status" aria-live="polite">
          {notice}
        </p>
      )}
    </main>
  );
}
