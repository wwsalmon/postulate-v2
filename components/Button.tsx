import classNames from "classnames"
import { type MouseEventHandler, type ReactNode } from "react"
import { Link } from "react-router"

export default function Button({isLoading, isDisabled, className, children, onClick, small, type}: {isLoading?: boolean, isDisabled?: boolean, className?: string, children?: ReactNode, onClick?: MouseEventHandler<HTMLButtonElement>, small?: boolean, type?: "submit" | undefined}) {
    return (
        <button className={classNames("hover:bg-black bg-neutral-700 text-white rounded disabled:opacity-50 font-semibold", small ? "text-sm px-2 py-1.5" : "px-4 py-3 ", className)} disabled={isLoading || isDisabled} onClick={onClick} type={type}>{isLoading ? "Loading..." : children}</button>
    )
}

export function LinkButton({className, children, to, small}: {className?: string, children?: ReactNode, onClick?: MouseEventHandler<HTMLButtonElement>, small?: boolean, to: string}) {
    return (
        <Link className={classNames("hover:bg-black bg-neutral-700 text-white rounded disabled:opacity-50 font-semibold", small ? "text-sm px-2 py-1.5" : "px-4 py-3 ", className)} to={to}>{children}</Link>
    )
}