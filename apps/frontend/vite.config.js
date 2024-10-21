import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import { biomePlugin } from '@pbr1111/vite-plugin-biome';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // eslint({
    //   lintOnStart: true,
    //   failOnError: mode === "production"
    // }),
    biomePlugin()
  ],
  // To automatically open the app in the browser whenever the server starts,
  // uncomment the following lines:
  // server: {
  //   open: true
  // }
}));
