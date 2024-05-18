export interface DocSection {
  title: string
  description?: string
  body?: string
}

export type Documentation = Record<string, DocSection>

export const DOCUMENTATION: Documentation = {
  title: {
    title: 'Documentation Page',
    description: 'This is the documentation page',
    body: 'This blog post series was written for a curious reader who wants to understand what goes on in the Plonk protocol. After reading this series you should not only understand how it works but also why it works. If you are not interested in details, Dan Boneh has an amazing lecture on overview of Plonk as zk-Whiteboard Session. On the other hand, if you want to read something more general about Plonk derivatives there is a wonderful blog from Scroll on anatomy of PLONK-based proof. ',
  },
  section1: {
    title: 'Introduction',
    description: 'This is the introduction',
    body: 'This blog post series was written for a curious reader who wants to understand what goes on in the Plonk protocol. After reading this series you should not only understand how it works but also why it works. If you are not interested in details, Dan Boneh has an amazing lecture on overview of Plonk as zk-Whiteboard Session. On the other hand, if you want to read something more general about Plonk derivatives there is a wonderful blog from Scroll on anatomy of PLONK-based proof. ',
  },
  section2: {
    title: 'FAQ',
    description: "This is the FAQ's description",
    body: 'This blog post series was written for a curious reader who wants to understand what goes on in the Plonk protocol. After reading this series you should not only understand how it works but also why it works. If you are not interested in details, Dan Boneh has an amazing lecture on overview of Plonk as zk-Whiteboard Session. On the other hand, if you want to read something more general about Plonk derivatives there is a wonderful blog from Scroll on anatomy of PLONK-based proof. ',
  },
}
