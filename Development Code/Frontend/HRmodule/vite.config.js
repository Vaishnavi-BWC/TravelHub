// vite.config.js

import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

import { resolve } from "path";
 
export default defineConfig({

  plugins: [react()],

  build: {

    rollupOptions: {

      input: { main: resolve(__dirname, "index.html") },

    },

  },

  server: {

    host: "bwc-90.brainwaveconsulting.co.in",

    port: 3001, // change to 3001 for dashboard

    allowedHosts: [

      "bwc-90.brainwaveconsulting.co.in",

      "bwc-97.brainwaveconsulting.co.in",

    ],

    cors: true,

  },

  resolve: {

    alias: {

      "@": resolve(__dirname, "src"),

    },

  },

});

 