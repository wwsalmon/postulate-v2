import equal from "deep-equal";
import { useState } from "react";
import { data, Link, useNavigate } from "react-router";
import { createBrowserClient, createServerClient } from "~/pocketbase";
import Button from "../../components/Button";
import type { Route } from "../routes/+types/project";
import ProjectNavbar from "../../components/ProjectNavbar";

export function meta({ loaderData }: Route.MetaArgs) {
    const {user, project} = loaderData;

    return [
        { title: `${project.name} | ${user.name}` },
        { name: "description", content: "Postulate: Repositories of open-source knowledge" },
    ];
}

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

    function DraftPost({draftPost}: {draftPost: any}) {
        const post = !!draftPost.id && posts.find(d => d.id === draftPost.post);
        const isDraftUpdated = !!post && equal(draftPost.slateBody, post.slateBody);

        return (
            <Link to={post ? `/@${user.username}/${project.slug}/${post.slug}` : `/edit/${draftPost.id}`} key={draftPost.id} className="block my-8">
                <h3 className="text-neutral-700 font-semibold">{draftPost.title}</h3>
                <div className="flex items-center gap-x-3">
                    {!post && (
                        <div className="px-1 py-0.75 rounded border border-amber-400 bg-amber-200 text-black/80 font-bold text-xs">
                            <span>Draft</span>
                        </div>
                    )}
                    <div className="text-neutral-500 text-sm"><span>{new Date(draftPost.createdAt).toLocaleDateString("en-US", {year: "numeric", month: "short", day: "numeric"})}</span></div>
                    {post && !isDraftUpdated ? (
                        <div className="px-1 py-0.75 rounded border border-green-400 bg-green-200 text-black/80 font-bold text-xs">
                            <span>Unpublished changes</span>
                        </div>
                    ) : (
                        <div className="text-neutral-500 text-sm"><span>Published</span></div>
                    )}
                </div>
            </Link>
        )
    }

    return (
        <>
            <ProjectNavbar user={user} project={project}/>
            <div className="max-w-xl mx-auto px-4 w-full mt-12">
                <h1 className="font-extrabold text-3xl text-neutral-700 text-center mb-2">{project.name}</h1>
                <div className="text-xl text-neutral-500 text-center mb-16"><span>{project.description}</span></div>
                <div className="flex items-center mb-8">
                    <h3 className="font-medium text-neutral-500 mr-auto">Posts ({posts.length})</h3>
                    {isOwner && (
                        <Button small={true} isLoading={isLoading} onClick={onNewPost}>+ New post</Button>
                    )}
                </div>
                {(isOwner && draftPosts) ? draftPosts.length ? draftPosts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).map(draftPost => (
                    <DraftPost draftPost={draftPost} key={draftPost.id}/>
                )) : (
                    <span className="text-neutral-500">No posts or drafts</span>
                ) : posts.length ? posts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).map(post => (
                    <Link to={`/@${user.username}/${project.slug}/${post.slug}`} key={post.id} className="block my-12">
                        <h3 className="text-neutral-700 font-semibold text-xl">{post.title}</h3>
                        <div className="line-clamp-2 text-sm text-neutral-500 mt-2 mb-3"><span>{post.plaintext}</span></div>
                        <div className="flex items-center gap-x-3">
                            <div className="text-neutral-500 text-xs"><span>{new Date(post.createdAt).toLocaleDateString("en-US", {year: "numeric", month: "short", day: "numeric"})}</span></div>
                        </div>
                    </Link>
                )) : (
                    <span className="text-neutral-500">No posts</span>
                )}
            </div>
        </>
    )
}

export async function loader({request, params}: Route.LoaderArgs) {
    const {username, projectSlug} = params;
    if (username.slice(0, 1) !== "@") throw data({message: "Invalid username", status: 404});
    const trueUsername = username.slice(1);

    const pb = createServerClient(request.headers.get("Cookie"));
    const isOwner = pb.authStore.record?.username === trueUsername;

    try {
        const user = await pb.collection("users").getFirstListItem(`username="${trueUsername}"`);
        if (!user) throw data({message: "User not found", status: 404});
        const project = await pb.collection("projects").getFirstListItem(`parent="${user.id}" && slug="${projectSlug}"`);
        if (!project) throw data({message: "Project not found", status: 404});
        const posts = await pb.collection("posts").getFullList({filter: `project="${project.id}"`});
        const draftPosts = isOwner ? await pb.collection("draftPosts").getFullList({filter: `project="${project.id}"`}) : null;
        // list posts
        return data({user, project, posts, draftPosts});
    } catch (e) {
        console.log(e);
        throw data({message: e, status: 404});
    }
}