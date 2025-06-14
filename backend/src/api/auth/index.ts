import { Hono } from "hono";
import google from "./google";

const auth = new Hono();

auth.route("/google", google);

export default auth;
