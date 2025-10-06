// src/lib/diagnose.ts
export function logAxiosError(err: any, tag = "REQ") {
    console.log(`[${tag}] message:`, err?.message);
    console.log(`[${tag}] code:`, err?.code);
    console.log(`[${tag}] status:`, err?.response?.status);
    console.log(`[${tag}] data:`, err?.response?.data);
    console.log(
        `[${tag}] url:`,
        (err?.config?.baseURL || "") + (err?.config?.url || "")
    );
    console.log(`[${tag}] method:`, err?.config?.method);
}
