/**
 * Quote form dropdown options (Project type, Budget range, Preferred style).
 *
 * HOW TO CHANGE WHAT APPEARS IN THE DROPDOWNS
 * Edit the arrays below in this file (add/remove/rename lines), then save.
 * With `npm run dev` running, the page usually hot-reloads; otherwise refresh the browser.
 * There is no in-browser settings screen: options live in source code only.
 *
 * Each item: `value` = sent to the API (keep stable if you already store data). `label` = text shown in the UI.
 */
export type QuoteFormOption = {
  value: string;
  label: string;
};

export const QUOTE_FORM_PROJECT_TYPES: QuoteFormOption[] = [
  { value: 'Custom Wall Mural', label: 'Custom Wall Mural' },
  { value: 'Wallpaper Design', label: 'Wallpaper Design' },
  { value: 'Feature Wall Artwork', label: 'Feature Wall Artwork' },
  { value: 'Kids Room / Nursery Design', label: 'Kids Room / Nursery Design' },
  { value: 'Office / Corporate Wall Art', label: 'Office / Corporate Wall Art' },
  { value: 'Hotel / Hospitality Mural', label: 'Hotel / Hospitality Mural' },
  { value: 'Restaurant / Cafe Wall Design', label: 'Restaurant / Cafe Wall Design' },
  { value: 'Nature / Landscape Mural', label: 'Nature / Landscape Mural' },
  { value: 'Abstract Wall Art', label: 'Abstract Wall Art' },
  { value: 'Portrait / Figure Mural', label: 'Portrait / Figure Mural' },
  { value: 'Geometric Pattern Design', label: 'Geometric Pattern Design' },
  { value: 'Floral / Botanical Design', label: 'Floral / Botanical Design' },
  { value: 'Typography / Quote Wall Art', label: 'Typography / Quote Wall Art' },
  { value: 'Cultural / Traditional Artwork', label: 'Cultural / Traditional Artwork' },
  { value: 'Logo Integration into Wall Art', label: 'Logo Integration into Wall Art' },
  { value: 'Other / Custom Brief', label: 'Other / Custom Brief' },
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
  { value: 'Botanical', label: 'Botanical / Floral' },
  { value: 'Nature', label: 'Nature / Landscape' },
  { value: 'Watercolor', label: 'Watercolor' },
  { value: 'Tropical', label: 'Tropical / Exotic' },
  { value: 'Kids', label: 'Kids / Playful' },
  { value: 'Vintage', label: 'Vintage / Retro' },
  { value: 'Cultural', label: 'Cultural / Traditional' },
  { value: 'Luxury', label: 'Luxury / Ornamental' },
  { value: 'Doodle', label: 'Doodle Art / Line Art' },
  { value: 'Vector', label: 'Vector Art' },
  { value: 'Mixed', label: 'Mixed / Not sure yet' },
];
