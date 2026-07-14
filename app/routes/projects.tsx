import { data, Link } from "react-router";
import { createServerClient } from "~/pocketbase";
import type { Route } from "../routes/+types/projects";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Projects | Postulate" },
        { name: "description", content: "Repositories of open-source knowledge" },
    ];
}

export default function Projects({loaderData}: Route.ComponentProps) {
    const {user, projects} = loaderData;

    return (
        <>
            <div className="max-w-4xl mx-auto px-4">
                <Link to={`/@${user.username}`} className="flex items-center gap-4 my-8">
                    <div className="w-8 h-8 rounded-full bg-neutral-300"></div>
                    <h1 className="text-neutral-700 text-xl font-bold leading-none text-center underline">{user.name}</h1>
                </Link>
                <h3 className="text-neutral-500 font-medium">All projects ({projects.length})</h3>
                <div className="grid grid-cols-4 mt-4 gap-3">
                    {projects.map(project => (
                        <Link to={`/@${user.username}/${project.slug}`} key={project.id} className="block border rounded border-neutral-300 p-4 hover:bg-neutral-50 bg-white transition">
                            <h3 className="font-bold text-neutral-700">{project.name}</h3>
                            <div className="text-sm text-neutral-500"><span>{project.description}</span></div>
                        </Link>
                    ))}
                </div>
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