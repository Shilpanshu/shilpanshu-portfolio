/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SAM_API_URL: string
    readonly VITE_GEMINI_VTON_API_KEY: string
    readonly VITE_GEMINI_API_KEY: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
