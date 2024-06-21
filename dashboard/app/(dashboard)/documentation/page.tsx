import Link from 'next/link'

import { DOCUMENTATION } from './documentation'

export default async function Page() {
  return (
    <div className="flex w-full justify-center pt-18">
      <div className="flex max-w-lg flex-col gap-4">
        <p className="text-4xl font-semibold">Maya-ZK Dashboard – FAQ</p>
        <p className="text-base">
          Greetings, and welcome to the Maya-ZK dashboard FAQ.
        </p>

        {DOCUMENTATION.map((block) => (
          <div key={block.id} id={block.id} className="scroll-my-20">
            {block.sections.map((section, index) => {
              switch (section.type) {
                case 'title':
                  return (
                    <p
                      key={`section-${index}`}
                      className="text-2xl font-semibold"
                    >
                      {section.content}
                    </p>
                  )
                case 'text':
                  return <span key={`section-${index}`}>{section.content}</span>
                case 'paragraph-text':
                  return (
                    <p className="pt-2" key={`section-${index}`}>
                      {section.content}
                    </p>
                  )
                case 'link':
                  return (
                    <span key={`section-${index}`}>
                      <Link
                        target="_blank"
                        className="font-semibold text-primary hover:underline"
                        href={section.href}
                        key={index}
                      >
                        {section.content}
                      </Link>
                    </span>
                  )
                case 'formula':
                  return (
                    <div key={`section-${index}`} className="py-4">
                      <p className="pb-2 text-base">{section.content}</p>
                      <p className="text-center font-mono text-base">
                        {section.formula}
                      </p>
                    </div>
                  )
                case 'list':
                  return (
                    <div key={`section-${index}`} className="pb-4">
                      <p>{section.content}</p>
                      <ol className="list-disc px-4 pt-2">
                        {section.listItems?.map((item, listItemIndex) => (
                          <li key={listItemIndex}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )
                default:
                  return null
              }
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
