import { Link } from "react-router";

export default function ProjectNavbar({project, user}: {project: any, user: any}) {
    return (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 h-13 flex items-center gap-x-1 text-neutral-400">
            <Link to={`/@${user.username}`} className="font-medium px-2 py-1 hover:bg-neutral-100 rounded hover:text-neutral-700 transition">{user.name}</Link>
            <span>/</span>
            <Link to={`/@${user.username}/${project.slug}`} className="font-medium px-2 py-1 hover:bg-neutral-100 rounded hover:text-neutral-700 transition">{project.name}</Link>
        </div>
    )
}