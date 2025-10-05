// src/lib/bus.ts
import EventEmitter from "eventemitter3";
export const bus = new EventEmitter<{
    "metrics:refresh": () => void;
}>();
