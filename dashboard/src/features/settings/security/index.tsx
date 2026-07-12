import { ContentSection } from '../components/content-section'
import { SecurityPanel } from './security-panel'

export function SettingsSecurity() {
  return (
    <ContentSection
      title='Security'
      desc='Manage API keys and review devices that are currently signed in.'
      contentClassName='lg:max-w-none'
    >
      <SecurityPanel />
    </ContentSection>
  )
}
