import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/login", "routes/login.tsx"),
    route("/projects", "routes/projects.tsx"),
    route("/projects/new", "routes/projectNew.tsx"),
    route("/:username", "routes/user.tsx"),
    route("/editor", "routes/editor.tsx"),
] satisfies RouteConfig;
