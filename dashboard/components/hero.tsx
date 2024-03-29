import TrippleMLogo from '@/public/tripple-m-logo.svg'
import type { ComponentProps } from 'react'
import React from 'react'

export function Hero(props: ComponentProps<'div'>) {
  return (
    <div className="relative w-full" {...props}>
      <TrippleMLogo className="flex size-full" />
      <div className="absolute top-0 flex size-full items-center justify-center">
        <p className="max-w-5xl text-center text-[48px]">
          Insight into Invisibility: Your Dashboard for{' '}
          <span className="font-bold">Zero-Knowledge</span> Proofs
        </p>
      </div>
    </div>
  )
}
