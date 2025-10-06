// src/lib/bus.ts
import EventEmitter from "eventemitter3";

export const bus = new EventEmitter<{
    // já existentes
    "metrics:refresh": () => void;
    "community:commentAdded": (postId: string) => void;

    // novos eventos usados pelo Perfil
    "community:postAdded": (postId: string) => void; // um post novo meu (galeria)
    "events:joined": (eventId: string) => void;      // entrei em evento (comunidades)
    "profile:friendsChanged": () => void;            // contador de amigos mudou
}>();
