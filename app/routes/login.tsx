import Navbar from "../../components/Navbar";
import type { Route } from "./+types/login";
import { data, redirect } from "react-router";
import { createServerClient, parseCookie } from "~/pocketbase";
import Button from "../../components/Button";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Log in | Postulate" },
        { name: "description", content: "Repositories of open-source knowledge" },
    ];
}

export default function Login({loaderData}: Route.ComponentProps) {
    const {error} = loaderData;

    return (
        <>
            <div className="max-w-sm w-full mx-auto px-4 my-8">
                <h1 className="text-2xl text-neutral-700 font-bold text-center mb-6">Welcome to Postulate</h1>
                <form method="POST">
                    <input name="username" type="text" className="block border w-full px-4 py-3 border-neutral-200 outline-none focus:border-neutral-700 rounded mb-3" placeholder="Username"/>
                    <input name="password" type="password" className="block border w-full px-4 py-3 border-neutral-200 outline-none focus:border-neutral-700 rounded mb-3" placeholder="Password"/>
                    <Button className="w-full">Log in</Button>
                    {error && (
                        <p className="my-3 text-red-500 font-medium text-sm">{error}</p>
                    )}
                </form>
            </div>
        </>
    )
}

export async function loader({request}: Route.LoaderArgs) {
    const pb = createServerClient(request.headers.get("Cookie"));
    if (pb.authStore.isValid && pb.authStore.record) return redirect(`/@${pb.authStore.record.username}`, {headers: {"Set-Cookie": pb.authStore.exportToCookie({httpOnly: false})}});

    const cookie = request.headers.get("Cookie");
    let error = "";
    if (cookie) error = parseCookie(cookie)["POSTULATE_AUTH_ERROR"];

    return data({error: error}, {headers: {"Set-Cookie": pb.authStore.exportToCookie({httpOnly: false})}});
}

export async function action({request}: Route.ActionArgs) {
    const cookie = request.headers.get("Cookie");

    const form = await request.formData();
    const username = form.get("username");
    const password = form.get("password");

    if (typeof username !== "string" || typeof password !== "string") {
        return redirect(`/@${username}`, {headers: {"Set-Cookie": `POSTULATE_AUTH_ERROR=Invalid username or password`}});
    }

    const pb = createServerClient(cookie);

    try {
        await pb.collection("users").authWithPassword(username, password);
    } catch (e) {
        return redirect("/login", {headers: {"Set-Cookie": `POSTULATE_AUTH_ERROR=${e}`}});
    }

    if (pb.authStore.isValid && pb.authStore.record) {
        return redirect(`/@${pb.authStore.record.username}`, {headers: [["Set-Cookie", "POSTULATE_AUTH_ERROR="], ["Set-Cookie", pb.authStore.exportToCookie({httpOnly: false})]]});
    } else {
        return redirect("/login", {headers: {"Set-Cookie": `POSTULATE_AUTH_ERROR=Failed to log in`}});
    }
}