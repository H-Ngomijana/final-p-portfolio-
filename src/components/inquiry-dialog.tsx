import { useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Github, Instagram, Loader2, Mail, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitInquiry } from '@/lib/inquiries.functions';

type InquiryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId?: string | undefined;
  packageName?: string | undefined;
};

export function InquiryDialog({ open, onOpenChange, packageId = '', packageName = '' }: InquiryDialogProps) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      await submitInquiry({
        data: {
          name: String(form.get('name')),
          email: String(form.get('email')),
          company: String(form.get('company') ?? ''),
          message: String(form.get('message')),
          packageId: String(form.get('packageId') ?? ''),
          packageName: String(form.get('packageName') ?? ''),
          website: String(form.get('website') ?? ''),
        },
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <Dialog open={open} onOpenChange={(value) => {
    onOpenChange(value);
    if (!value) {
      setSent(false);
      setError('');
    }
  }}>
    <DialogContent className="max-h-[90svh] overflow-y-auto">
      <DialogTitle className="font-display text-4xl font-normal">Work with Hugues B.</DialogTitle>
      <DialogDescription>Tell me what you want to build. I will review it from the private studio dashboard.</DialogDescription>
      <div className="contact-quick-links" aria-label="Direct contact links">
        <Button variant="outline" asChild><a href="https://wa.me/250794417555" target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button>
        <Button variant="outline" asChild><a href="mailto:HuguesBlessy@gmail.com"><Mail />Email</a></Button>
        <Button variant="outline" asChild><a href="https://instagram.com/ngomijana_" target="_blank" rel="noopener noreferrer"><Instagram />Instagram</a></Button>
        <Button variant="outline" asChild><a href="https://github.com/H-Ngomijana" target="_blank" rel="noopener noreferrer"><Github />GitHub</a></Button>
      </div>
      {sent ? <div className="form-success" role="status">
        <CheckCircle2 />
        <h3>Your message is in.</h3>
        <p>Thank you for your inquiry. You will receive a brief email with feedback and recommended next steps.</p>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>Back to Hugues B.</Button>
      </div> :
      <form className="inquiry-form" onSubmit={handleSubmit}>
        {packageName && <div className="selected-package"><span className="eyebrow">Selected package</span><strong>{packageName}</strong></div>}
        <input type="hidden" name="packageId" value={packageId} />
        <input type="hidden" name="packageName" value={packageName} />
        <div className="form-row">
          <label>Your name<Input name="name" placeholder="Full name" required minLength={2} maxLength={100} autoComplete="name" /></label>
          <label>Email address<Input name="email" type="email" placeholder="you@company.com" required maxLength={254} autoComplete="email" /></label>
        </div>
        <label>Company / project<Input name="company" placeholder="Your brand or project" maxLength={150} autoComplete="organization" /></label>
        <label>What are you building?<Textarea name="message" placeholder="Tell me about your website, platform, timeline, and budget..." required minLength={10} maxLength={5000} /></label>
        <label className="form-honeypot" aria-hidden="true">Website<Input name="website" tabIndex={-1} autoComplete="off" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <Button disabled={busy} type="submit" className="portfolio-button">{busy ? <Loader2 className="animate-spin" /> : <ArrowUpRight />} {busy ? 'Sending...' : 'Send inquiry'}</Button>
      </form>}
    </DialogContent>
  </Dialog>;
}
