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
      // Target browser modern — bundle 10-15% lebih kecil
      target: 'es2020',
      chunkSizeWarningLimit: 1000,
      // Drop console & debugger otomatis di production
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Firebase dipecah — core dimuat duluan, db/storage lazy
              if (id.includes('firebase/app') || id.includes('firebase/auth')) {
                return 'vendor-firebase-core';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase-db';
              }
              // PDF (jarang dipakai — lazy chunk)
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }
              // Excel (jarang dipakai — lazy chunk)
              if (id.includes('xlsx')) {
                return 'vendor-excel';
              }
              // Charts
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              // Maps — Leaflet (hanya halaman SOS)
              if (id.includes('leaflet')) {
                return 'vendor-maps';
              }
              // Icons
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              // Animasi
              if (id.includes('motion')) {
                return 'vendor-animations';
              }
              return 'vendor-others';
            }
            // Komponen jadi chunk terpisah
            if (id.includes('src/components/')) {
              const parts = id.split('/');
              const file = parts[parts.length - 1];
              const name = file.split('.')[0];
              return `comp-${name.toLowerCase()}`;
            }
          }
        }
      },
      // Drop console & debugger di production build
      ...(isProd && {
        esbuildOptions: {
          drop: ['console', 'debugger'],
          legalComments: 'none',
        }
      }),
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
