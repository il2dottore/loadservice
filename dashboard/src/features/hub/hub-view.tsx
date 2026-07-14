import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CircleHelp, History, RefreshCw, SlidersHorizontal } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth.store'
import { useProfile } from '@/features/auth/hooks/auth-hooks'
import { fetchAttackMethods } from '@/services/attack/method.service'

type AttackLayer = 'LAYER_4' | 'LAYER_7'

export function Hub() {
  const { auth } = useAuthStore()
  const { data: profile } = useProfile(auth.accessToken)
  const { data: methods } = useQuery({ queryKey: ['hub', 'methods'], queryFn: fetchAttackMethods })
  const [method, setMethod] = useState('')
  const [layer, setLayer] = useState<AttackLayer>('LAYER_4')
  const [advanced, setAdvanced] = useState(true)
  const [target, setTarget] = useState('')
  const [requestMethod, setRequestMethod] = useState('GET')

  const layerMethods = methods?.filter((item) => item.osiLayer === layer) ?? []
  const selectedMethod = method || layerMethods[0]?.name || 'UDP (Raw UDP flood)'
  const onlineUsers = profile ? 284 : 0

  return (
    <>
      <Header fixed><ThemeSwitch /><ProfileDropdown /></Header>
      <Main className='flex flex-1 flex-col gap-3 bg-background px-2 py-3 sm:px-3'>
        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex rounded-full bg-card p-1 shadow-sm'>
            <Button variant={layer === 'LAYER_4' ? 'secondary' : 'ghost'} onClick={() => { setLayer('LAYER_4'); setMethod('') }} className='h-8 rounded-full px-4 text-xs'>Layer 4</Button>
            <Button variant={layer === 'LAYER_7' ? 'secondary' : 'ghost'} onClick={() => { setLayer('LAYER_7'); setMethod('') }} className='h-8 rounded-full px-4 text-xs'>Layer 7</Button>
          </div>
          <div className='rounded-full bg-card px-5 py-2 text-xs text-muted-foreground shadow-sm'>
            occupancy <span className='font-semibold text-foreground'>26%</span> <span className='text-amber-400'>✳</span>
          </div>
          <div className='ml-auto flex items-center gap-2'>
            <Button variant='outline' size='icon' className='size-9 rounded-full bg-card'><History className='size-4' /></Button>
            <Button variant='outline' size='icon' className='size-9 rounded-full bg-card'><RefreshCw className='size-4' /></Button>
          </div>
        </div>

        <div className='grid min-h-0 flex-1 gap-4 lg:grid-cols-[385px_minmax(0,1fr)]'>
          <section className='space-y-3'>
            <div className='rounded-sm bg-card px-3 py-2 text-[11px] text-muted-foreground shadow-sm'><span className='mr-1 text-emerald-500'>●</span>{onlineUsers} users online on this page</div>
            <div className='rounded-sm bg-card px-3 py-3 text-[11px] text-muted-foreground shadow-sm'><CircleHelp className='mr-2 inline size-3 text-muted-foreground' />If you need help, contact our support and ask your question, we will try to solve it as soon as possible.</div>
            <div className='space-y-3 pt-2'>
              <div className='space-y-1'><Label>Method</Label><select value={method || layerMethods[0]?.name || ''} onChange={(e) => setMethod(e.target.value)} className='h-9 w-full rounded-md border bg-card px-3 text-xs'>{layerMethods.map((item) => <option key={item.id}>{item.name}</option>)}{!layerMethods.length && <option value=''>No methods available</option>}</select></div>
              <div className='space-y-1'><Label>Target</Label><Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder='ex.: 1.1.1.1,example.net' /></div>
              <div className='space-y-1'><Label>Testing time</Label><Input defaultValue='120' /></div>
              <div className='space-y-1'><Label><CircleHelp className='mr-1 inline size-3 text-muted-foreground' />Port(s)</Label><Input placeholder='ex.: 80,443' /></div>
              <div className='rounded-md border border-dashed bg-card p-1.5'>
                <Button variant='secondary' className='h-9 w-full text-xs' onClick={() => setAdvanced(!advanced)}><SlidersHorizontal className='mr-2 size-3' />{advanced ? 'Hide' : 'Show'} Advanced Options</Button>
                {advanced && <div className='space-y-3 px-1 pb-1 pt-3'>
                  {layer === 'LAYER_4' ? <>
                    <div className='space-y-1'><Label>PPS Limit (optional)</Label><Input placeholder='0 for no pps limit' /></div>
                  </> : <>
                    <div className='space-y-1'><Label>Rate limit</Label><Input placeholder='ex.: 100' /></div>
                    <div className='space-y-1'><Label>Request method</Label><select value={requestMethod} onChange={(e) => setRequestMethod(e.target.value)} className='h-9 w-full rounded-md border bg-card px-3 text-xs'><option>GET</option><option>POST</option><option>HEAD</option><option>OPTIONS</option></select></div>
                    {requestMethod === 'POST' && <div className='space-y-1'><Label>Post data</Label><Input placeholder='Request body' /></div>}
                  </>}
                </div>}
              </div>
              <div className='flex gap-2 pt-1'><Button variant='secondary' className='w-24 rounded-full text-xs'>Clear all</Button><Button disabled={!target} className='flex-1 rounded-full text-xs'>Start Attack</Button></div>
            </div>
          </section>
          <section className='min-w-0'>
            <div className='mb-3 flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs text-muted-foreground shadow-sm'>⌕ <span>Search by address or method</span></div>
            <div className='grid grid-cols-3 rounded-md bg-muted px-3 py-3 text-[10px] font-medium text-muted-foreground'><span>Address</span><span>Method</span><span>Testing time</span></div>
            <div className='mt-2 text-xs text-muted-foreground'>{target && `${target} · ${selectedMethod}`}</div>
          </section>
        </div>
      </Main>
    </>
  )
}
