import { data, redirect } from "react-router";
import { createBrowserClient, createServerClient } from "~/pocketbase";
import type { Route } from "../routes/+types/projects";
import Navbar from "../../components/Navbar";
import { useRef } from "react";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Projects | Postulate" },
        { name: "description", content: "Repositories of open-source knowledge" },
    ];
}

export default function Projects({loaderData}: Route.ComponentProps) {
    const {cookie} = loaderData;

    const firstLoad = useRef(true);
    
    const pb = createBrowserClient((() => {
        if (firstLoad.current) {
            firstLoad.current = false;
            return cookie;
        } else {
            return undefined;
        }
    })());

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
    if (!pb.authStore.isValid) return redirect("/login", {headers: {"Set-Cookies": pb.authStore.exportToCookie({httpOnly: false})}});
    return data({cookie: pb.authStore.exportToCookie({httpOnly: false})}, {headers: {"Set-Cookie": pb.authStore.exportToCookie({httpOnly: false})}});
}