import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:5180', viewport: { width: 390, height: 844 } },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5180', url: 'http://127.0.0.1:5180', reuseExistingServer: !process.env.CI },
})
