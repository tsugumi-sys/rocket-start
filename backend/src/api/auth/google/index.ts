import { Hono } from "hono";
import login from "./login";
import refresh from "./refresh";

const google = new Hono();

google.route("/login", login);
google.route("/refresh", refresh);

export default google;
