import { createBrowserClient } from "~/pocketbase"

export default function Navbar() {
    const pb = createBrowserClient();

    return (
        <div className="w-full sticky top-0 left-0 h-13 flex items-center px-4">
            <img src="/logo.svg" alt="Postulate logo" className="h-5" />
            {pb.authStore.isValid && (
                <div className="ml-auto h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center"><span>{pb.authStore.record?.username.slice(0,1)}</span></div>
            )}
        </div>
    )
}