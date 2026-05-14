export type MainNavItem = {
  name: string;
  href: string;
};

/** Same order as the main site header; use in Header, Footer, etc. */
export const mainNavItems: MainNavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Our Design Work', href: '/collections' },
  { name: 'Services', href: '/services' },
  { name: 'Blog', href: '/blogs' },
  { name: 'Team', href: '/team' },
  { name: 'Contact', href: '/contact' },
];
