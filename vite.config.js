import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  console.log('Vite Mode:', mode);
  console.log('Environment Variables:', {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL ? 'Set' : 'Not Set',
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not Set',
    VITE_API_URL: env.VITE_API_URL ? 'Set' : 'Not Set',
  });

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@utils': path.resolve(__dirname, './src/lib'),
        '@contexts': path.resolve(__dirname, './src/contexts'),
        '@services': path.resolve(__dirname, './src/services'),
      },
    },
    server: {
      port: 3000,
      open: true,
      host: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@heroicons/react', 'lucide-react', 'lottie-react'],
            utils: ['clsx', 'tailwind-merge'],
          },
        },
      },
      ...(mode === 'production' && {
        base: 'https://cdn.yourdomain.com/',
        assetsDir: 'assets',
        sourcemap: true,
      }),
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@heroicons/react',
        'lucide-react',
        'clsx',
        'tailwind-merge',
        'lottie-react',
      ],
    },
  };
});