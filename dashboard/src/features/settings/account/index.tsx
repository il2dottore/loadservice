import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='Profile and account'
      desc='Manage your personal details and review your account access.'
    >
      <AccountForm />
    </ContentSection>
  )
}
