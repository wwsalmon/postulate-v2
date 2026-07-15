import { ArrowRight } from "lucide-react";
import { data, Link } from "react-router";
import { createBrowserClient, createServerClient } from "~/pocketbase";
import { LinkButton } from "../../components/Button";
import type { Route } from "./+types/user";

export function meta({ loaderData }: Route.MetaArgs) {
    const {user} = loaderData;

    return [
        { title: `${user.name} | Postulate` },
        { name: "description", content: "Repositories of open-source knowledge" },
    ];
}

export default function User({loaderData}: Route.ComponentProps) {
    const {user, projects, cookie} = loaderData;
    const pb = createBrowserClient(cookie);
    const thisUser = pb.authStore?.record;
    const isOwnProfile = thisUser && thisUser.id === user.id;

    return (
        <>
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex flex-col items-center my-8">
                    <div className="w-16 h-16 rounded-full bg-neutral-300"></div>
                </div>    
                <h1 className="text-neutral-700 text-2xl font-bold mt-8 mb-2 leading-none text-center">{user.name}</h1>
                {/* <div className="text-neutral-500 text-xl leading-none text-center"><span>@{user.username}</span></div> */}
                <div className="text-neutral-500 text-xl leading-none text-center"><span>Repositories of open-source knowledge</span></div>
                <div className="flex items-center mt-16">
                    <h3 className="text-neutral-500 font-medium">Projects</h3>
                    {isOwnProfile && (
                        <LinkButton className="ml-auto" small={true} to={`/@${user.username}/projects/new`}>+ New project</LinkButton>
                    )}
                </div>
                <div className="grid grid-cols-4 mt-4 gap-3">
                    {projects.items.map(project => (
                        <Link to={`/@${user.username}/${project.slug}`} key={project.id} className="border rounded border-neutral-300 p-4 hover:bg-neutral-50 bg-white transition">
                            <h3 className="font-bold text-neutral-700">{project.name}</h3>
                            <div className="text-sm text-neutral-500"><span>{project.description}</span></div>
                        </Link>
                    ))}
                    <Link to={`/@${user.username}/projects`} className="flex items-center justify-center px-4 rounded hover:bg-neutral-50 bg-white transition font-medium text-neutral-500 gap-2">
                        <span>All projects ({projects.totalItems})</span>
                        <ArrowRight size={16}/>
                    </Link>
                </div>
            </div>
        </>
    )
}

export async function loader({request, params}: Route.LoaderArgs) {
    const username = params.username;

    // check that it starts with @
    if (username.slice(0, 1) !== "@") throw data({message: "Invalid username", status: 404});
    const trueUsername = username.slice(1);

    const pb = createServerClient(request.headers.get("Cookie"));
    try {
        const user = await pb.collection("users").getFirstListItem(`username="${trueUsername}"`);
        const projects = await pb.collection("projects").getList(1, 7, {filter: `parent="${user.id}"`});
        if (!user) throw data({message: "User not found", status: 404});
        return data({user: user, projects: projects, cookie: pb.authStore.exportToCookie()});
    } catch (e) {
        throw data({message: e, status: 404});
    }

}