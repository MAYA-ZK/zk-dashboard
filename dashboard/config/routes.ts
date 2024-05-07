export const routes = {
  home: '/',
  scroll: '/dashboard/scroll',
  zkSync: '/dashboard/zksync-era',
  polygon: '/dashboard/polygon-zkevm',
  documentation: '/documentation',
  maya: 'https://maya-zk.com',
} as const

export const documentationSection = (section: string) =>
  `/documentation#${section}`
