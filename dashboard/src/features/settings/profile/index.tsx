import { ContentSection } from '../components/content-section'
import { AccountForm } from '../account/account-form'

export function SettingsProfile() {
  return (
    <ContentSection
      title='Profile and account'
      desc='Manage your personal details and review your account access.'
    >
      <AccountForm />
    </ContentSection>
  )
}
