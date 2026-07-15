import { data, Link } from "react-router";
import { createBrowserClient, createServerClient } from "~/pocketbase";
import type { Route } from "../routes/+types/projects";
import { LinkButton } from "../../components/Button";
import { ProfilePic } from "./user";

export function meta({ loaderData }: Route.MetaArgs) {
    const {user} = loaderData;

    return [
        { title: `${user.name}'s psrojects | Postulate` },
        { name: "description", content: "Repositories of open-source knowledge" },
    ];
}

export default function Projects({loaderData}: Route.ComponentProps) {
    const {user, projects} = loaderData;

    const pb = createBrowserClient();

    const isOwner = pb.authStore.record?.id === user.id;

    return (
        <>
            <div className="max-w-4xl mx-auto px-4">
                <Link to={`/@${user.username}`} className="flex items-center gap-4 my-8">
                    <ProfilePic user={user} className="w-8 h-8 rounded-full object-cover"/>
                    <h1 className="text-neutral-700 text-xl font-bold leading-none text-center">{user.name}</h1>
                </Link>
                <div className="flex items-center">
                    <h3 className="text-neutral-700 font-medium">All projects ({projects.length})</h3>
                    {isOwner && (
                        <LinkButton className="ml-auto" small={true} to={`/@${user.username}/projects/new`}>+ New project</LinkButton>
                    )}
                </div>
                {projects.length ? (
                    <div className="grid sm:grid-cols-3 md:grid-cols-4 mt-4 gap-3">
                        {projects.map(project => (
                            <Link to={`/@${user.username}/${project.slug}`} key={project.id} className="block border rounded border-neutral-300 p-4 hover:bg-neutral-50 bg-white transition">
                                <h3 className="font-bold text-neutral-700">{project.name}</h3>
                                <div className="text-sm text-neutral-500"><span>{project.description}</span></div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="my-8"><span className="text-neutral-500">No projects yet</span></div>
                )}
            </div>
        </>
    )
}

export async function loader({request, params}: Route.LoaderArgs) {
    const {username} = params;
    if (username.slice(0, 1) !== "@") throw data({message: "Invalid username", status: 404});
    const trueUsername = username.slice(1);

    const pb = createServerClient(request.headers.get("Cookie"));
    const user = await pb.collection("users").getFirstListItem(`username="${trueUsername}"`);
    if (!user) throw data({message: "User not found", status: 404});
    const projects = await pb.collection("projects").getFullList({filter: `parent="${user.id}"`});
    
    return data({user, projects}, {headers: {"Set-Cookie": pb.authStore.exportToCookie({httpOnly: false})}});
}