/** "Întrebări frecvente": questions people search for, answered on the page. */
// Libs
import { ChevronDown } from 'lucide-react';

// Components
import { Eyebrow } from './Eyebrow';

// Logic
import { useTexts } from '@/hooks/useTexts';

// Types
import type { FaqItem } from '@/api/types';

/** Props of FaqSection. */
interface Props {
  items: FaqItem[];
}

/**
 * Native <details> elements: keyboard and screen-reader friendly without script, and the answers
 * stay in the HTML while collapsed, so search engines read them. The first one starts open. Renders
 * nothing without entries. The same entries are published as FAQPage structured data by the build.
 */
export function FaqSection({ items }: Props) {
  const texts = useTexts();
  if (items.length === 0) return null;

  return (
    <section id="intrebari" className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{texts['faq.title']}</h2>
        <p className="text-muted-foreground">{texts['faq.subtitle']}</p>
      </div>
      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
        {items.map((item, index) => (
          <details key={item.id} open={index === 0} className="group px-5 py-4 sm:px-6">
            <summary className="flex list-none items-center justify-between gap-4 font-bold sm:text-lg [&::-webkit-details-marker]:hidden">
              <h3>{item.question}</h3>
              <ChevronDown className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="pt-3 text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
