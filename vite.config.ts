import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

function firebaseToGatewayPlugin() {
  return {
    name: 'firebase-to-gateway',
    enforce: 'pre' as const,
    resolveId(source: string, importer: string | undefined) {
      if (source === 'firebase/firestore' && importer) {
        if (
          importer.includes('dbGateway.ts') || 
          importer.includes('firebaseFirestoreAlias.ts') || 
          importer.includes('firebase.ts')
        ) {
          return null;
        }
        return path.resolve(__dirname, './src/lib/firebaseFirestoreAlias.ts');
      }
      return null;
    }
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [firebaseToGatewayPlugin(), react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ""),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('jspdf') || id.includes('jspdf-autotable') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }
              if (id.includes('xlsx')) {
                return 'vendor-excel';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              if (id.includes('leaflet')) {
                return 'vendor-maps';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('motion')) {
                return 'vendor-animations';
              }
              return 'vendor-others';
            }
            if (id.includes('src/components/')) {
              const parts = id.split('/');
              const file = parts[parts.length - 1];
              const name = file.split('.')[0];
              return `comp-${name.toLowerCase()}`;
            }
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
