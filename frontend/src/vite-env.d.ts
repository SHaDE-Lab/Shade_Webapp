/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ARC_GIS_API_KEY: string
  }

interface ImportMeta {
    readonly env: ImportMetaEnv
  }
