'use client'

import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import { Switch } from '@nextui-org/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Switch
      classNames={{
        wrapper: 'bg-slate-200',
        endContent: 'text-black',
      }}
      color="default"
      defaultSelected={resolvedTheme === 'dark'}
      onValueChange={(checked) => {
        setTheme(checked ? 'dark' : 'light')
      }}
      isSelected={resolvedTheme === 'dark'}
      startContent={<MoonIcon />}
      endContent={<SunIcon />}
    />
  )
}
