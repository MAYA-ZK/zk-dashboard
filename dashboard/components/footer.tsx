import Rockaway from '@/public/rockaway-logo.svg'
import Link from 'next/link'

export function Footer() {
  return (
    <div className="flex w-full max-w-screen-2xl items-end justify-center gap-x-36 pb-8 pt-48 font-bold">
      <div className="flex items-end gap-x-2 font-medium">
        <p className="-mb-1 font-medium">Powered by</p>
        <Link href="https://rockawayx.com/" target="_blank">
          <Rockaway className="h-9 w-12 text-primary" />
        </Link>
      </div>

      <div className="-mb-1 flex items-end gap-x-2">
        <p className="font-medium">Built by </p>
        <Link
          href="https://maya-zk.com"
          target="_blank"
          className="underline hover:text-primary "
        >
          Maya ZK
        </Link>
      </div>
    </div>
  )
}
