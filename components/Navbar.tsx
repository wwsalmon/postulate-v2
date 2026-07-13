import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { createBrowserClient } from "~/pocketbase"

export default function Navbar() {
    const pb = createBrowserClient();
    const navigate = useNavigate();

    function onLogOut() {
        pb.authStore.clear();

        navigate("/");
    }

    

    return (
        <div className="w-full sticky top-0 left-0 h-13 flex items-center px-4">
            <img src="/logo.svg" alt="Postulate logo" className="h-5" />
            {pb.authStore.isValid && (
                <Menu>
                    <MenuButton className="ml-auto h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center"><span>{pb.authStore.record?.username.slice(0,1)}</span></MenuButton>
                    <MenuItems anchor="bottom end" className="mt-4 rounded border border-neutral-200">
                        {pb.authStore.record && (
                            <MenuItem>
                                <Link to={`/@${pb.authStore.record.username}`} className="px-4 py-3 bg-white hover:bg-neutral-100 focus:bg-neutral-100 flex items-center gap-2">
                                    <User size={16}/>
                                    Profile
                                </Link>
                            </MenuItem>
                        )}
                        <MenuItem>
                            <button className="px-4 py-3 bg-white hover:bg-neutral-100 focus:bg-neutral-100 flex items-center gap-2 text-red-500" onClick={onLogOut}>
                                <LogOut size={16}/>
                                Log out
                            </button>
                        </MenuItem>
                    </MenuItems>
                </Menu>
            )}
        </div>
    )
}