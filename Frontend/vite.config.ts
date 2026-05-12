import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  build: {
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter(
          (dep) =>
            !/assets\/js\/(?:admin|AboutPage|Blog|CheckoutPage|ComparePage|ContactPage|FAQPage|FavoritesPage|ForgotPassword|Login|NotFound|Order|PaymentSuccessPage|ProductDetailPage|ProfilePage|ResetPassword|ShopPage|Signup|TrackOrderPage)/.test(
              dep,
            ),
        ),
    },
    // Generate sourcemaps for production debugging (can be disabled for smaller builds)
    sourcemap: false,
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 800,
    
    // Target modern browsers for smaller bundle size
    target: "es2020",
    
    // Minification options
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.* in production
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
      format: {
        comments: false, // Remove comments
      },
    },
    
    // Rollup options for advanced bundling
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks(id) {
          if (id.includes("node_modules/@tanstack")) {
            return "vendor-query";
          }
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router-dom") ||
            id.includes("node_modules/scheduler")
          ) {
            return "vendor-react";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
        },
        
        // Asset file naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".");
          const ext = info?.[info.length - 1];
          
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name || "")) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.(woff2?|ttf|eot)$/i.test(assetInfo.name || "")) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          if (ext === "css") {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
        
        // Chunk file naming
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Report compressed size (can be disabled for faster builds)
    reportCompressedSize: true,
    
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
    ],
    exclude: ["@vite/client", "@vite/env"],
  },
  
  // Preview server configuration (for testing production builds locally)
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
  },
});
