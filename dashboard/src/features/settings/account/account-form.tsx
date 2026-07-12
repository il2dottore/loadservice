import { z } from 'zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useProfile, useUpdateProfile } from '@/features/auth/api/auth-hooks'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const accountFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Please enter your first name.')
    .max(50, 'First name must not be longer than 50 characters.'),
  lastName: z.string().min(1, 'Please enter your last name.').max(50),
  username: z.string().min(2).max(50),
  email: z.email(),
  phoneNumber: z.string().max(20).optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

// This can come from your database or API.
const defaultValues: Partial<AccountFormValues> = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phoneNumber: '',
}

export function AccountForm() {
  const { auth } = useAuthStore()
  const { data: profile } = useProfile(auth.accessToken)
  const updateProfile = useUpdateProfile(auth.accessToken)
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!profile) return
    form.reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      username: profile.username,
      email: profile.email,
      phoneNumber: profile.phoneNumber ?? '',
    })
  }, [form, profile])

  async function onSubmit(data: AccountFormValues) {
    if (!profile) return
    try {
      const updated = await updateProfile.mutateAsync({
        ...data,
        phoneNumber: data.phoneNumber || null,
      })
      auth.setUser(updated)
      toast.success('Account updated.')
    } catch {
      // Global mutation error handling displays the server message.
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='firstName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input placeholder='First name' {...field} />
              </FormControl>
              <FormDescription>
                Your first name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='lastName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl><Input placeholder='Last name' {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormDescription>
                Your unique account name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name='email' render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type='email' {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name='phoneNumber' render={({ field }) => (
          <FormItem><FormLabel>Phone number</FormLabel><FormControl><Input type='tel' {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <AccountAccess profile={profile} />
        <Button type='submit' disabled={updateProfile.isPending || !profile}>
          Update account
        </Button>
      </form>
    </Form>
  )
}

function AccountAccess({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>['data']> | undefined }) {
  if (!profile) return null
  return <section className='space-y-4 border-t pt-6'>
    <div><h3 className='font-medium'>Access</h3><p className='text-sm text-muted-foreground'>Roles, permissions, and plan features assigned to this account.</p></div>
    <AccessList label='Roles' values={profile.roles?.map((role) => role.name) ?? []} />
    <AccessList label='Permissions' values={profile.permissions ?? []} />
    <div className='space-y-2'><p className='text-sm font-medium'>Plans and features</p>{profile.plans?.length ? profile.plans.map((plan) => <div key={plan.id} className='space-y-2 rounded-md border p-3'><Badge>{plan.name}</Badge><div className='flex flex-wrap gap-2'>{plan.planFeatures.map((feature) => <Badge key={feature.id} variant='secondary'>{feature.code}</Badge>)}</div></div>) : <p className='text-sm text-muted-foreground'>No plan assigned.</p>}</div>
  </section>
}

function AccessList({ label, values }: { label: string; values: string[] }) {
  return <div className='space-y-2'><p className='text-sm font-medium'>{label}</p><div className='flex flex-wrap gap-2'>{values.length ? values.map((value) => <Badge key={value} variant='secondary'>{value}</Badge>) : <span className='text-sm text-muted-foreground'>None assigned.</span>}</div></div>
}
