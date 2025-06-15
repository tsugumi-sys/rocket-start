import { Hono } from "hono";
import google from "./google";
import logout from "./logout";

const auth = new Hono();

auth.route("/google", google);
auth.route("/logout", logout);

export default auth;
