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
                    <p className="text-2xl font-semibold">{section.content}</p>
                  )
                case 'text':
                  return <span key={index}>{section.content}</span>
                case 'link':
                  return (
                    <span>
                      <Link
                        target="_blank"
                        className="font-semibold text-primary hover:underline"
                        href={section.href!}
                        key={index}
                      >
                        {section.content}
                      </Link>
                    </span>
                  )
                case 'formula':
                  return (
                    <div className="py-4">
                      <p className="pb-2 text-base">{section.content}</p>
                      <p className="text-center font-mono text-base">
                        {section.formula}
                      </p>
                    </div>
                  )
                case 'list':
                  return (
                    <div className="py-4">
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
