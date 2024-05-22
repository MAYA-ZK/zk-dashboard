type LinkSection = {
  type: 'link'
  content: string
  href: string
}

type TextSection = {
  type: 'text'
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
          'At Maya-ZK, we aim to provide qualitative insights on the rollups built on zero-knowledge proof (ZKP) technologies, built to be compatible with the Ethereum virtual machine (EVM). On our dashboard page, you will find historical data from the past 90 days on the average finality time and cost of proof for state updates.',
      },
    ],
  },
  {
    id: 'why-zk-rollups',
    sections: [
      { type: 'title', content: 'Why zk-rollups?' },
      {
        type: 'text',
        content: `Our mission is to scale and optimize the hardware solutions used in building for distributed zero-knowledge proof generation. To understand the domain of zk-rollups, we have developed this dashboard to give a clear overview of finality for `,
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
          'The core purpose of this dashboard is to showcase the time and cost required for finality in zk-rollups. Finality refers to the point at which L2 transaction data, processed off-chain, is securely proven and committed on the L1 network. This finalization process updates the state of the L2 network and ensures that transactions are irreversible. In zk-rollups, cryptographic proofs, such as zero-knowledge proofs, allow for immediate withdrawals and state confirmations within a few hours, in contrast to optimistic rollups that require a challenge period of several days to ensure transaction validity ',
      },
      {
        type: 'link',
        content: '[1]',
        href: 'https://ethereum.org/en/developers/docs/scaling/zk-rollups/',
      },
    ],
  },
  {
    id: 'why-is-data-availability-not-included',
    sections: [
      { type: 'title', content: 'Why is data availability not included?' },
      {
        type: 'text',
        content:
          'Data availability (DA) is an inherent feature of all rollups, whether it is an optimistic- or zk-rollup. For zk-rollups, it is not a critical requirement for state updates to ensure the validity of L2 transaction data. Zk-rollups use ZKPs to cryptographically verify the correctness of off-chain transactions before they are committed to the L1 network. This setup guarantees that the state transitions are correct without relying heavily on DA for verification purposes, which means that state updates are immediately final upon verification by the L1 network. In contrast, optimistic rollups assume L2 transaction data are valid by default but rely on a challenge period during which anyone can submit proof of fraud. This mechanism makes DA crucial, as participants must access the L2 transaction data to identify and prove any invalid state transitions. While DA is important for overall system robustness, zk-rollups can maintain accurate state updates and security primarily through cryptographic proofs, reducing the immediate dependency on DA ',
      },
      {
        type: 'link',
        content: '[2]',
        href: 'https://ethereum.org/en/developers/docs/scaling/zk-rollups/',
      },
      {
        type: 'link',
        content: '[3]',
        href: 'https://www.kvarnx.com/content/what-is-the-difference-between-optimistic-rollups-and-zk-rollups',
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
          'The data used in the dashboard comes from multiple sources. On-chain data, including timestamps and transaction costs, is obtained through an RPC connection to the Ethereum network. Off-chain L2 transaction data is collected via RPC connections to various zk-rollup networks. Market price data is sourced from a reliable price index provider, supplying the daily average ETH market price.',
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
          'The data synchronization process takes around 5-10 minutes to fetch and store new data before repeating the cycle after a 20-minute interval. Every sixth cycle, the updated data is incorporated into the dashboard queries/materialized views (MV), graphs, and tables at midnight (UTC). The website uses a caching system, revalidating the data every hour. Visitors will initially see cached data when accessing the site, but subsequent visits within the hour will receive fresh data. Thus, the worst-case scenario for data freshness is approximately 4 hours and 20 minutes.',
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
        type: 'text',
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
          'For zk-rollups, the finality time is nearly instantaneous. The metric for finality time on the main page provides an overview of the average time from when a batch gets created until the proof of the L2 transaction data is generated on the L1 network.',
      },
      {
        type: 'text',
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
    id: 'published-transactions',
    sections: [
      { type: 'title', content: 'Published Transactions' },
      {
        type: 'text',
        content:
          'Published transactions refer to the size of L2 transaction data included in each proof submitted to the L1 network. In the context of zk-rollups, L2 transaction data are bundled together and published as proof to the L1 network. This process ensures that L2 transaction data are verified and committed on L1 while maintaining scalability and minimizing transaction costs.',
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
          'Users can view transaction costs in on-chain ETH or USD based on the market price. The cost in ETH is calculated from transaction data within the selected date range. The calculation involves multiplying the gas used by the gas price, then dividing by 10^18 to convert from wei to ETH.',
      },

      {
        type: 'formula',
        content: 'The formula is:',
        formula: 'Cost in ETH = (Gas Used * Gas Price) / 10¹⁸',
      },
      {
        type: 'text',
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
          'The average on-chain finality cost reflects the total expense of publishing each proof of L2 transaction data on the L1 network. This cost includes the gas fees required for proof submission to the L1 network to validate and update the state of the L2 transaction data, ensuring their security and transparency. However, it excludes individual transaction fees collected on the L2 network, providing a clear view of the expenses in securing the entire batch on the L1 network.',
      },
      {
        type: 'text',
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
          'DA: Data availability',
          'EVM: Ethereum Virtual Machine',
          'L1: Layer 1',
          'L2: Layer 2',
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
