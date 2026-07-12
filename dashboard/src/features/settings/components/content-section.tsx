import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

type ContentSectionProps = {
  title: string
  desc: string
  children: React.JSX.Element
  contentClassName?: string
}

export function ContentSection({
  title,
  desc,
  children,
  contentClassName,
}: ContentSectionProps) {
  return (
    <div className='flex min-w-0 flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>{title}</h3>
        <p className='text-sm text-muted-foreground'>{desc}</p>
      </div>
      <Separator className='my-4 flex-none' />
      <div className='faded-bottom h-full w-full min-w-0 overflow-y-auto scroll-smooth pe-2 pb-12 sm:pe-4'>
        <div className={cn('-mx-1 min-w-0 px-1.5 lg:max-w-xl', contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  )
}
