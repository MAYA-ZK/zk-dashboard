type LinkSection = {
  type: 'link'
  content: string
  href: string
}

type TextSection = {
  type: 'text'
  content: string
}

type ParagraphTextSection = {
  type: 'paragraph-text'
  content: string
}

type TitleSection = {
  type: 'title'
  content: string
}

type ListSection = {
  type: 'list'
  content: string
  listItems: Array<string>
}

type FormulaSection = {
  type: 'formula'
  content: string
  formula: string
}

type DocumentSection =
  | LinkSection
  | TextSection
  | ParagraphTextSection
  | TitleSection
  | ListSection
  | FormulaSection

interface DocumentBlock {
  id: string
  sections: Array<DocumentSection>
}

export const DOCUMENTATION: Array<DocumentBlock> = [
  {
    id: 'description',
    sections: [
      {
        type: 'text',
        content:
          'At Maya-ZK, we aim to provide qualitative rollup insights using zero-knowledge proof (ZKP). On our dashboard page, you will find historical data from the past 90 days on the average finality time and cost of proof for state updates.',
      },
    ],
  },
  {
    id: 'why-zk-rollups',
    sections: [
      { type: 'title', content: 'Why zk-rollups?' },
      {
        type: 'text',
        content:
          'We aim to scale and optimize the hardware solutions for fast, distributed ZKP generation. To understand the domain of zk-rollups, we have developed this dashboard to give a clear overview of finality for ',
      },
      {
        type: 'link',
        content: 'Linea',
        href: 'https://linea.build/',
      },
      {
        type: 'text',
        content: ', ',
      },
      {
        type: 'link',
        content: 'ScrollLinea',
        href: ' https://scroll.io/',
      },
      {
        type: 'text',
        content: ', ',
      },

      {
        type: 'link',
        content: 'Polygon zkEVM',
        href: 'https://polygon.technology/polygon-zkevm',
      },
      {
        type: 'text',
        content: ', and ',
      },

      {
        type: 'link',
        content: 'zkSync Era',
        href: 'https://zksync.io/',
      },
      {
        type: 'text',
        content: '.',
      },
    ],
  },
  {
    id: 'what-is-finality',
    sections: [
      { type: 'title', content: 'What is finality?' },
      {
        type: 'text',
        content:
          'The vision of this dashboard is to showcase the time and cost required for L1 finality in zk-rollups. L1 finality refers to the point at which the L2 state is proven on the L1 network. This finalization process updates the state of the L2 network and ensures that transactions are irreversible. Zk-rollups enable immediate withdrawals (in practice, within a few hours), in contrast to optimistic rollups that require a challenge period of several days to ensure transaction validity ',
      },
      {
        type: 'link',
        content: '[1]',
        href: 'https://ethereum.org/en/developers/docs/scaling/zk-rollups/',
      },
    ],
  },
  { id: 'methodology', sections: [{ type: 'title', content: 'Methodology' }] },
  {
    id: 'data-collection',
    sections: [
      { type: 'title', content: 'Collection' },
      {
        type: 'text',
        content:
          'The data used in the dashboard comes from multiple sources. On-chain data, including timestamps and transaction costs, are obtained through an RPC connection to the Ethereum network. Off-chain L2 transaction data is collected via RPC connections to various zk-rollup networks. Market price data is sourced from a Mobula, supplying the daily average ETH market price. ',
      },
    ],
  },
  {
    id: 'how-often-is-the-data-updated',
    sections: [
      { type: 'title', content: 'How often is the data updated?' },
      {
        type: 'text',
        content:
          'The data synchronization process for fetching and storing data from the zk-rollups takes approximately 5-10 minutes and repeats every 20 minutes. After the sixth cycle, the newly fetched data is integrated into the dashboard queries and materialized views (MV). The website employs a caching system that revalidates the data every hour. As a result, visitors will initially see cached data, but subsequent visits within the same hour will display the most recent data. In the worst-case scenario, data freshness may lag by up to 4 hours and 20 minutes.',
      },
      {
        type: 'list',
        content: 'Data update cycle:',
        listItems: [
          'Wait Time + Data Sync Time: 20 minutes + 5 to 10 minutes',
          'Number of Cycles Before MV Refresh: 6 cycles',
          'MV Refresh Time: 10 to 20 minutes',
          'Website Cache Validation Time: 1 to 60 minutes',
        ],
      },
      {
        type: 'formula',
        content: 'The formula is:',
        formula:
          '20 + 5 + 10 + 6 * (20 + 5 + 10) + 10 + 60 = 260 minutes = 4 hours and 20 minutes',
      },
      {
        type: 'text',
        content:
          'For the conversion from ETH to USD, the latest daily average market price is collected and matched with the data on-chain costs for the day. This process ensures the latest data is visible on the front end after midnight (UTC).',
      },
    ],
  },
  {
    id: 'data-range',
    sections: [
      {
        type: 'title',
        content: 'Date range',
      },
      {
        type: 'text',
        content:
          'The dashboard on the main page displays data based on the latest 90-day interval for each rollup, offering a consistent and scalable comparison across different rollups. The timeline for the data ends on the prior date from the current calendar date, capturing L2 transaction data finalized on the L1 network.',
      },
      {
        type: 'paragraph-text',
        content:
          'Users can select a range of 1-day, 7-day, 30-day, or 90-day on the main page to get an index that showcases finality times and costs over varying periods. This flexibility can be particularly useful in assessing how rollup upgrades impact performance.',
      },
    ],
  },

  {
    id: 'finality-time',
    sections: [
      { type: 'title', content: 'Finality time' },
      {
        type: 'text',
        content:
          'The metric for finality time on the main page provides an overview of the average time from when a batch gets created until the proof of the L2 transaction data is verified on the L1 network.',
      },
      {
        type: 'paragraph-text',
        content:
          'To present the variations in the size of L2 transaction data on the different rollups, there is a column with the average normalized finality time for batches containing exactly 100 L2 transactions. This normalization adjusts for the varying batch sizes using epoch timestamps and sizes of the L2 transaction data published. The method calculates the average duration, scaled to a standard batch size of 100 transactions.',
      },
      {
        type: 'formula',
        content: 'The formula is:',
        formula:
          'Normalized Finality Time = (Total Time for All Batches (sec.)) / Total Transactions in All Batches) * 100',
      },
      {
        type: 'text',
        content:
          'The formula calculates the average time required to finalize a standard batch of 100 transactions, providing a comparable measure across different rollups.',
      },
    ],
  },
  {
    id: 'transactions-per-proof',
    sections: [
      { type: 'title', content: 'Transactions per proof' },
      {
        type: 'text',
        content:
          'The transactions per proof refer to the average count of L2 transactions per batch published to the L1 network.',
      },
    ],
  },
  {
    id: 'costs',
    sections: [
      { type: 'title', content: 'Costs' },
      {
        type: 'text',
        content:
          'The cost of verification transactions can be shown as ETH or USD based on the market price The cost in ETH is taken from transaction data within the selected date range.',
      },
      {
        type: 'paragraph-text',
        content:
          'The calculation for USD costs is based on the daily average market price of ETH in USD, corresponding to the selected date range. The transaction cost in USD is calculated by multiplying the ETH cost by this average USD market price.',
      },
      {
        type: 'formula',
        content: 'The formula is:',
        formula:
          'Transaction Cost in USD = (Transaction Cost in ETH) * USD Market Price',
      },

      {
        type: 'text',
        content:
          'This ensures that the costs accurately reflect the recorded price and transaction data within the chosen date range.',
      },
    ],
  },
  {
    id: 'on-chain-finality-cost',
    sections: [
      { type: 'title', content: 'On-chain finality cost' },
      {
        type: 'text',
        content:
          'The average on-chain finality cost reflects the L2-proof verification cost on the L1 network. This cost includes the gas fees required for proof submission to the L1 network to validate and update the state of the L2 transaction data, ensuring their security and transparency. However, it excludes individual transaction fees collected on the L2 network, providing a clear view of the expenses in securing the entire batch on the L1 network. ',
      },
      {
        type: 'paragraph-text',
        content:
          'The cost per L2  transaction data on the L1 network is calculated by dividing the on-chain finality cost by the published L2 transaction data size and multiplying it by 100.',
      },
      {
        type: 'formula',
        content: 'The formula is:',
        formula:
          'Cost per L2 Transaction = (On-chain Finality Cost / Published Transactions) * 100',
      },
    ],
  },
  {
    id: 'terminologies',
    sections: [
      { type: 'title', content: 'Acronyms' },
      {
        type: 'list',
        content: '',
        listItems: [
          'L1: Layer 1',
          'L2: Layer 2',
          'EVM: Ethereum Virtual Machine',
          'MV: Materialized view',
          'TX/TXS: Transaction(s)',
          'ZKP: Zero-Knowledge Proof',
        ],
      },
      {
        type: 'text',
        content: 'For questions and comments, please contact us at ',
      },
      {
        type: 'link',
        content: 'contact@maya-zk.com',
        href: 'mailto:contact@maya-zk.com',
      },
    ],
  },
]
