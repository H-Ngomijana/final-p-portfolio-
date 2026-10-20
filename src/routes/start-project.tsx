import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { listPackages } from '@/lib/packages.functions';
import { submitInquiry } from '@/lib/inquiries.functions';
import { fallbackPackages, formatPackagePrice, packageDatabaseId, type PublicPackage } from '@/lib/package-catalog';
import { z } from 'zod';

export const Route = createFileRoute('/start-project')({
  validateSearch: z.object({
    package: z.string().optional(),
    custom: z.union([z.string(), z.number()]).optional(),
  }),
  head: () => ({ meta: [
    { title: 'Plan your project — Hugues B.' },
    { name: 'description', content: 'Choose a development package and share the details of your project.' },
    { property: 'og:title', content: 'Plan your project — Hugues B.' },
    { property: 'og:description', content: 'A clear, guided project brief and package selection.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: ProjectBrief,
});

function ProjectBrief() {
  const { package: initialPackage, custom } = Route.useSearch();
  const isCustomProject = custom === '1' || custom === 1;
  const fetchPackages = useServerFn(listPackages);
  const { data = [], isPending, isError } = useQuery({
    queryKey: ['public-packages'],
    queryFn: () => fetchPackages(),
    refetchInterval: 3_000,
  });
  const availablePackages: PublicPackage[] = data.length ? data : fallbackPackages;
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [paymentOption, setPaymentOption] = useState<'once' | 'milestones'>('once');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const effectiveSelectedId = selectedId ?? (
    isCustomProject && !initialPackage
      ? ''
      : availablePackages.find((item) => item.id === initialPackage)?.id
        ?? availablePackages[0]?.id
        ?? ''
  );
  const selectedPackage = availablePackages.find((item) => item.id === effectiveSelectedId);
  const packageTotal = selectedPackage?.price ?? 0;
  const estimatedTotal = paymentOption === 'once' ? Math.round(packageTotal * 0.9) : packageTotal;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      await submitInquiry({
        data: {
          name: String(form.get('name') ?? ''),
          email: String(form.get('email') ?? ''),
          company: String(form.get('company') ?? ''),
          message: String(form.get('message') ?? ''),
          packageId: selectedPackage ? packageDatabaseId(selectedPackage.id) ?? '' : '',
          packageName: selectedPackage?.name ?? 'Custom project',
          phone: String(form.get('phone') ?? ''),
          country: String(form.get('country') ?? ''),
          paymentOption,
          orderSubmission: true,
          agreement: form.get('agreement') === 'on',
          website: String(form.get('website') ?? ''),
        },
      });
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your project brief could not be sent. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="project-order-page section-container">
    <header className="order-header">
      <Link className="brand" to="/">Hugues B.</Link>
      <span className="availability-pill"><span />Available for new projects <b>Q3 &amp; Q4</b></span>
    </header>
    <Link className="order-back" to="/"><ArrowLeft />Back to portfolio</Link>
    <div className="order-step eyebrow">Step 01 of 01 / Project brief</div>
    <h1 className="section-title order-title">Make the next<br /><em>move.</em></h1>
    <p className="order-intro">Choose the right starting point, tell me what you have in mind, and I’ll follow up with a clear next step.</p>

    {sent ? <section className="order-success" role="status">
      <CheckCircle2 aria-hidden="true" />
      <span className="eyebrow">Project brief received</span>
      <h2>Thank you. Your project is in good hands.</h2>
      <p>Thank you for your package request. You will receive a brief email with feedback and recommended next steps.</p>
      <Button asChild className="portfolio-button"><Link to="/">Return to the portfolio<ArrowRight /></Link></Button>
    </section> : <form className="order-form" onSubmit={handleSubmit}>
      <section className="order-section">
        <div className="order-section-heading"><div><span className="eyebrow">01 / Choose a direction</span><h2>Select your package</h2></div><span className="section-index">You can change this at any time</span></div>
        {isPending && <p role="status" className="order-note">Checking current package availability…</p>}
        {isError && <p role="alert" className="order-note">Live packages are unavailable; the standard packages are shown below.</p>}
        <div className="order-package-grid">
          {availablePackages.map((item, index) => <button key={item.id} type="button" className={`order-package-card ${effectiveSelectedId === item.id ? 'is-selected' : ''}`} aria-pressed={effectiveSelectedId === item.id} onClick={() => setSelectedId(item.id)}>
            <span className="order-package-top"><span className="eyebrow">0{index + 1} / {item.name}</span>{effectiveSelectedId === item.id && <Check aria-label="Selected" />}</span>
            <strong>{item.name}</strong>
            <span className="order-package-price">{formatPackagePrice(item.price, item.currency)}</span>
            <span className="order-package-description">{item.description}</span>
            <span className="order-feature-list">{item.features.slice(0, 3).map((feature) => <span key={feature}><Check />{feature}</span>)}</span>
          </button>)}
          <button type="button" className={`order-package-card order-custom-card ${effectiveSelectedId === '' ? 'is-selected' : ''}`} aria-pressed={effectiveSelectedId === ''} onClick={() => setSelectedId('')}>
            <span className="order-package-top"><span className="eyebrow">Flexible scope</span>{effectiveSelectedId === '' && <Check aria-label="Selected" />}</span>
            <strong>Custom project</strong>
            <span className="order-package-price">Let’s scope it</span>
            <span className="order-package-description">A made-to-fit plan for a product that needs a different mix of features, integrations, or delivery stages.</span>
            <span className="order-feature-list"><span><Check />Discovery and product planning</span><span><Check />Tailored proposal and timeline</span></span>
          </button>
        </div>
      </section>

      <section className="order-section">
        <div className="order-section-heading"><div><span className="eyebrow">02 / Tell me about it</span><h2>Client information</h2></div><span className="section-index">All fields marked * are required</span></div>
        <div className="order-fields">
          <label>Full contact name *<Input name="name" placeholder="e.g. Jordan Lee" required minLength={2} maxLength={100} autoComplete="name" /></label>
          <label>Work email address *<Input name="email" type="email" placeholder="e.g. chaste@company.com" required maxLength={254} autoComplete="email" /></label>
          <label>Company / organization<Input name="company" placeholder="e.g. Acme Studio" maxLength={150} autoComplete="organization" /></label>
          <label>Phone number (optional)<Input name="phone" type="tel" placeholder="+250 788 000 000" maxLength={40} autoComplete="tel" /></label>
          <label>Country / region (optional)<Input name="country" placeholder="e.g. Rwanda" maxLength={100} autoComplete="country-name" /></label>
          <label className="order-message-field">What would you like to build? *<Textarea name="message" placeholder="Share your goals, the people this is for, the key features you have in mind, and any target launch date..." required minLength={10} maxLength={5000} /></label>
        </div>
        <label className="form-honeypot" aria-hidden="true">Website<Input name="website" tabIndex={-1} autoComplete="off" /></label>
      </section>

      <section className="order-summary">
        <div className="order-section-heading"><div><span className="eyebrow">03 / Review before sending</span><h2>Application summary</h2></div><span className="order-estimate-label">Real-time estimate</span></div>
        <div className="order-summary-grid">
          <div><span className="section-index">Package selected</span><strong>{selectedPackage?.name ?? 'Custom project'}</strong></div>
          <div><span className="section-index">Payment preference</span><strong>{paymentOption === 'once' ? 'One-time payment / 10% off' : 'Milestone payments'}</strong></div>
          <div><span className="section-index">Estimated timeline</span><strong>Confirmed after project discovery</strong></div>
          <div><span className="section-index">Estimated total</span><strong className="order-total">{selectedPackage ? formatPackagePrice(estimatedTotal, selectedPackage.currency) : 'Custom quote'}</strong></div>
        </div>
        <div className="payment-options" role="radiogroup" aria-label="Payment preference">
          <label className={paymentOption === 'once' ? 'is-selected' : ''}><input type="radio" name="paymentOption" value="once" checked={paymentOption === 'once'} onChange={() => setPaymentOption('once')} /><span><strong>Pay once</strong><small>10% off the package estimate</small></span></label>
          <label className={paymentOption === 'milestones' ? 'is-selected' : ''}><input type="radio" name="paymentOption" value="milestones" checked={paymentOption === 'milestones'} onChange={() => setPaymentOption('milestones')} /><span><strong>Pay by milestones</strong><small>Agree stages and amounts before work begins</small></span></label>
        </div>
        <label className="agreement-check"><input type="checkbox" name="agreement" required /><span>I have read and agree to the <a href="/project-agreement" target="_blank" rel="noreferrer">project agreement</a>. Sending this brief requests a proposal; it does not charge me or create a binding contract.</span></label>
        <div className="order-submit-row">
          <span><ShieldCheck />Your project details are only shared with the studio.</span>
          <Button className="portfolio-button order-submit" type="submit" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" /> : null}{busy ? 'Sending project brief…' : 'Submit project brief'}<ArrowRight /></Button>
        </div>
        {error && <p role="alert" className="form-error">{error}</p>}
      </section>
    </form>}
    <footer className="order-footer"><span>Hugues B. / Independent digital studio</span><span>Thoughtful products, made with intention.</span></footer>
  </main>;
}
