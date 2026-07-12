import PocketBase from "pocketbase";

export const POCKETBASE_API_URL = "https://pocketbase-cloudrun-git-128103198054.us-central1.run.app";

export function createServerClient(cookie?: string | null) {
    if (!POCKETBASE_API_URL) {
        throw new Error("Pocketbase API url not defined !");
    }

    if (typeof window !== "undefined") {
        throw new Error(
            "This method is only supposed to call from the Server environment"
        );
    }

    const client = new PocketBase(
        POCKETBASE_API_URL
    ) as PocketBase;

    if (cookie) {
        const cookies = parseCookie(cookie);
        const authCookieValue = cookies["pb_auth"];
    
        if (authCookieValue) client.authStore.loadFromCookie(`pb_auth=${authCookieValue}`);
    }

    return client;
}

let singletonClient: PocketBase | null = null;

let isLoggingOut = false;

export function createBrowserClient(cookie?: string) {
    if (!POCKETBASE_API_URL) {
        throw new Error("Pocketbase API url not defined !");
    }

    const createNewClient = () => {
        isLoggingOut = false;
        return new PocketBase(
            POCKETBASE_API_URL
        ) as PocketBase;
    };

    const _singletonClient = singletonClient ?? createNewClient();

    if (cookie) {
        isLoggingOut = false;
        _singletonClient.authStore.loadFromCookie(cookie);
    }

    if (typeof window === "undefined") return _singletonClient;

    if (!singletonClient) singletonClient = _singletonClient;

    // only used for signing out
    singletonClient.authStore.onChange((token, record) => {
        if (!token && !record) {
            isLoggingOut = true;
            document.cookie = singletonClient!.authStore.exportToCookie({
                httpOnly: false,
            });
        } else {
            if (isLoggingOut) singletonClient?.authStore.clear();
        }
    });

    return singletonClient;
}

export function parseCookie(cookie: string) {
    return cookie.split('; ').reduce((prev, current) => {
        const [name, ...value] = current.split('=');
        prev[name] = value.join('=');
        return prev;
    }, {} as {[key: string]: string});
}