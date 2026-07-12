import { data, redirect } from "react-router";
import { createBrowserClient, createServerClient } from "~/pocketbase";
import type { Route } from "../routes/+types/projects";
import Navbar from "../../components/Navbar";

export default function Projects({loaderData}: Route.ComponentProps) {
    const {cookie} = loaderData;
    const pb = createBrowserClient(cookie);

    return (
        <>
            <Navbar/>
            <div className="max-w-sm mx-auto px-4">
                <h1>Projects</h1>
                <p>Logged in as {pb.authStore.record?.username}</p>
            </div>
        </>
    )
}

export async function loader({request}: Route.LoaderArgs) {
    const pb = createServerClient(request.headers.get("Cookie"));
    if (!pb.authStore.isValid) return redirect("/login", {headers: {"Set-Cookies": pb.authStore.exportToCookie()}});
    return data({cookie: pb.authStore.exportToCookie()}, {headers: {"Set-Cookie": pb.authStore.exportToCookie()}});
}