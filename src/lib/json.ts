// src/lib/json.ts
export function jsonBigIntReplacer(_key: string, value: any) {
    return typeof value === "bigint" ? Number(value) : value; // ou String(value) se preferir
}

export function safeJson<T>(data: T) {
    return JSON.parse(JSON.stringify(data, jsonBigIntReplacer));
}
