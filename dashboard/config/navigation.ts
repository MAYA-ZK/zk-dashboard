import { routes } from './routes'

export const BLOCKCHAIN_LINKS = {
  scroll: {
    title: 'Scroll',
    path: routes.scroll,
    logo: '/scroll-logo.svg',
  },
  zkSyncEra: {
    title: 'zkSync Era',
    path: routes.zkSync,
    logo: '/zk-sync-era-logo.svg',
  },
  polygonZkEVM: {
    title: 'Polygon zkEVM',
    path: routes.polygon,
    logo: '/polygon-zk-evm-logo.svg',
  },
  linea: {
    title: 'Linea',
    path: routes.linea,
    logo: '/linea-logo.svg',
  },
}

export const GENERAL_LINKS = {
  mayaZk: {
    title: 'MAYA-ZK.com',
    path: routes.maya,
  },
  backToDashboard: {
    title: 'Back to main',
    path: routes.home,
  },
  documentation: {
    title: 'Documentation',
    path: routes.documentation,
  },
}
