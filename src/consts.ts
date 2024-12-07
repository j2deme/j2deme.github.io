// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.
export type Site = {
  TITLE: string
  DESCRIPTION: string
  EMAIL: string
  NUM_POSTS_ON_HOMEPAGE: number
  POSTS_PER_PAGE: number
  SITEURL: string
}

export type Link = {
  href: string
  label: string
  icon?: string
}

export const SITE: Site = {
  TITLE: 'J2deme',
  DESCRIPTION:
    'Mi sitio web desarrollado con Astro y PicoCSS',
  EMAIL: 'jaime.dm@cdvalles.tecnm.mx',
  NUM_POSTS_ON_HOMEPAGE: 2,
  SITEURL: 'https://j2deme.github.io',
  POSTS_PER_PAGE: 5,
}

export const NAV_LINKS: Link[] = [
  // { href: '/slides', label: 'Slides', icon: 'presentation' },
  { href: '/blog', label: 'Blog', icon: 'news' },
  { href: '/tags', label: 'Tags', icon: 'tags' },
  { href: '/apps', label: 'Apps', icon: 'code' },
  { href: '/about', label: 'Acerca de', icon: 'user' },
]

export const SOCIAL_LINKS: Link[] = [
  { href: 'https://github.com/j2deme', label: 'Sígueme en GitHub', icon: 'brand-github' },
  { href: `mailto:${SITE.EMAIL}`, label: 'Email', icon: 'mail' },
  { href: '/rss.xml', label: 'RSS', icon: 'rss' },
]