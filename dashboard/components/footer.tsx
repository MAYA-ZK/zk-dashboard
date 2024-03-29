import Rockaway from '@/public/rockaway-logo.svg'
import Link from 'next/link'

export function Footer() {
  return (
    <div className="flex w-full max-w-screen-2xl justify-center gap-x-36 pb-8 pt-48">
      <Link
        href="https://rockawayx.com/"
        target="_blank"
        className="flex items-center gap-x-2"
      >
        <p className="font-light">Powered by</p>
        <Rockaway className="size-12 text-primary" />
      </Link>

      <p className="flex items-center gap-x-2 font-light ">
        Built by{' '}
        <Link
          href="https://maya-zk.com"
          target="_blank"
          className="underline hover:text-primary"
        >
          Maya ZK
        </Link>
      </p>
    </div>
  )
}
