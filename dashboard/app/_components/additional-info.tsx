'use client'

export type AdditionalInfoData = { label: string; value: string }

export function AdditionalInfo({
  label,
  data,
}: {
  label?: string
  data: Array<AdditionalInfoData>
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && <h6 className="font-bold">{label}</h6>}
      <ul>
        {data.map((info) => (
          <li
            key={info.value}
            className="flex justify-between gap-4 text-nowrap"
          >
            <span className="font-bold">{info.label}:</span>
            <span className="tabular-nums">{info.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
