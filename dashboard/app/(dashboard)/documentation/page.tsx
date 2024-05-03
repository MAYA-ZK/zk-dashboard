import type { DocSection } from './documentation'
import { DOCUMENTATION } from './documentation'

function DocumentationSection({ section }: { section: DocSection }) {
  return (
    <section id={section.title} className="grow">
      <h1 className="text-[36px] font-semibold">{section.title}</h1>
      {/* <p>{section.description}</p> */}
      <p className="pt-6">{section.body}</p>
    </section>
  )
}

export default async function Page() {
  return (
    <div className="flex w-full justify-center pt-18">
      <div className="flex max-w-lg flex-col items-center gap-4">
        {Object.values(DOCUMENTATION).map((section) => (
          <DocumentationSection key={section.title} section={section} />
        ))}
      </div>
    </div>
  )
}
