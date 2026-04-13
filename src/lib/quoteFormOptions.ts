/**
 * Quote form dropdown options (Project type, Budget range, Preferred style).
 *
 * HOW TO CHANGE WHAT APPEARS IN THE DROPDOWNS
 * — Edit the arrays below in this file (add/remove/rename lines), then save.
 * — With `npm run dev` running, the page usually hot-reloads; otherwise refresh the browser.
 * — There is no in-browser settings screen: options live in source code only.
 *
 * Each item: `value` = sent to the API (keep stable if you already store data). `label` = text shown in the UI.
 */
export type QuoteFormOption = {
  value: string;
  label: string;
};

export const QUOTE_FORM_PROJECT_TYPES: QuoteFormOption[] = [
  { value: 'Residential', label: 'Residential Art' },
  { value: 'Corporate', label: 'Corporate Graphics' },
  { value: 'Healthcare', label: 'Healthcare Murals' },
  { value: 'Hospitality', label: 'Hospitality Design' },
];

export const QUOTE_FORM_BUDGET_RANGES: QuoteFormOption[] = [
  { value: 'Small', label: 'Under $1,000' },
  { value: 'Medium', label: '$1,000 - $5,000' },
  { value: 'Large', label: '$5,000 - $15,000' },
  { value: 'Premium', label: '$15,000+' },
];

export const QUOTE_FORM_PREFERRED_STYLES: QuoteFormOption[] = [
  { value: 'Minimalist', label: 'Minimalist' },
  { value: 'Abstract', label: 'Abstract' },
  { value: 'Realistic', label: 'Realistic' },
  { value: 'Geometric', label: 'Geometric' },
  { value: 'Typography', label: 'Typography / Lettering' },
  { value: 'Mixed', label: 'Mixed / Not sure yet' },
];
