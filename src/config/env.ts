// src/config/env.ts
export const API_BASE = __DEV__
    ? "http://192.168.15.15:3001"    // use o host que funcionou no /health
    : "https://SEU-BACKEND.onrender.com"; // quando fizer deploy
