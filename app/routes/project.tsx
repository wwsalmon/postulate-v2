import { createBrowserClient, createServerClient } from "~/pocketbase";
import type { Route } from "../routes/+types/project";
import { data, Link, redirect, useNavigate } from "react-router";
import Button from "../../components/Button";
import { useState } from "react";

export default function Project({loaderData}: Route.ComponentProps) {
    const {user, project, posts, draftPosts} = loaderData;

    const [isLoading, setIsLoading] = useState(false);
    
    const pb = createBrowserClient();

    const isOwner = pb.authStore.record?.id === user.id;

    const navigate = useNavigate();

    async function onNewPost() {
        try {
            const draftPost = await pb.collection("draftPosts").create({
                slateBody: [{
                    type: 'p',
                    children: [{ text: '' }],
                }],
                plainText: "",
                title: "Untitled post",
                project: project.id,
            });

            setIsLoading(false);
            navigate(`/edit/${draftPost.id}`);
        } catch (e) {
            window.alert(e);
        } finally {
            setIsLoading(false);
        }
    }
    
    console.log(posts, draftPosts);

    return (
        <div className="max-w-xl mx-auto px-4 w-full">
            <h1 className="font-extrabold text-3xl text-neutral-700 text-center mb-2">{project.name}</h1>
            <div className="text-xl text-neutral-500 text-center mb-16"><span></span></div>
            <div className="flex items-center mb-8">
                <h3 className="font-medium text-neutral-500 mr-auto">Posts ({posts.length})</h3>
                {isOwner && (
                    <Button small={true} isLoading={isLoading} onClick={onNewPost}>+ New post</Button>
                )}
            </div>
            {isOwner && draftPosts.map(post => (
                <Link to={`/edit/${post.id}`} key={post.id} className="block my-4">
                    <h3 className="text-neutral-700 font-semibold mb-1">{post.title}</h3>
                    <div className="flex items-center gap-x-3">
                        <div className="px-1 py-0.75 rounded border border-amber-400 bg-amber-200 text-black/80 font-bold text-xs">
                            <span>Draft</span>
                        </div>
                        <div className="text-neutral-500 text-sm"><span>{new Date(post.created).toLocaleDateString("en-US", {year: "numeric", month: "short", day: "numeric"})}</span></div>
                    </div>
                </Link>
            ))}
        </div>
    )
}

export async function loader({request, params}: Route.LoaderArgs) {
    const {username, projectSlug} = params;
    if (username.slice(0, 1) !== "@") throw data({message: "Invalid username", status: 404});
    const trueUsername = username.slice(1);

    const pb = createServerClient(request.headers.get("Cookie"));

    try {
        const user = await pb.collection("users").getFirstListItem(`username="${trueUsername}"`);
        if (!user) throw data({message: "User not found", status: 404});
        const project = await pb.collection("projects").getFirstListItem(`parent="${user.id}" && slug="${projectSlug}"`);
        if (!project) throw data({message: "Project not found", status: 404});
        const posts = await pb.collection("posts").getFullList({filter: `project="${project.id}"`});
        const draftPosts = await pb.collection("draftPosts").getFullList({filter: `project="${project.id}"`});
        // list posts
        return data({user, project, posts, draftPosts});
    } catch (e) {
        console.log(e);
        throw data({message: e, status: 404});
    }
}