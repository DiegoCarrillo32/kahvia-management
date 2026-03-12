import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Auto cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_FIREBASE_API_KEY: 'test-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '123',
      VITE_FIREBASE_APP_ID: 'test-app-id',
      VITE_ALLOWED_EMAIL: 'test@kahvia.com',
    },
  },
});

// Mock window.confirm
vi.stubGlobal('confirm', vi.fn(() => true));

// Mock window.open
vi.stubGlobal('open', vi.fn());
