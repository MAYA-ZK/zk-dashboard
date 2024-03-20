import { routes } from './routes'

export const NAV_CONFIG = [
  {
    title: 'Scroll',
    path: routes.scroll,
  },
  {
    title: 'zkSync Era',
    path: routes.zkSync,
  },
  {
    title: 'Polygon zkEVM',
    path: routes.polygon,
  },
  {
    title: 'MAYA.com',
    path: routes.maya,
  },
] as const
