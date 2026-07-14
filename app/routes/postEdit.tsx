import { data } from "react-router";
import { createBrowserClient, createServerClient } from "~/pocketbase";
import AutosavingEditor from "../../slate/AutosavingEditor";
import type { Route } from "./+types/postEdit";
import AutosavingField from "../../components/AutosavingField";
import { getPlainTextFromSlateValue } from "../../slate/SlateEditor";

export default function PostEdit({loaderData}: Route.ComponentProps) {
    const {draftPost, project} = loaderData;

    const pb = createBrowserClient();

    return (
        <div className="max-w-3xl mx-auto px-4 my-8">
            <AutosavingField
                prevValue={draftPost.title}
                onSubmitEdit={(value) => {
                    return pb.collection("draftPosts").update(draftPost.id, {title: value});
                }}
                className="text-3xl font-bold mb-4"
            ></AutosavingField>
            <AutosavingEditor
                projectId={project.id}
                prevValue={draftPost.slateBody}
                onSubmitEdit={(value) => {
                    return pb.collection("draftPosts").update(draftPost.id, {slateBody: value, plaintext: getPlainTextFromSlateValue(value)});
                }}
            />
        </div>
    );
}

export async function loader({request, params}: Route.LoaderArgs) {
    const id = params.id;
    const pb = createServerClient(request.headers.get("Cookie"));

    try {
        const draftPost = await pb.collection("draftPosts").getOne(id);
        if (!draftPost) throw data({message: "Draft post not found", status: 404});
        const project = await pb.collection("projects").getOne(draftPost.project);
        if (!project) throw data({message: "Project not found", status: 404});
        return data({project, draftPost});
    } catch (e) {
        throw data({message: e, status: 404});
    }
}