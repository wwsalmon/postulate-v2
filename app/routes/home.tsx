import Navbar from "../../components/Navbar";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Postulate" },
        { name: "description", content: "Repositories of open-source knowledge" },
    ];
}

export default function Home() {
    return (
        <>
            <Navbar/>
            <div className="mx-auto max-w-sm w-full px-4 py-8">
                <h3 className="text-3xl font-bold mb-6 text-neutral-700 text-center">Welcome to Postulate</h3>
                {/* <input id="username" type="text" className="block border w-full px-4 py-3 border-neutral-200 outline-none focus:border-neutral-700 rounded mb-3" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                <input id="password" type="password" className="block border w-full px-4 py-3 border-neutral-200 outline-none focus:border-neutral-700 rounded mb-3" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                <Button onClick={login} isLoading={isLoading}>Log in</Button>
                {error && (
                    <p className="my-3 text-red-500 font-medium text-sm">{error}</p>
                )} */}
            </div>
        </>
        );
    }
