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
| Database         | Cloudflare D1 + Drrizle   |
| Blog Storage     | Cloudflare R2             |
| Key-Value Store  | Cloudflare KV             |
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
* Access tokens expire after **1 hour** and refresh tokens after **30 days**
* Cookie is sent with the following attributes:
  * `HttpOnly`
  * `Secure`
  * `SameSite=Strict`

---

## ⚙️ Setup Steps (Initial Configuration)

1. Create Cloudflare D1, and change wrangler configuration in backend.
2. Setup backend (see `backend/README.md`)
3. Setup web (see `web/README.md`)

