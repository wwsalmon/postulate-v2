import { data, Link } from "react-router";
import { createServerClient } from "~/pocketbase";
import type { Route } from "../routes/+types/post";
import { SlateReadOnly } from "../../slate/SlateEditor";

export function meta({ loaderData }: Route.MetaArgs) {
    const {post, project} = loaderData;

    return [
        { title: `${post.title} | ${project.name}` },
        { name: "description", content: "Postulate: Repositories of open-source knowledge" },
    ];
}

export default function Post({loaderData}: Route.ComponentProps) {
    const {user, project, draftPost, post, projectPosts} = loaderData;

    return (
        <div className="lg:flex max-w-5xl mx-auto gap-8 pt-12">
            <div className="max-w-3xl w-full shrink-0">
                <h1 className="text-4xl font-bold text-neutral-700">{post.title}</h1>
                <div className="flex items-center gap-4 mt-6 mb-4 border-b border-neutral-200 pb-6">
                    <span className="text-neutral-500">{new Date(post.created).toLocaleDateString("en-US", {year: "numeric", month: "short", day: "numeric"})}</span>
                    <span className="text-neutral-500">Updated {new Date(post.updated).toLocaleDateString("en-US", {year: "numeric", month: "short", day: "numeric"})}</span>
                </div>
                <SlateReadOnly value={post.slateBody} projectId={project.id}/>
            </div>
            <div className="max-w-70 grow">
                <h3 className="font-medium text-neutral-700">Project</h3>
                <Link to={`/@${user.username}/${project.slug}`} className="text-xl font-bold text-neutral-700 my-2 block">{project.name}</Link>
                <p className="text-neutral-500 mb-12">{project.description}</p>
                {projectPosts.items.length ? projectPosts.items.map(projectPost => (
                    <Link to={`/@${user.username}/${project.slug}/${projectPost.slug}`} key={projectPost.id} className="block my-4 opacity-50 hover:opacity-100">
                        <h4 className="font-semibold leading-none">{projectPost.title}</h4>
                        <div><span className="text-sm text-neutral-500">{new Date(projectPost.created).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})}</span></div>
                    </Link>
                )) : (
                    <div><span className="text-neutral-500">No posts</span></div>
                )}
            </div>
        </div>
    )
}

export async function loader({request, params}: Route.LoaderArgs) {
    const {username, projectSlug, postSlug} = params;
    if (username.slice(0, 1) !== "@") throw data({message: "Invalid username", status: 404});
    const trueUsername = username.slice(1);
    const pb = createServerClient(request.headers.get("Cookie"));
    const isOwner = pb.authStore.record?.username === trueUsername;

    try {
        const user = await pb.collection("users").getFirstListItem(`username = "${trueUsername}"`);
        if (!user) throw data({message: "User not found", status: 404});
        const project = await pb.collection("projects").getFirstListItem(`parent = "${user.id}" && slug = "${projectSlug}"`);
        if (!project) throw data({message: "Project not found", status: 404});
        const post = await pb.collection("posts").getFirstListItem(`project = "${project.id}" && slug = "${postSlug}"`);
        if (!post) throw data({message: "Project not found", status: 404});
        const draftPost = isOwner ? await pb.collection("draftPosts").getFirstListItem(`post = "${post.id}"`) : null;
        const projectPosts = await pb.collection("posts").getList(1, 5, {filter: `project = "${project.id}"`});
        return data({user, post, draftPost, project, projectPosts});
    } catch (e) {
        throw data({message: e, status: 404});
    }

}