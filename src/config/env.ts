// src/config/env.ts
import { Platform } from "react-native";

const LOCAL = Platform.select({
    ios: "http://localhost:3001",     // iOS Simulator
    android: "http://10.0.2.2:3001",  // Android Emulator
    default: "http://192.168.15.15:3001", // dispositivo físico na rede
});

export const API_BASE =
    __DEV__ ? LOCAL! : "https://SEU-BACKEND.onrender.com";
