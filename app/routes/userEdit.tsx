import { useRef, useState } from "react";
import { data, redirect, useSearchParams } from "react-router";
import { createServerClient } from "~/pocketbase";
import Button from "../../components/Button";
import type { Route } from "./+types/userEdit";

export function meta({ loaderData }: Route.MetaArgs) {
    return [
        { title: `Edit profile | Postulate` },
        { name: "description", content: "Repositories of open-source knowledge" },
    ];
}

export default function UserEdit({loaderData}: Route.ComponentProps) {
    const {user} = loaderData;

    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username);
    const [changePassword, setChangePassword] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [avatar, setAvatar] = useState<FileList | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);

    const [searchParams, setSearchParams] = useSearchParams();

    const error = searchParams.get("error");

    const isSame = name === user.name && username === user.username && !(changePassword && password) && !(avatar);

    return (
        <div className="max-w-sm w-full mx-auto px-4 my-8">
            <h1 className="text-2xl text-neutral-700 font-bold text-center mb-6">Edit profile</h1>
            <form method="POST" encType="multipart/form-data" ref={formRef}>
                <label htmlFor="avatar" className="mb-2 block text-sm">New avatar</label>
                <input type="checkbox" name="isAvatar" checked={!!avatar} className="hidden"/>
                <input type="file" name="avatar" accept="image/png, image/gif, image/jpeg" className="px-2 py-1.5 border border-neutral-300 rounded block w-full mb-4 font-medium text-sm hover:bg-neutral-100 text-neutral-500" onChange={e => setAvatar(e.target.files)}/>
                <label htmlFor="name" className="mb-2 block text-sm">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} name="name" className="px-4 py-3 border border-neutral-300 rounded block w-full mb-4" placeholder="Name"/>
                <label htmlFor="username" className="mb-2 block text-sm">Username (a-z, 0-9, and hyphens only)</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} name="username" className="px-4 py-3 border border-neutral-300 rounded block w-full mb-4" placeholder="Username"/>
                <div className="flex items-center my-4 gap-2 text-sm">
                    <input id="changePassword" type="checkbox" name="changePassword" checked={changePassword} onChange={e => setChangePassword(e.target.checked)}/>
                    <label htmlFor="changePassword">Change password</label>
                </div>
                {changePassword && (
                    <>
                        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} name="oldPassword" className="px-4 py-3 border border-neutral-300 rounded block w-full mb-4" placeholder="Old password"/>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} name="password" className="px-4 py-3 border border-neutral-300 rounded block w-full mb-4" placeholder="New password"/>
                        <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} name="passwordConfirm" className="px-4 py-3 border border-neutral-300 rounded block w-full mb-4" placeholder="Repeat new password"/>
                    </>
                )}
                <Button className="w-full" isDisabled={isSame} onClick={() => {
                    setIsLoading(true);
                    if (formRef.current) formRef.current.submit();
                }} isLoading={isLoading} type="submit">Save</Button>
                {error && (
                    <p className="my-3 text-red-500 font-medium text-sm">{error}</p>
                )}
            </form>
        </div>
    )
}

export async function loader({request, params}: Route.LoaderArgs) {
    const {username} = params;
    if (username.slice(0, 1) !== "@") throw data({message: "Invalid username", status: 404});
    const trueUsername = username.slice(1);

    const pb = createServerClient(request.headers.get("Cookie"));
    if (!pb.authStore.isValid || !pb.authStore.record) return redirect("/login", {headers: {"Set-Cookies": pb.authStore.exportToCookie({httpOnly: false})}});

    if (pb.authStore.record.username !== trueUsername) return redirect(`/@${username}`);

    const user = await pb.collection("users").getFirstListItem(`username="${trueUsername}"`);
    if (!user) throw data({message: "User not found", status: 404});
    return data({user});
}

export async function action({request}: Route.ActionArgs) {
    const cookie = request.headers.get("Cookie");

    let form = await request.formData();

    const isChangePassword = form.get("changePassword");

    if (!form.get("changePassword")) {
        form.delete("password");
        form.delete("oldPassword");
        form.delete("passwordConfirm");
    }

    form.delete("changePassword")

    if (!form.get("isAvatar")) form.delete("avatar");

    const pb = createServerClient(cookie);

    if (!pb.authStore.isValid || !pb.authStore.record) return redirect("/login", {headers: {"Set-Cookies": pb.authStore.exportToCookie({httpOnly: false})}});

    try {
        await pb.collection("users").update(pb.authStore.record.id, form);

        return redirect(isChangePassword ? "/logout?message=Password changed succesfully. Please log in to continue." : `/@${pb.authStore.record.username}`);
    } catch (e) {
        return redirect(`/@${pb.authStore.record.username}/edit?error=Error: ${e}`);
    }
}