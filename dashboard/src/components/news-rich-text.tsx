import { useEffect, useRef } from 'react'

function safeHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
}

export function NewsRichTextEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value)
      ref.current.innerHTML = value
  }, [value])
  return (
    <div className='rounded-md border'>
      <div className='flex gap-1 border-b p-2'>
        <button
          type='button'
          className='rounded px-2 font-bold hover:bg-muted'
          onMouseDown={(e) => {
            e.preventDefault()
            document.execCommand('bold')
          }}
        >
          B
        </button>
        <button
          type='button'
          className='rounded px-2 italic hover:bg-muted'
          onMouseDown={(e) => {
            e.preventDefault()
            document.execCommand('italic')
          }}
        >
          I
        </button>
        <button
          type='button'
          className='rounded px-2 underline hover:bg-muted'
          onMouseDown={(e) => {
            e.preventDefault()
            document.execCommand('underline')
          }}
        >
          U
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className='min-h-40 p-3 text-sm outline-none'
        onInput={(e) => onChange(safeHtml(e.currentTarget.innerHTML))}
        data-placeholder='Content...'
      />
    </div>
  )
}

export function NewsRichText({ html }: { html: string }) {
  return (
    <div
      className='prose prose-sm dark:prose-invert max-w-none'
      dangerouslySetInnerHTML={{ __html: safeHtml(html) }}
    />
  )
}
