import { data, Link, useNavigate } from "react-router";
import { createBrowserClient, createServerClient } from "~/pocketbase";
import AutosavingEditor from "../../slate/AutosavingEditor";
import type { Route } from "./+types/postEdit";
import AutosavingField from "../../components/AutosavingField";
import { getPlainTextFromSlateValue } from "../../slate/SlateEditor";
import { useState } from "react";
import { type Descendant } from "slate";
import Button, { LinkButton } from "../../components/Button";
import { ArrowLeft, Delete, Trash, Trash2 } from "lucide-react";
import {format, isEqual} from "date-fns";
import short from "short-uuid";
import equal from "deep-equal";
import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import EllipsisMenu, { CustomMenuButton, CustomMenuLink } from "../../components/EllipsisMenu";

export function meta({ loaderData }: Route.MetaArgs) {
    const {draftPost} = loaderData;

    return [
        { title: `Editing: ${draftPost.title} | Postulate` },
        { name: "description", content: "Repositories of open-source knowledge" },
    ];
}

export default function PostEdit({loaderData}: Route.ComponentProps) {
    const {draftPost, project, user, post} = loaderData;

    const pb = createBrowserClient();
    const navigate = useNavigate();

    const [savedSlateBody, setSavedSlateBody] = useState<Descendant[]>(draftPost.slateBody);
    const [savedTitle, setSavedTitle] = useState<string>(draftPost.title);
    const [draftStatus, setDraftStatus] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [publishedPost, setPublishedPost] = useState(post);

    async function onPublish() {
        setIsLoading(true);
        try {
            // if post already exists, update
            // else create new
            if (publishedPost) {
                const thisPost = await pb.collection("posts").update(publishedPost.id, {
                    title: savedTitle,
                    slateBody: savedSlateBody,
                    plaintext: getPlainTextFromSlateValue(savedSlateBody),
                });

                setPublishedPost(thisPost);
            } else {
                const slug = format(new Date(), "yyyy-MM-dd") +
                    "-" + encodeURIComponent(savedTitle.split(" ").slice(0, 5).join("-")) +
                    "-" + short.generate();

                const thisPost = await pb.collection("posts").create({
                    title: savedTitle,
                    slateBody: savedSlateBody,
                    plaintext: getPlainTextFromSlateValue(savedSlateBody),
                    slug: slug,
                    project: project.id,
                });

                setPublishedPost(thisPost);

                await pb.collection("draftPosts").update(draftPost.id, {
                    post: thisPost.id,
                });
            }
        } catch (e) {
            window.alert(`Failed to publish: ${e}`);
        } finally {
            setIsLoading(false);
        }
    }

    async function onDelete() {
        const isConfirmDelete = window.confirm("Are you sure you want to delete this post? You cannot undo this action.");
        
        if (!isConfirmDelete) return;

        setIsLoading(true);

        try {
            await pb.collection("draftPosts").delete(draftPost.id);
            if (draftPost.post) {
                await pb.collection("posts").delete(draftPost.post);
            }
            setIsLoading(false);
            navigate(`/@${user.username}/${project.slug}`);
        } catch (e) {
            window.alert(`Error deleting post: ${e}`);
        } finally {
            setIsLoading(false);
        }
    }

    const isPublished = !!publishedPost;
    const isPublishedEqual = isPublished && equal(publishedPost.slateBody, savedSlateBody) && publishedPost.title === savedTitle;

    return (
        <>
            <div className="sticky top-0 left-0 right-0 w-full px-4 h-12 border-neutral-200 bg-white flex items-center z-10 gap-6">
                <Link to={`/@${user.username}/${project.slug}`} className="flex items-center gap-2 px-2 py-1 rounded font-medium hover:bg-neutral-100 mr-auto">
                    <ArrowLeft size={16}/>
                    <span>{project.name}</span>
                </Link>
                <span className="text-neutral-500 text-sm">
                    {draftStatus}
                </span>
                {isPublished ? (
                    <Link to={`/@${user.username}/${project.slug}/${publishedPost.slug}`} className="text-neutral-500 text-sm underline">
                        {isPublishedEqual ? "Published" : "Unpublished changes"}
                    </Link>    
                ) : (
                    <span className="text-neutral-500 text-sm">
                        "Unpublished"
                    </span>
                )}
                <EllipsisMenu>
                    <CustomMenuButton onClick={onDelete} isLoading={isLoading} className="text-red-500">
                        <Trash size={16}/>
                        Delete post
                    </CustomMenuButton>
                </EllipsisMenu>
                <Button className="" small={true} onClick={onPublish} isLoading={isLoading} isDisabled={isPublishedEqual || draftStatus !== "Draft saved"}>{publishedPost ? "Save" : "Publish"}</Button>
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
        const post = draftPost.post ? await pb.collection("posts").getOne(draftPost.post) : null;
        const project = await pb.collection("projects").getOne(draftPost.project);
        if (!project) throw data({message: "Project not found", status: 404});
        const user = await pb.collection("users").getOne(project.parent);
        return data({project, draftPost, post, user});
    } catch (e) {
        throw data({message: e, status: 404});
    }
}