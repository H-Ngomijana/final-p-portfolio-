import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Github,
  Home,
  Instagram,
  Mail,
  Menu,
  MessageCircle,
  MoveUpRight,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InquiryDialog } from "@/components/inquiry-dialog";
import { PersonalAbout, PersonalPortfolio } from "@/components/personal-portfolio";
import { DeveloperPackages } from "@/components/developer-packages";
import { portfolioSections, shouldDockNavigation } from "@/lib/portfolio-navigation";
import { usePortfolioTheme } from "@/lib/portfolio-theme";

const Sculpture = lazy(() => import("@/components/sculpture"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hugues B. - Creative Developer & Platform Builder" },
      {
        name: "description",
        content:
          "Portfolio of Hugues B., a developer building polished websites, platforms, fintech products, and digital experiences.",
      },
      { property: "og:title", content: "Hugues B. - Creative Developer & Platform Builder" },
      {
        property: "og:description",
        content:
          "Featured projects, development packages, technology stack, and contact links for Hugues B.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={i}
          d="M20 3 L23 10 L20 14"
          stroke="currentColor"
          strokeWidth="1.2"
          transform={`rotate(${i * 30} 20 20)`}
        />
      ))}
    </svg>
  );
}

function Index() {
  const { theme, toggleTheme } = usePortfolioTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [active, setActive] = useState("");
  const [loaderExiting, setLoaderExiting] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const portraitRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.sessionStorage.getItem("portfolio-loader-seen") === "true") {
      setLoaderVisible(false);
      return;
    }
    window.sessionStorage.setItem("portfolio-loader-seen", "true");

    const exitTimer = window.setTimeout(() => setLoaderExiting(true), 2700);
    const removeTimer = window.setTimeout(() => setLoaderVisible(false), 3000);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onScroll = () => {
      setScrolled(shouldDockNavigation(window.scrollY));
      const progress = reduceMotion
        ? 0
        : Math.min(1, Math.max(0, window.scrollY / Math.max(window.innerHeight * 0.8, 1)));
      portraitRef.current?.style.setProperty("--portrait-scroll", String(progress));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          if (reduceMotion) {
            element.dataset["revealed"] = "true";
          } else if (element.dataset["revealed"] !== "true") {
            const index = Number(element.dataset["revealIndex"] ?? 0);
            const animation = element.animate(
              [
                { opacity: 0, transform: "translate3d(0, 42px, 0) scale(.985)" },
                { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
              ],
              {
                duration: element.classList.contains("stack-card") ? 1050 : 850,
                delay: Math.min(index * 75, 525),
                easing: "cubic-bezier(.16, 1, .3, 1)",
                fill: "both",
              },
            );
            animation.addEventListener(
              "finish",
              () => {
                element.dataset["revealed"] = "true";
                animation.cancel();
              },
              { once: true },
            );
          }
          observer.unobserve(element);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    const sectionObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id === "home" ? "" : entry.target.id);
        }),
      { rootMargin: "-20% 0px -55% 0px" },
    );
    document
      .querySelectorAll("main > section")
      .forEach((element) => sectionObserver.observe(element));
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", escape);
    };
  }, [menuOpen]);

  const openContact = () => {
    setMenuOpen(false);
    setContactOpen(true);
  };
  const cta = (label = "Get in Touch") => (
    <Button className="portfolio-button" onClick={() => openContact()}>
      {label}
      <ArrowUpRight className="round-arrow" />
    </Button>
  );

  return (
    <div className="site-shell">
      {loaderVisible && (
        <div
          className={`experience-loader ${loaderExiting ? "is-exiting" : ""}`}
          role="status"
          aria-live="polite"
        >
          <div className="experience-loader-content">
            <BrandMark />
            <span>Hugues B.</span>
            <p>Loading experience</p>
            <div className="experience-loader-track" aria-hidden="true">
              <span />
            </div>
          </div>
        </div>
      )}
      <div className={`scene-backdrop ${scrolled ? "is-scrolled" : ""}`}>
        <ClientOnly>
          <Suspense fallback={null}>
            <Sculpture />
          </Suspense>
        </ClientOnly>
      </div>
      <header
        className={`site-header ${scrolled && !menuOpen ? "nav-away" : ""}`}
        inert={scrolled && !menuOpen}
      >
        <div className="header-inner">
          <a
            href="#home"
            className="brand"
            aria-label="Hugues B. home"
            onClick={() => setMenuOpen(false)}
          >
            <BrandMark />
            Hugues B.
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {portfolioSections.map(({ id, label }) => (
              <a
                key={id}
                className="nav-link"
                href={`#${id}`}
                data-active={active === id}
                aria-current={active === id ? "location" : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <div className="header-contact">{cta()}</div>
            <Button
              type="button"
              className="theme-toggle"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
            <Button
              className="mobile-toggle"
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <nav id="mobile-navigation" className="mobile-menu" aria-label="Mobile navigation">
          {portfolioSections.map(({ id, label }, i) => (
            <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
              <span className="eyebrow">0{i + 1}</span> {label}
              <MoveUpRight className="inline ml-4 size-6" />
            </a>
          ))}
          <div className="mt-8">{cta()}</div>
        </nav>
      )}
      <nav
        className={`bottom-navigation ${scrolled && !menuOpen ? "is-docked" : ""}`}
        aria-label="Portfolio navigation"
        inert={!scrolled || menuOpen}
      >
        <Button variant="ghost" size="icon" asChild className="dock-home">
          <a href="#home" aria-label="Back to top" title="Back to top">
            <Home />
          </a>
        </Button>
        <div className="dock-links">
          {portfolioSections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              data-active={active === id}
              aria-current={active === id ? "location" : undefined}
            >
              {label}
            </a>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="dock-contact"
          onClick={() => openContact()}
          aria-label="Get in touch"
          title="Get in touch"
        >
          <ArrowUpRight />
        </Button>
      </nav>
      <main>
        <section id="home" className="hero-section">
          <img
            ref={portraitRef}
            className="hero-portrait"
            src="/projects/profile%20img.png"
            alt="Portrait of Hugues B."
            width={1254}
            height={1254}
            fetchPriority="high"
          />
          <div className="page-enter">
            <div className="eyebrow">Creative developer / Rwanda</div>
            <h1 className="hero-title">
              Hugues B.
              <br />
              <em>Websites, platforms,</em>
              <br />
              and product craft.
            </h1>
            <div className="hero-actions">
              <Button className="portfolio-button" asChild>
                <a href="#projects">
                  Explore my work <ArrowUpRight className="round-arrow" />
                </a>
              </Button>
              {cta("Connect")}
            </div>
          </div>
          <div className="hero-bottom section-container">
            <a href="#about" className="scroll-link">
              Scroll to explore
              <ArrowDown />
            </a>
            <p className="hero-caption">
              Professional websites. Business platforms. Fintech and media ideas brought into
              working form.
            </p>
          </div>
        </section>
        <PersonalAbout />
        <PersonalPortfolio />
        <DeveloperPackages />
        <section id="contact" className="contact-section section-container">
          <div className="reveal">
            <div className="eyebrow">The next chapter / 06</div>
            <h2 className="section-title">
              Have something
              <br />
              <em>in mind?</em>
            </h2>
            <div className="contact-actions">
              {cta("Let us make it happen")}
              <Button variant="outline" className="portfolio-button" asChild>
                <a href="https://wa.me/250794417555" target="_blank" rel="noopener noreferrer">
                  <MessageCircle />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="section-container">
          <div className="footer-top">
            <div>
              <a href="#home" className="brand">
                <BrandMark />
                Hugues B.
              </a>
              <p className="footer-copy">
                Good ideas deserve
                <br />a thoughtful execution.
              </p>
            </div>
            <div className="footer-nav">
              <div className="footer-column">
                <span className="eyebrow">Explore</span>
                {portfolioSections.map(({ id, label }) => (
                  <a href={`#${id}`} key={id}>
                    {label}
                  </a>
                ))}
              </div>
              <div className="footer-column">
                <span className="eyebrow">Connect</span>
                <Button
                  variant="link"
                  className="h-auto p-0 justify-start text-xs"
                  onClick={() => openContact()}
                >
                  Send message <ArrowUpRight />
                </Button>
                <a
                  href="https://instagram.com/ngomijana_"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram />
                  Instagram
                </a>
                <a href="https://wa.me/250794417555" target="_blank" rel="noopener noreferrer">
                  <MessageCircle />
                  WhatsApp
                </a>
                <a href="mailto:HuguesBlessy@gmail.com">
                  <Mail />
                  HuguesBlessy@gmail.com
                </a>
                <a href="https://github.com/H-Ngomijana" target="_blank" rel="noopener noreferrer">
                  <Github />
                  GitHub
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>Copyright {new Date().getFullYear()} Hugues B. All rights reserved.</span>
            <span className="footer-status">Design and development. With intention.</span>
            <a href="#home" className="scroll-link">
              Back to top
              <ArrowUpRight />
            </a>
          </div>
        </div>
      </footer>
      <InquiryDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
