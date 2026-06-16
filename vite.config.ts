import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const isProd = mode === 'production';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ""),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000,
      // Target browser modern — bundle lebih kecil
      target: 'es2020',
      // Drop console & debugger di production build otomatis
      ...(isProd && {
        minify: 'esbuild',
      }),
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Firebase dipecah jadi 2 chunk
              if (id.includes('firebase/app') || id.includes('firebase/auth')) {
                return 'vendor-firebase-core';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase-db';
              }
              // PDF tools (jarang dipakai, lazy load)
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }
              // Excel (jarang dipakai)
              if (id.includes('xlsx')) {
                return 'vendor-excel';
              }
              // Charts
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              // Maps (Leaflet)
              if (id.includes('leaflet')) {
                return 'vendor-maps';
              }
              // Icons
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              // Animasi
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              // React core
              if (id.includes('react-dom') || id.includes('react/')) {
                return 'vendor-react';
              }
              return 'vendor-misc';
            }
            // Setiap komponen jadi chunk terpisah
            if (id.includes('src/components/')) {
              const parts = id.split('/');
              const file = parts[parts.length - 1];
              const name = file.split('.')[0].toLowerCase();
              return `page-${name}`;
            }
          },
        },
      },
      // Drop console & debugger di production
      esbuildOptions: isProd ? {
        drop: ['console', 'debugger'],
        legalComments: 'none',
      } : {},
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
