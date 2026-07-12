import classNames from "classnames"
import { type MouseEventHandler, type ReactNode } from "react"

export default function Button({isLoading, isDisabled, className, children, onClick}: {isLoading?: boolean, isDisabled?: boolean, className?: string, children?: ReactNode, onClick?: MouseEventHandler<HTMLButtonElement>}) {
    return (
        <button className={classNames("block px-4 py-3 w-full hover:bg-black bg-neutral-700 text-white font-bold rounded disabled:opacity-50", className)} disabled={isLoading || isDisabled} onClick={onClick}>{isLoading ? "Loading..." : children}</button>
    )
}