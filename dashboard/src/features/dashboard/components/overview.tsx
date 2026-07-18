import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type OverviewPoint = { date: string; attacks: number }

export function Overview({ data }: { data: OverviewPoint[] }) {
  const chartData = data.map((point) => ({
    ...point,
    label: new Date(`${point.date}T00:00:00`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  }))

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}>
        <XAxis dataKey='label' stroke='#888888' fontSize={12} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} stroke='#888888' fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
        <Bar dataKey='attacks' name='Attacks' fill='currentColor' radius={[4, 4, 0, 0]} className='fill-primary' />
      </BarChart>
    </ResponsiveContainer>
  )
}
