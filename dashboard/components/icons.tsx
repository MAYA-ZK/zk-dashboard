function MenuIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      width="18"
      height="16"
      viewBox="0 0 18 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="18" height="2" fill="black" />
      <rect y="7" width="18" height="2" fill="black" />
      <rect y="14" width="18" height="2" fill="black" />
    </svg>
  )
}

function CloseIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      width="18"
      height="19"
      viewBox="0 0 18 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect y="8.72803" width="18" height="2" fill="black" />
      <rect
        x="8"
        y="18.728"
        width="18"
        height="2"
        transform="rotate(-90 8 18.728)"
        fill="black"
      />
    </svg>
  )
}

export function MenuIconDynamic({ isMenuOpen }: { isMenuOpen: boolean }) {
  return (
    <div className="relative">
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${isMenuOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'}`}
      >
        <MenuIcon />
      </div>
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${isMenuOpen ? 'rotate-45 opacity-100' : '-rotate-45 opacity-0'}`}
      >
        <CloseIcon />
      </div>
    </div>
  )
}
