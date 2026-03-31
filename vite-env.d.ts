/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TYPE: string;
  readonly VITE_APP_INTEGRATION: string;
  readonly VITE_API_URL: string;
  // readonly VITE_APP_ASSETS_BASE_URL: string;
  // readonly VITE_APP_EXTENSIONS_BASE_URL: string;

  readonly VITE_SAAS_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
