import { data, Link } from "react-router";
import { createBrowserClient, createServerClient } from "~/pocketbase";
import AutosavingEditor from "../../slate/AutosavingEditor";
import type { Route } from "./+types/postEdit";
import AutosavingField from "../../components/AutosavingField";
import { getPlainTextFromSlateValue } from "../../slate/SlateEditor";
import { useState } from "react";
import { type Descendant } from "slate";
import Button, { LinkButton } from "../../components/Button";
import { ArrowLeft, Delete, Trash } from "lucide-react";

export default function PostEdit({loaderData}: Route.ComponentProps) {
    const {draftPost, project, user} = loaderData;

    const pb = createBrowserClient();

    const [savedSlateBody, setSavedSlateBody] = useState<Descendant[]>(draftPost.slateBody);
    const [savedTitle, setSavedTitle] = useState<string>(draftPost.title);
    const [draftStatus, setDraftStatus] = useState<string>("");

    return (
        <>
            <div className="sticky top-0 left-0 right-0 w-full px-4 h-12 border-neutral-200 bg-white flex items-center z-10 gap-6">
                <Link to={`/@${user.username}/${project.slug}`} className="flex items-center gap-2 px-2 py-1 rounded font-medium hover:bg-neutral-100 mr-auto">
                    <ArrowLeft size={16}/>
                    <span>{project.name}</span>
                </Link>
                <span className="text-neutral-500 text-sm">{draftStatus}</span>
                <button className="text-red-500 border-b pb-1 text-sm opacity-50 hover:opacity-100 flex items-center gap-1">
                    <Trash size={14}></Trash>
                    Delete post
                </button>
                <Button className="" small={true}>Publish</Button>
            </div>
            <div className="max-w-3xl mx-auto px-4 my-8">
                <AutosavingField
                    prevValue={savedTitle}
                    onSubmitEdit={async (value) => {
                        const savedDraftPost = await pb.collection("draftPosts").update(draftPost.id, {title: value});
                        setSavedTitle(savedDraftPost.title);
                        return savedDraftPost;
                    }}
                    className="text-3xl font-bold mb-4"
                ></AutosavingField>
                <AutosavingEditor
                    projectId={project.id}
                    prevValue={savedSlateBody}
                    onSubmitEdit={async (value) => {
                        const savedDraftPost = await pb.collection("draftPosts").update(draftPost.id, {slateBody: value, plaintext: getPlainTextFromSlateValue(value)});
                        setSavedSlateBody(savedDraftPost.slateBody);
                        return savedDraftPost;
                    }}
                    setStatus={setDraftStatus}
                />
            </div>
        </>
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
        const user = await pb.collection("users").getOne(project.parent);
        return data({project, draftPost, user});
    } catch (e) {
        throw data({message: e, status: 404});
    }
}