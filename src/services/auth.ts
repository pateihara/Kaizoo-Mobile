// src/services/auth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "auth:user";         // { email, password }
const TOKEN_KEY = "auth:isLoggedIn";  // "1" | undefined

export type User = { email: string; password: string };

const emailOk = (v: string) => /\S+@\S+\.\S+/.test(v);

export async function signUp(email: string, password: string) {
    if (!emailOk(email)) throw new Error("E-mail inválido");
    if ((password ?? "").length < 6) throw new Error("Senha deve ter 6+ caracteres");

    const saved = await AsyncStorage.getItem(USER_KEY);
    if (saved) {
        const u = JSON.parse(saved) as User;
        if (u.email.toLowerCase() === email.toLowerCase()) {
            throw new Error("Já existe uma conta com esse e-mail");
        }
    }

    const user: User = { email, password };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(TOKEN_KEY, "1");
}

export async function signIn(email: string, password: string) {
    const saved = await AsyncStorage.getItem(USER_KEY);
    if (!saved) throw new Error("Usuário não encontrado. Crie uma conta.");
    const u = JSON.parse(saved) as User;
    if (u.email.toLowerCase() !== email.toLowerCase() || u.password !== password) {
        throw new Error("Credenciais inválidas");
    }
    await AsyncStorage.setItem(TOKEN_KEY, "1");
}

export async function signOut() {
    await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function isLoggedIn() {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    return t === "1";
}
