export const routes = {
  home: '/',
  scroll: '/dashboard/scroll',
  zkSync: '/dashboard/zksync-era',
  polygon: '/dashboard/polygon-zkevm',
  linea: '/dashboard/linea',
  documentation: '/documentation',
  maya: 'https://maya-zk.com',
  documentationSection: (section: string) => `/documentation#${section}`,
} as const
