import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listPackages } from "@/lib/packages.functions";
import { fallbackPackages, formatPackagePrice } from "@/lib/package-catalog";

export function DeveloperPackages() {
  const fetchPackages = useServerFn(listPackages);
  const {
    data = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["public-packages"],
    queryFn: () => fetchPackages(),
    refetchInterval: 3_000,
  });
  const packages = isError || isPending ? fallbackPackages : data;

  return (
    <section id="packages" className="portfolio-band packages-section">
      <div className="section-container">
        <div className="section-heading reveal">
          <span className="eyebrow">From idea to launch / 05</span>
          <span className="section-index">Project packages</span>
        </div>
        <div className="portfolio-heading reveal">
          <h2 className="section-title">
            Get in touch
            <br />
            <em>and build.</em>
          </h2>
          <p>
            Buy a package for a website, platform,
            <br />
            or custom digital product by Hugues B.
          </p>
        </div>
        {isPending ? (
          <p role="status">Loading packages...</p>
        ) : isError ? (
          <p role="alert">
            Live package prices are unavailable right now. You can still request one of the standard
            packages below.
          </p>
        ) : data.length === 0 ? (
          <p role="status">Standard packages are shown while no custom packages are published.</p>
        ) : null}
        <div className="package-grid">
          {packages.map((item) => (
            <article className="package-item reveal" key={item.id}>
              <span className="eyebrow">Development package</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="package-price">{formatPackagePrice(item.price, item.currency)}</div>
              <ul>
                {item.features.map((feature) => (
                  <li key={feature}>
                    <Check />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="portfolio-button">
                <a href={`/start-project?package=${encodeURIComponent(item.id)}`}>
                  Choose this plan
                  <ArrowUpRight />
                </a>
              </Button>
            </article>
          ))}
        </div>
        <div className="package-custom reveal">
          <span className="eyebrow">Need something exact?</span>
          <h3>Custom scope, custom timeline.</h3>
          <p>Share the kind of platform you want, and I will help shape the right build plan.</p>
          <Button asChild className="portfolio-button">
            <a href="/start-project?custom=1">
              Plan a custom project
              <ArrowUpRight />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
