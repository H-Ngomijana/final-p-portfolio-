import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Code2, ExternalLink, Layers, PenTool } from "lucide-react";
import {
  siCss,
  siDocker,
  siFigma,
  siGit,
  siHtml5,
  siJavascript,
  siNestjs,
  siNodedotjs,
  siPython,
  siReact,
  siTailwindcss,
  siTypescript,
} from "simple-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { listPortfolioContent } from "@/lib/portfolio-content.functions";
import type { PortfolioProject, PortfolioTool } from "@/lib/portfolio-content";

const fallbackProjects: PortfolioProject[] = [
  {
    id: "fallback-arena-x",
    title: "Arena X",
    category: "Esports platform",
    image_url: "/projects/arena-x.png",
    alt: "Arena X esport platform interface",
    tags: ["React", "Competition UX", "Platform"],
    description:
      "A competitive esports platform for matches, teams, discovery, and online tournament energy.",
    details:
      "Arena X focuses on high-intensity navigation, clear player journeys, and a digital product feel built for gaming communities that need action, trust, and speed.",
    href: "https://arena-x-esport-platform.vercel.app/",
    published: true,
  },
  {
    id: "fallback-les-arsene",
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
    id: "fallback-cj-flix",
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
    id: "fallback-micorp",
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

const fallbackTools: PortfolioTool[] = [
  {
    id: "fallback-javascript",
    name: "JavaScript",
    role: "Language",
    note: "interactive product logic",
    icon_slug: siJavascript.slug,
    published: true,
  },
  {
    id: "fallback-typescript",
    name: "TypeScript",
    role: "Language",
    note: "stable scalable code",
    icon_slug: siTypescript.slug,
    published: true,
  },
  {
    id: "fallback-react",
    name: "React",
    role: "Frontend",
    note: "smooth app interfaces",
    icon_slug: siReact.slug,
    published: true,
  },
  {
    id: "fallback-html5",
    name: "HTML5",
    role: "Markup",
    note: "accessible structure",
    icon_slug: siHtml5.slug,
    published: true,
  },
  {
    id: "fallback-css",
    name: "CSS",
    role: "Styling",
    note: "responsive systems",
    icon_slug: siCss.slug,
    published: true,
  },
  {
    id: "fallback-python",
    name: "Python",
    role: "Language",
    note: "automation and APIs",
    icon_slug: siPython.slug,
    published: true,
  },
  {
    id: "fallback-node",
    name: "Node.js",
    role: "Runtime",
    note: "server workflows",
    icon_slug: siNodedotjs.slug,
    published: true,
  },
  {
    id: "fallback-docker",
    name: "Docker",
    role: "DevOps",
    note: "containers and delivery",
    icon_slug: siDocker.slug,
    published: true,
  },
  {
    id: "fallback-tailwind",
    name: "Tailwind CSS",
    role: "Styling",
    note: "design implementation",
    icon_slug: siTailwindcss.slug,
    published: true,
  },
  {
    id: "fallback-git",
    name: "Git",
    role: "Version control",
    note: "clean collaboration",
    icon_slug: siGit.slug,
    published: true,
  },
  {
    id: "fallback-figma",
    name: "Figma",
    role: "Design",
    note: "interface planning",
    icon_slug: siFigma.slug,
    published: true,
  },
  {
    id: "fallback-nestjs",
    name: "NestJS",
    role: "Backend",
    note: "structured server applications",
    icon_slug: siNestjs.slug,
    published: true,
  },
];

const technologyIcons = [
  siCss,
  siDocker,
  siFigma,
  siGit,
  siHtml5,
  siJavascript,
  siNestjs,
  siNodedotjs,
  siPython,
  siReact,
  siTailwindcss,
  siTypescript,
];
const technologyIconBySlug = new Map(technologyIcons.map((icon) => [icon.slug, icon]));

const articles = [
  {
    title: "Motion should mean something.",
    category: "Interaction",
    time: "3 min read",
    body: [
      "The best transitions do more than decorate a screen. They explain what changed, where the user is going, and how one moment relates to the next.",
      "Start with the purpose of the movement. A navigation shift can make room for content. A reveal can establish hierarchy. A gentle image transition can connect two states without interrupting reading.",
      "Restraint is part of the craft. Keep motion brief, avoid moving reading text continuously, and always offer the same clear experience when reduced motion is enabled.",
    ],
  },
  {
    title: "From a good interface to a memorable one.",
    category: "Design",
    time: "4 min read",
    body: [
      "A memorable interface is built on a useful foundation: clear structure, legible typography, and interactions that behave as expected.",
      "Then comes character. A distinctive type pairing, an intentional image crop, or a carefully chosen material can create identity without sacrificing usability.",
      "The test is simple: remove the decoration. If the page is still easy to understand and use, the visual layer can elevate it instead of hiding its weaknesses.",
    ],
  },
];

export function PersonalAbout() {
  const videoFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = videoFrameRef.current;
    if (!frame) return;

    const video = frame.querySelector("video");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) video?.pause();

    let frameRequest = 0;
    const updateFade = () => {
      frameRequest = 0;
      const fadeDistance = window.innerHeight * 0.42;
      const fadeStart = -window.innerHeight * 0.08;
      const fade = Math.max(
        0,
        Math.min(1, (fadeStart - frame.getBoundingClientRect().top) / fadeDistance),
      );
      frame.style.setProperty("--about-video-opacity", String(1 - fade));
      frame.style.setProperty("--about-video-offset", `${fade * 18}px`);
      frame.style.setProperty("--about-video-scale", String(1 - fade * 0.025));
      frame.style.setProperty("--about-video-blur", `${fade * 3}px`);
    };
    const scheduleFade = () => {
      if (!frameRequest) frameRequest = window.requestAnimationFrame(updateFade);
    };

    if (!reduceMotion.matches) {
      scheduleFade();
      window.addEventListener("scroll", scheduleFade, { passive: true });
      window.addEventListener("resize", scheduleFade);
    }

    return () => {
      if (frameRequest) window.cancelAnimationFrame(frameRequest);
      window.removeEventListener("scroll", scheduleFade);
      window.removeEventListener("resize", scheduleFade);
    };
  }, []);

  return (
    <section id="about" className="personal-about section-container">
      <div className="section-heading reveal">
        <span className="eyebrow">The person behind the pixels / 01</span>
        <span className="section-index">About Hugues B.</span>
      </div>
      <div className="about-grid">
        <div className="about-video-frame reveal" ref={videoFrameRef}>
          <video
            className="about-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src="/videos/coding-process.mp4" type="video/mp4" />
          </video>
          <span className="about-video-label" aria-hidden="true">
            Studio / In progress
          </span>
          <span className="about-video-index" aria-hidden="true">
            01 — Craft
          </span>
        </div>
        <div className="about-text reveal">
          <p className="editorial-copy">
            I design and develop websites, dashboards, and product experiences with clarity, speed,
            and presence.
          </p>
          <p>
            My work sits where visual taste meets useful engineering: structured flows, clean
            interfaces, and smooth details that make a platform feel alive without becoming hard to
            use.
          </p>
          <div className="capability-list">
            <span>
              <PenTool />
              Interface and brand direction
            </span>
            <span>
              <Code2 />
              Frontend and platform development
            </span>
            <span>
              <Layers />
              Launch-ready product systems
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PersonalPortfolio() {
  const fetchContent = useServerFn(listPortfolioContent);
  const {
    data: content,
    isError,
    isPending,
  } = useQuery({
    queryKey: ["public-portfolio-content"],
    queryFn: () => fetchContent(),
    refetchInterval: 3_000,
  });
  const projects = isError || isPending ? fallbackProjects : (content?.projects ?? []);
  const technologies = isError || isPending ? fallbackTools : (content?.tools ?? []);
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [article, setArticle] = useState<(typeof articles)[number] | null>(null);

  return (
    <>
      <section id="projects" className="projects-section portfolio-band">
        <div className="section-container">
          <div className="section-heading reveal">
            <span className="eyebrow">Selected work / 02</span>
            <span className="section-index">Featured projects</span>
          </div>
          <div className="portfolio-heading reveal">
            <h2 className="section-title">
              Featured <em>Projects.</em>
            </h2>
            <p>
              Professional builds with live destinations.
              <br />
              Websites, platforms, and product systems.
            </p>
          </div>
          <div className="project-grid">
            {projects.map((item, i) => (
              <article className="project-item reveal" key={item.title}>
                <Button
                  variant="ghost"
                  className="project-image-button"
                  onClick={() => setProject(item)}
                  aria-label={`View ${item.title}`}
                >
                  <img
                    src={item.image_url}
                    alt={item.alt}
                    loading="lazy"
                    width={1200}
                    height={912}
                  />
                  <span className="project-open">
                    <ArrowUpRight />
                  </span>
                  <span className="project-number">0{i + 1}</span>
                </Button>
                <div className="project-meta">
                  <div className="min-w-0">
                    <span className="eyebrow">{item.category}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Read about ${item.title}`}
                    onClick={() => setProject(item)}
                  >
                    <ArrowUpRight />
                  </Button>
                </div>
                <div className="project-tags">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <Button variant="outline" className="project-live" asChild>
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    View live
                    <ExternalLink />
                  </a>
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="skills-section section-container">
        <div className="section-heading reveal">
          <span className="eyebrow">Elite stack / 03</span>
          <span className="section-index">Languages and tools</span>
        </div>
        <div className="portfolio-heading stack-heading reveal">
          <span className="eyebrow stack-kicker">Our tech stack</span>
          <h2 className="section-title">Engineered with next-gen tools.</h2>
          <p>
            Purposeful technologies, revealed as you explore.
            <br />
            Each one helps bring a better digital product to life.
          </p>
        </div>
        <div className="stack-grid" aria-label="Technology stack">
          {technologies.map((tool, index) => {
            const icon = technologyIconBySlug.get(tool.icon_slug);
            return (
              <article key={tool.id} className="stack-card reveal" data-reveal-index={index}>
                {icon && (
                  <svg viewBox="0 0 24 24" role="img" aria-label={icon.title}>
                    <path d={icon.path} />
                  </svg>
                )}
                <h3>{tool.name}</h3>
                <span>{tool.role}</span>
                <p>{tool.note}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="blog" className="blog-section portfolio-band">
        <div className="section-container">
          <div className="section-heading reveal">
            <span className="eyebrow">Notes from the process / 04</span>
            <span className="section-index">Journal</span>
          </div>
          <div className="portfolio-heading reveal">
            <h2 className="section-title">
              Ideas, <em>in writing.</em>
            </h2>
            <p>
              Thoughts on design, development,
              <br />
              and everything in between.
            </p>
          </div>
          <div className="article-list">
            {articles.map((item, i) => (
              <Button
                key={item.title}
                variant="ghost"
                className="article-row reveal"
                onClick={() => setArticle(item)}
              >
                <span className="article-number">0{i + 1}</span>
                <span className="article-copy">
                  <span className="eyebrow">
                    {item.category} / {item.time}
                  </span>
                  <span className="article-title">{item.title}</span>
                </span>
                <ArrowUpRight />
              </Button>
            ))}
          </div>
        </div>
      </section>

      <Dialog
        open={project !== null}
        onOpenChange={(open) => {
          if (!open) setProject(null);
        }}
      >
        <DialogContent className="portfolio-detail">
          {project && (
            <>
              <img src={project.image_url} alt={project.alt} width={1200} height={912} />
              <span className="eyebrow">{project.category}</span>
              <DialogTitle>{project.title}</DialogTitle>
              <DialogDescription>{project.description}</DialogDescription>
              <p>{project.details}</p>
              <div className="project-tags">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <Button className="portfolio-button" asChild>
                <a
                  href={project.href}
                  target={project.href.startsWith("http") ? "_blank" : undefined}
                  rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  View live
                  <ArrowUpRight className="round-arrow" />
                </a>
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={article !== null}
        onOpenChange={(open) => {
          if (!open) setArticle(null);
        }}
      >
        <DialogContent className="portfolio-detail article-detail">
          {article && (
            <>
              <span className="eyebrow">Journal / {article.category}</span>
              <DialogTitle>{article.title}</DialogTitle>
              <DialogDescription>{article.time} / Design and development notes</DialogDescription>
              {article.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
