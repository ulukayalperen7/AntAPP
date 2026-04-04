import { getCurrentUser } from '@/features/account/actions'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
  let user = null
  try {
    user = await getCurrentUser()
  } catch { /* ignore */ }

  return <SettingsClient user={user} />
}
