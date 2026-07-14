import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/login", "routes/login.tsx"),
    route("/:username", "routes/user.tsx"),
    route("/:username/projects", "routes/projects.tsx"),
    route("/:username/projects/new", "routes/projectNew.tsx"),
    // route("/editor", "routes/editor.tsx"),
    route("/edit/:id", "routes/postEdit.tsx"),
    route("/:username/:projectSlug", "routes/project.tsx"),
    route("/:username/:projectSlug/:postSlug", "routes/post.tsx"),
] satisfies RouteConfig;
