import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.salahtracker.app',
  appName: 'Salah Tracker',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      presentationOptions: ['banner', 'sound', 'list'],
    },
  },
}

export default config
