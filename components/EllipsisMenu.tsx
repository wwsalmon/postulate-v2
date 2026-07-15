import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import classNames from "classnames";
import { EllipsisVertical } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

export default function EllipsisMenu({children, className}: {children: ReactNode, className?: string}) {
    return (
        <Menu>
            <MenuButton className={classNames("p-2 rounded transition hover:bg-neutral-100", className)}>
                <EllipsisVertical size={16}></EllipsisVertical>
            </MenuButton>
            <MenuItems anchor="bottom end" className="mt-4 rounded border border-neutral-200 relative z-30">
                {children}
            </MenuItems>
        </Menu>
    )
}

export function CustomMenuLink({children, className, to}: {children: ReactNode, className?: string, to: string}) {
    return (
        <MenuItem>
            <Link to={to} className={classNames("px-4 py-3 bg-white hover:bg-neutral-100 focus:bg-neutral-100 flex items-center gap-2", className)}>
                {children}
            </Link>
        </MenuItem>
    )
}

export function CustomMenuButton({children, className, onClick, isLoading}: {children: ReactNode, className?: string, onClick: () => any, isLoading?: boolean}) {
    return (
        <MenuItem>
            <button onClick={onClick} disabled={isLoading} className={classNames("px-4 py-3 bg-white hover:bg-neutral-100 focus:bg-neutral-100 flex items-center gap-2 disabled:opacity-50", className)}>
                {children}
            </button>
        </MenuItem>
    )
}