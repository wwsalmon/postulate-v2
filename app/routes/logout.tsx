import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { createBrowserClient } from "~/pocketbase";

export default function Logout() {
    const pb = createBrowserClient();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const message = searchParams.get("message");

    useEffect(() => {
        pb.authStore.clear();

        navigate(`/login?message=${message}`);
    }, []);
    

    return (
        <div className="max-w-sm mx-auto px-4 py-8">
            <p>Logging you out...</p>
        </div>
    );
}