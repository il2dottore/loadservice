import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CircleHelp, History, RefreshCw, SlidersHorizontal, Square } from 'lucide-react'
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
import { fetchAttacks, sendAttack, stopAttack } from '@/services/attack/attack.service'

type AttackLayer = 'LAYER_4' | 'LAYER_7'

export function Hub() {
  const { auth } = useAuthStore()
  const { data: profile } = useProfile(auth.accessToken)
  const { data: methods } = useQuery({ queryKey: ['hub', 'methods'], queryFn: fetchAttackMethods })
  const { data: attacks = [], refetch: refetchAttacks } = useQuery({
    queryKey: ['hub', 'attacks'],
    queryFn: fetchAttacks,
    refetchInterval: 5000,
  })
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const [method, setMethod] = useState('')
  const [layer, setLayer] = useState<AttackLayer>('LAYER_4')
  const [advanced, setAdvanced] = useState(true)
  const [target, setTarget] = useState('')
  const [duration, setDuration] = useState('120')
  const [port, setPort] = useState('')
  const [ppsLimit, setPpsLimit] = useState('')
  const [rateLimit, setRateLimit] = useState('')
  const [postData, setPostData] = useState('')
  const [requestMethod, setRequestMethod] = useState('GET')
  const attackMutation = useMutation({
    mutationFn: sendAttack,
    onSuccess: () => refetchAttacks(),
  })
  const stopMutation = useMutation({
    mutationFn: stopAttack,
    onSuccess: () => refetchAttacks(),
  })

  const remainingSeconds = (attack: (typeof attacks)[number]) => {
    if (!['QUEUED', 'SCHEDULED', 'RUNNING'].includes(attack.status)) return 0
    const started = new Date(attack.createdAt).getTime()
    return Math.max(0, attack.duration - Math.floor((now - started) / 1000))
  }

  const hasVipAccess = profile?.plans?.some((plan) =>
    plan.planFeatures?.some((feature) => feature.id === 'VIP_ACCESS'),
  ) ?? false
  const layerMethods = methods?.filter((item) => item.osiLayer === layer) ?? []
  const selectedMethod = layerMethods.some((item) => item.name === method)
    ? method
    : layerMethods[0]?.name || 'UDP (Raw UDP flood)'
  const selectedMethodId = layerMethods.find((item) => item.name === selectedMethod)?.id
  const clearForm = () => {
    setTarget(''); setDuration('120'); setPort(''); setPpsLimit(''); setRateLimit(''); setPostData('')
  }
  const submitAttack = () => attackMutation.mutate({
    target, duration: Number(duration), methodId: selectedMethodId, userId: auth.user?.id,
    port: port ? Number(port) : undefined, ppsLimit: ppsLimit ? Number(ppsLimit) : undefined,
    rateLimit: rateLimit ? Number(rateLimit) : undefined,
    requestMethod: layer === 'LAYER_7' ? requestMethod : undefined,
    postData: layer === 'LAYER_7' && requestMethod === 'POST' ? postData : undefined,
  })

  return (
    <>
      <Header fixed><div className='ms-auto flex items-center gap-2'><ThemeSwitch /><ProfileDropdown /></div></Header>
      <Main fluid className='flex flex-1 flex-col gap-3 bg-background px-2 py-3 sm:px-3'>
        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex rounded-full bg-card p-1 shadow-sm'>
            <Button variant={layer === 'LAYER_4' ? 'secondary' : 'ghost'} onClick={() => { setLayer('LAYER_4'); setMethod('') }} className='h-8 rounded-full px-4 text-xs'>Layer 4</Button>
            <Button variant={layer === 'LAYER_7' ? 'secondary' : 'ghost'} onClick={() => { setLayer('LAYER_7'); setMethod('') }} className='h-8 rounded-full px-4 text-xs'>Layer 7</Button>
          </div>
          <div className='ml-auto flex items-center gap-2'>
            <Button variant='outline' size='icon' className='size-9 rounded-full bg-card'><History className='size-4' /></Button>
            <Button variant='outline' size='icon' className='size-9 rounded-full bg-card'><RefreshCw className='size-4' /></Button>
          </div>
        </div>

        <div className='grid min-h-0 flex-1 gap-4 lg:grid-cols-[385px_minmax(0,1fr)]'>
          <section className='space-y-3 rounded-lg border bg-card p-4 shadow-sm'>
            <div className='space-y-3 pt-2'>
              <div className='space-y-1'><Label>Method</Label><select value={selectedMethod === 'UDP (Raw UDP flood)' && !layerMethods.length ? '' : selectedMethod} onChange={(e) => setMethod(e.target.value)} className='h-9 w-full rounded-md border bg-card px-3 text-xs'>{layerMethods.map((item) => <option key={item.id} value={item.name} disabled={item.vipAccess && !hasVipAccess}>{item.name}{item.vipAccess && !hasVipAccess ? ' (VIP access required)' : ''}</option>)}{!layerMethods.length && <option value=''>No methods available</option>}</select></div>
              <div className='space-y-1'><Label>Target</Label><Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder='ex.: 1.1.1.1,example.net' /></div>
              <div className='space-y-1'><Label>Testing time</Label><Input type='number' min={1} value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
              {layer === 'LAYER_4' && <div className='space-y-1'><Label><CircleHelp className='mr-1 inline size-3 text-muted-foreground' />Port</Label><Input type='number' min={1} max={65535} value={port} onChange={(e) => setPort(e.target.value)} placeholder='ex.: 443' /></div>}
              <div className='rounded-md border border-dashed bg-card p-1.5'>
                <Button variant='secondary' className='h-9 w-full text-xs' onClick={() => setAdvanced(!advanced)}><SlidersHorizontal className='mr-2 size-3' />{advanced ? 'Hide' : 'Show'} Advanced Options</Button>
                {advanced && <div className='space-y-3 px-1 pb-1 pt-3'>
                  {layer === 'LAYER_4' ? <>
                    <div className='space-y-1'><Label>PPS Limit (optional)</Label><Input value={ppsLimit} onChange={(e) => setPpsLimit(e.target.value)} placeholder='0 for no pps limit' /></div>
                  </> : <>
                    <div className='space-y-1'><Label>Rate limit</Label><Input value={rateLimit} onChange={(e) => setRateLimit(e.target.value)} placeholder='ex.: 100' /></div>
                    <div className='space-y-1'><Label>Request method</Label><select value={requestMethod} onChange={(e) => setRequestMethod(e.target.value)} className='h-9 w-full rounded-md border bg-card px-3 text-xs'><option>GET</option><option>POST</option><option>HEAD</option><option>OPTIONS</option></select></div>
                    {requestMethod === 'POST' && <div className='space-y-1'><Label>Post data</Label><Input value={postData} onChange={(e) => setPostData(e.target.value)} placeholder='Request body' /></div>}
                  </>}
                </div>}
              </div>
              <div className='flex gap-2 pt-1'><Button variant='secondary' onClick={clearForm} className='w-24 rounded-full text-xs'>Clear all</Button><Button disabled={!target || attackMutation.isPending} onClick={submitAttack} className='flex-1 rounded-full text-xs'>{attackMutation.isPending ? 'Sending...' : 'Start Attack'}</Button></div>
            </div>
          </section>
          <section className='min-w-0 rounded-lg border bg-card p-4 shadow-sm'>
            <div className='grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] rounded-md bg-muted px-3 py-3 text-[10px] font-medium text-muted-foreground'>
              <span>Address</span><span>Method</span><span>Countdown</span><span>Status</span><span>Action</span>
            </div>
            <div className='divide-y'>
              {attacks.map((attack) => (
                <div key={attack.id} className='grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] items-center gap-2 px-3 py-3 text-xs'>
                  <span className='truncate'>{attack.target}</span>
                  <span className='truncate'>{methods?.find((item) => item.id === attack.methodId)?.name ?? '—'}</span>
                  <span>{remainingSeconds(attack)}s</span>
                  <span className='font-medium'>{attack.status}</span>
                  <Button variant='destructive' size='sm' className='h-7 px-2 text-[10px]' disabled={!['QUEUED', 'SCHEDULED', 'RUNNING'].includes(attack.status) || stopMutation.isPending} onClick={() => stopMutation.mutate(attack.id)}><Square className='mr-1 size-3 fill-current' />Stop</Button>
                </div>
              ))}
              {!attacks.length && <div className='px-3 py-6 text-xs text-muted-foreground'>No attacks yet</div>}
            </div>
          </section>
        </div>
      </Main>
    </>
  )
}
