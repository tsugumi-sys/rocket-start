# 🛠️ AI-Powered Web App Development Template (Remix + Hono + Cloudflare)

This project is a template designed to rapidly develop web applications with the support of AI.  
It leverages a **stateless and secure Cloudflare stack**, assuming Google/Apple OAuth for authentication.

---

## 🎯 Purpose

* Provide a **fast web app development experience** supported by AI  
* Unify authentication, DB, storage, and API into the **Cloudflare stack** for easy local development  
* Offer a **template & SDK** that balances backward compatibility and extensibility  

---

## 🧱 Tech Stack

| Category         | Technology                |
| ---------------- | ------------------------- |
| Backend          | Hono (Cloudflare Workers) |
| Frontend         | Remix (Cloudflare Pages)  |
| Database         | Cloudflare D1 + Prisma    |
| Storage          | Cloudflare R2             |
| Authentication   | Google / Apple OAuth 2.0  |
| Session Handling | JWT (Stateless) + Cookie  |

We completely separate Hono and Remix (do not use Hono Remix adaptor), so the frontend framework can be swapped easily in the future.

---

## 🔐 Authentication Spec

* Only supports Google / Apple OAuth (no username/password)  
* After authentication, Hono issues a JWT and returns it as an `HttpOnly` cookie  
* JWT contains:  
  * `sub`: User ID (e.g., Google/Apple ID)  
  * `exp`, `iat`: Expiration and issue time  
  * `iss`: Issuer  
* Cookie is sent with the following attributes:  
  * `HttpOnly`  
  * `Secure`  
  * `SameSite=Lax`  

---

## ✅ Delivery Format

* GitHub template + SDK distributed via npm  
* Compatible with Codex template (`codex.json` definition)  
* Future plan: SaaS GUI management panel  

---

## ⚙️ Setup Steps (Initial Configuration)

### Step 1. Initialize Project Structure

* Use `create-remix` to scaffold a Remix app in `web` (for Cloudflare Pages)  
* Set up Hono + TypeScript in `backend` (for Workers)  
* Configure `wrangler.toml` with workspace settings and bindings  

### Step 2. Add Authentication (Google OAuth)

* Create `/auth/google/callback` route with Hono  
* Use `@hono/oauth-providers` to fetch the OAuth code  
* On success, issue a JWT and return it with `Set-Cookie`  

### Step 3. JWT Verification & Protected Routes

* In Hono middleware, read JWT from Cookie and verify the signature  
* Set `c.set("user", payload)` to pass user info in the request  

### Step 4. Retrieve Auth State in Remix

* In the loader, read the `Authorization` cookie and reflect login status  
* Access API via `fetch('/api/protected', { credentials: 'include' })`  

### Step 5. Set Up Prisma with Cloudflare D1

* Install Prisma CLI and D1 adapter  
* Define your schema in `prisma/schema.prisma`  
* Configure your datasource using the `libsql`/`sqlite` provider  
* Run:

  ```sh
  npx prisma generate
  npx prisma db push
  ```

* Optionally, use `prisma migrate dev` if you simulate D1 locally with SQLite

### Step 6. Codex Support (Optional)

* Define `codex.json` for AI autocompletion and CLI support  
* Set up unified local startup with `pnpm dev`  

---

## 📝 License & OSS Policy

* Plan to adopt MIT or Apache-2.0  
* Will be structured to welcome community contributions
