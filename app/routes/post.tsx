import { data } from "react-router";
import { createServerClient } from "~/pocketbase";
import type { Route } from "../routes/+types/post";

export default function Post({loaderData}: Route.ComponentProps) {
    const {user, project, draftPost, post} = loaderData;

    return (
        <>
            <h1>{post.title}</h1>
        </>
    )
}

export async function loader({request, params}: Route.LoaderArgs) {
    const {username, projectSlug, postSlug} = params;
    if (username.slice(0, 1) !== "@") throw data({message: "Invalid username", status: 404});
    const trueUsername = username.slice(1);
    const pb = createServerClient(request.headers.get("Cookie"));

    try {
        const user = await pb.collection("users").getFirstListItem(`username = "${trueUsername}"`);
        if (!user) throw data({message: "User not found", status: 404});
        const project = await pb.collection("projects").getFirstListItem(`parent = "${user.id}" && slug = "${projectSlug}"`);
        if (!project) throw data({message: "Project not found", status: 404});
        const post = await pb.collection("posts").getFirstListItem(`project = "${project.id}" && slug = "${postSlug}"`);
        if (!post) throw data({message: "Project not found", status: 404});
        const draftPost = await pb.collection("draftPosts").getFirstListItem(`post = "${post.id}"`);
        return data({user, post, draftPost, project});
    } catch (e) {
        throw data({message: e, status: 404});
    }

}