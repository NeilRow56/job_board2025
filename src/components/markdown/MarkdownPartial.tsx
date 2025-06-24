'use client'

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { Button } from '../ui/button'

export function MarkdownPartial({
  mainMarkdown,
  dialogMarkdown,
  dialogTitle
}: {
  mainMarkdown: ReactNode
  dialogMarkdown: ReactNode
  dialogTitle: string
}) {
  const [isOverflowing, setIsOverflowing] = useState(false)

  const markdownRef = useRef<HTMLDivElement>(null)
  function checkOverflow(node: HTMLDivElement) {
    setIsOverflowing(node.scrollHeight > node.clientHeight)
  }

  useEffect(() => {
    const controller = new AbortController()
    window.addEventListener(
      'resize',
      () => {
        if (markdownRef.current == null) return
        checkOverflow(markdownRef.current)
      },
      { signal: controller.signal }
    )

    return () => {
      controller.abort()
    }
  }, [])

  useLayoutEffect(() => {
    if (markdownRef.current == null) return
    checkOverflow(markdownRef.current)
  }, [])

  return (
    <>
      <div ref={markdownRef} className='relative max-h-[300px] overflow-hidden'>
        {mainMarkdown}
        {isOverflowing && (
          <div className='from-background pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent to-15%' />
        )}
      </div>

      {isOverflowing && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='ghost' className='-ml-3 underline'>
              Read More
            </Button>
          </DialogTrigger>
          <DialogContent className='flex max-h-[calc(100%-2rem)] flex-col overflow-hidden md:max-w-3xl lg:max-w-4xl'>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <div className='flex-1 overflow-y-auto'>{dialogMarkdown}</div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
