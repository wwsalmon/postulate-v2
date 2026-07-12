import { createBrowserClient, createServerClient } from "~/pocketbase";
import Navbar from "../../components/Navbar";
import type { Route } from "./+types/user";
import { data } from "react-router";
import Button from "../../components/Button";

export function meta({ loaderData }: Route.MetaArgs) {
    const {user} = loaderData;

    return [
        { title: `${user.name} | Postulate` },
        { name: "description", content: "Repositories of open-source knowledge" },
    ];
}

export default function User({loaderData}: Route.ComponentProps) {
    const {user} = loaderData;
    const pb = createBrowserClient();
    const thisUser = pb.authStore?.record;
    const isOwnProfile = thisUser && thisUser.id === user.id;

    return (
        <>
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex flex-col items-center my-8">
                    <div className="w-16 h-16 rounded-full bg-neutral-300"></div>
                </div>    
                <h1 className="text-neutral-700 text-2xl font-bold mt-8 mb-2 leading-none text-center">{user.name}</h1>
                {/* <div className="text-neutral-500 text-xl leading-none text-center"><span>@{user.username}</span></div> */}
                <div className="text-neutral-500 text-xl leading-none text-center"><span>Repositories of open-source knowledge</span></div>
                <div className="flex items-center mt-16">
                    <h3 className="text-neutral-500 font-medium">Pinned</h3>
                    {isOwnProfile && (
                        <Button className="ml-auto" small={true}>+ New</Button>
                    )}
                </div>
            </div>
        </>
    )
}

export async function loader({request, params}: Route.LoaderArgs) {
    const username = params.username;

    // check that it starts with @
    if (username.slice(0, 1) !== "@") throw data({message: "Invalid username", status: 404});
    const trueUsername = username.slice(1);

    const pb = createServerClient();
    try {
        const user = await pb.collection("users").getFirstListItem(`username="${trueUsername}"`);
        if (!user) throw data({message: "User not found", status: 404});
        return data({user: user});
    } catch (e) {
        throw data({message: e, status: 404});
    }

}