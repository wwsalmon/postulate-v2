import { createServerClient } from "~/pocketbase";
import Button from "../../components/Button";
import type { Route } from "./+types/projectNew";
import { data, redirect, useSearchParams } from "react-router";
import { Select } from "@headlessui/react";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New project | Postulate" },
        { name: "description", content: "Repositories of open-source knowledge" },
    ];
}

export default function projectNew() {
    const [searchParams, setSearchParams] = useSearchParams();

    const error = searchParams.get("error");

    return (
        <div className="max-w-sm w-full mx-auto px-4 my-8">
            <h1 className="text-2xl font-bold text-neutral-700 mb-6 text-center">New project</h1>
            <form method="POST">
                <label htmlFor="name" className="mb-2 block text-sm">Project name</label>
                <input type="text" name="name" className="px-4 py-3 border border-neutral-300 rounded block w-full mb-4" placeholder="Project name"/>
                <label htmlFor="slug" className="mb-2 block text-sm">Project slug (URL)</label>
                <input type="text" name="slug" className="px-4 py-3 border border-neutral-300 rounded block w-full mb-4" placeholder="Slug (a-z, 0-9, and hyphens only)"/>
                <label htmlFor="description" className="mb-2 block text-sm">Description</label>
                <input type="text" name="description" className="px-4 py-3 border border-neutral-300 rounded block w-full mb-4" placeholder="Description (optional)"/>
                <label htmlFor="privacy" className="mb-2 block text-sm">Privacy</label>
                <Select name="privacy" className="px-4 py-3 border border-neutral-300 rounded block w-full mb-4">
                    <option value="private">Private (only you can see)</option>
                    <option value="public">Public (accessible by URL)</option>
                </Select>
                <Button className="w-full">Create</Button>
                {error && (
                    <p className="my-3 text-red-500 font-medium text-sm">{error}</p>
                )}
            </form>
        </div>
    )
}

export async function loader({request}: Route.LoaderArgs) {
    const pb = createServerClient(request.headers.get("Cookie"));
    if (!pb.authStore.isValid) return redirect("/login", {headers: {"Set-Cookies": pb.authStore.exportToCookie({httpOnly: false})}});
    return data({headers: {"Set-Cookie": pb.authStore.exportToCookie({httpOnly: false})}});
}

export async function action({request}: Route.ActionArgs) {
    const cookie = request.headers.get("Cookie");

    const form = await request.formData();
    const name = form.get("name");
    const slug = form.get("slug");
    const privacy = form.get("privacy");
    const description = form.get("description");

    const pb = createServerClient(cookie);

    if (!pb.authStore.isValid || !pb.authStore.record) return redirect("/login", {headers: {"Set-Cookies": pb.authStore.exportToCookie({httpOnly: false})}});

    console.log(name, slug, privacy, description);
    
    try {
        await pb.collection("projects").create({
            name,
            slug,
            description,
            privacy: privacy === "private",
            parent: pb.authStore.record.id,
        });

        return redirect(`/@${pb.authStore.record.username}/${slug}`);
    } catch (e) {
        return redirect(`/projects/new?error=Error: ${e}`);
    }
}