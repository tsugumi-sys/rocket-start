## Setups

Add envs in .dev.vars

```sh
JWT_SECRET=""
GOOGLE_CLIENT_ID=""
FRONTEND_ORIGIN=""
```

## Development

```txt
npm install
npm run dev
```

## Deployment

Add envs in .production.vars:

```sh
touch .production.vars
```

Then deploy:

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

