// src/services/community.ts
import { getJSON, postJSON } from "@/lib/api";
import type { ImageSourcePropType } from "react-native";

/** Domínio do post de comunidade */
export type CommunityPost = {
    id: string;
    author: string;
    authorAvatarColor?: string;
    createdAtISO: string;

    content: string;
    activity: string; // pode virar ActivityKey
    durationMin: number;
    mood: "feliz" | "neutro" | "cansado" | "orgulhoso" | "relaxado";

    image?: ImageSourcePropType; // require(...) ou { uri }
    imageUri?: string; // galeria/URL

    likes: number;
    comments: number; // contador
    likedByMe: boolean;
};

export type Comment = {
    id: string;
    postId: string;
    author: string;
    authorAvatarColor?: string;
    text: string;
    createdAtISO: string;
};

export type CreatePostDTO = {
    content: string;
    activity: string;
    durationMin: number;
    mood: CommunityPost["mood"];
    imageUri?: string;
};

let memStore: CommunityPost[] | null = null;
let memComments: Record<string, Comment[]> | null = null;

// throttle para evitar spam no console
let lastWarnAt = 0;
function warnOnce(msg: string) {
    const now = Date.now();
    if (now - lastWarnAt > 1500) {
        console.warn(msg);
        lastWarnAt = now;
    }
}

// ---------- API ----------
export async function fetchPosts(): Promise<CommunityPost[]> {
    try {
        const data = await getJSON<CommunityPost[]>("/community/posts");
        return data;
    } catch (e: any) {
        warnOnce("[community] falling back to seed: status 404");
        ensureSeed();
        return [...(memStore as CommunityPost[])].sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1));
    }
}

export async function createPost(dto: CreatePostDTO, localImage?: ImageSourcePropType): Promise<CommunityPost> {
    try {
        const created = await postJSON<CommunityPost>("/community/posts", dto);
        return created;
    } catch {
        warnOnce("[community] falling back to seed: status 404");
        ensureSeed();
        const item: CommunityPost = {
            id: cryptoRandomId(),
            author: "Você",
            authorAvatarColor: "#7C4DFF",
            createdAtISO: new Date().toISOString(),
            content: dto.content,
            activity: dto.activity,
            durationMin: dto.durationMin,
            mood: dto.mood,
            image: localImage,
            imageUri: dto.imageUri,
            likes: 0,
            comments: 0,
            likedByMe: false,
        };
        memStore!.unshift(item);
        memComments![item.id] = [];
        // avisa telas (galeria/perfil)
        const { bus } = require("@/lib/bus");
        bus.emit("community:postAdded");
        return item;
    }
}

export async function likePost(id: string): Promise<void> {
    try {
        await postJSON(`/community/posts/${id}/like`, {});
    } catch {
        warnOnce("[community] falling back to seed: status 404");
        ensureSeed();
        const idx = memStore!.findIndex((p) => p.id === id);
        if (idx >= 0) {
            const it = memStore![idx];
            memStore![idx] = {
                ...it,
                likedByMe: !it.likedByMe,
                likes: it.likedByMe ? Math.max(0, it.likes - 1) : it.likes + 1,
            };
        }
    }
}

export async function listComments(postId: string): Promise<Comment[]> {
    try {
        const data = await getJSON<Comment[]>(`/community/posts/${postId}/comments`);
        return data.sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1));
    } catch {
        warnOnce("[community] comments fallback");
        ensureSeed();
        return (memComments![postId] ?? []).slice().sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1));
    }
}

export async function addComment(postId: string, text: string, author?: string): Promise<Comment> {
    try {
        const created = await postJSON<Comment>(`/community/posts/${postId}/comments`, { text });
        return created;
    } catch {
        warnOnce("[community] comments fallback");
        ensureSeed();
        const c: Comment = {
            id: cryptoRandomId(),
            postId,
            author: author ?? "Você",
            authorAvatarColor: "#03A9F4",
            text,
            createdAtISO: new Date().toISOString(),
        };
        if (!memComments![postId]) memComments![postId] = [];
        memComments![postId].unshift(c);
        const idx = memStore!.findIndex((p) => p.id === postId);
        if (idx >= 0) memStore![idx] = { ...memStore![idx], comments: memStore![idx].comments + 1 };
        return c;
    }
}

// ---------- Helpers ----------
function cryptoRandomId() {
    return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function ensureSeed() {
    if (!memStore || !memComments) {
        const { posts, comments } = seed();
        memStore = posts;
        memComments = comments;
    }
}

function seed(): { posts: CommunityPost[]; comments: Record<string, Comment[]> } {
    const now = Date.now();

    const p1: CommunityPost = {
        id: "p1",
        author: "Ana Martins",
        authorAvatarColor: "#F6A623",
        createdAtISO: new Date(now - 60 * 60 * 1000).toISOString(), // 1h atrás
        content: "Aula de yoga cedinho, energia ótima! 🧘‍♀️",
        activity: "Yoga",
        durationMin: 32,
        mood: "relaxado",
        image: require("@assets/images/yoga_womn.webp"),
        likes: 43,
        comments: 2,
        likedByMe: false,
    };

    const p2: CommunityPost = {
        id: "p2",
        author: "Lucas Ferreira",
        authorAvatarColor: "#4CAF50",
        createdAtISO: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
        content: "Corri no parque e me senti vivo! 🏃",
        activity: "Corrida",
        durationMin: 40,
        mood: "orgulhoso",
        image: require("@assets/images/man_runing.jpg"),
        likes: 65,
        comments: 1,
        likedByMe: false,
    };

    const comments: Record<string, Comment[]> = {
        [p1.id]: [
            {
                id: "c1",
                postId: p1.id,
                author: "Bruna",
                authorAvatarColor: "#FF7043",
                text: "Que vibe boa! Também amo yoga de manhã 🙏",
                createdAtISO: new Date(now - 55 * 60 * 1000).toISOString(),
            },
            {
                id: "c2",
                postId: p1.id,
                author: "Marcos",
                authorAvatarColor: "#8D6E63",
                text: "Parabéns pela consistência!",
                createdAtISO: new Date(now - 50 * 60 * 1000).toISOString(),
            },
        ],
        [p2.id]: [
            {
                id: "c3",
                postId: p2.id,
                author: "Ana",
                authorAvatarColor: "#7E57C2",
                text: "Boraaa! 👟🔥",
                createdAtISO: new Date(now - 110 * 60 * 1000).toISOString(),
            },
        ],
    };

    return { posts: [p1, p2], comments };
}
