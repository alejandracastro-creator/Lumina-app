export {};

declare global {
  interface Window {
    netlifyIdentity?: {
      init: () => void;
      on: (event: string, cb: (user?: any) => void) => void;
      open: (view?: 'login' | 'signup') => void;
      close: () => void;
      logout: () => Promise<void> | void;
      currentUser: () => any | null;
      login: (email: string, password: string, remember?: boolean) => Promise<any>;
    };
  }
}

