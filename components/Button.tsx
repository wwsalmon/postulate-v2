import classNames from "classnames"
import { type MouseEventHandler, type ReactNode } from "react"

export default function Button({isLoading, isDisabled, className, children, onClick, small}: {isLoading?: boolean, isDisabled?: boolean, className?: string, children?: ReactNode, onClick?: MouseEventHandler<HTMLButtonElement>, small?: boolean}) {
    return (
        <button className={classNames("hover:bg-black bg-neutral-700 text-white rounded disabled:opacity-50", small ? "text-sm px-2 py-1.5 font-semibold" : "px-4 py-3 font-bold ", className)} disabled={isLoading || isDisabled} onClick={onClick}>{isLoading ? "Loading..." : children}</button>
    )
}