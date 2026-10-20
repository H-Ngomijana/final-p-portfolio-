# Smooth Portfolio Builder

build the same fullstack transitional portfolio website same as the video i uploaded ... with full deatils and smooth transitions ... navbar behavior , page behavior , real icons and so on

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/055efedc-08ff-49d2-9f27-4fb206b8321f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Owner studio

The private owner workspace is available at `/auth` and `/admin`. Configure these
values in the server environment before signing in:

- `ADMIN_USERNAME` and `ADMIN_PASSWORD` for the owner login.
- `ADMIN_SESSION_SECRET` as a random secret of at least 32 bytes for signing the
  eight-hour, HTTP-only session cookie.
- `DATABASE_URL` for a persistent PostgreSQL database (or `POSTGRES_URL` if that
  is the variable provided by your host). Keep this value server-only.

The owner workspace can create, edit, publish, and delete plans, projects, and
technology tools, upload project images, and search recent client inquiries.
Contact inquiries and project/package requests are saved to the same shared
store and appear in the private admin inbox. In production, portfolio content,
packages, inquiries, and uploaded images are stored in PostgreSQL, shared across
server instances and devices. Public portfolio pages and open admin dashboards
poll the shared store every three seconds, so published admin edits appear on
other devices within about three seconds. This requires every deployed instance
to use the same persistent `DATABASE_URL` (or `POSTGRES_URL`); local JSON storage
is only for development on one machine.
The required tables are created automatically and the initial content is seeded
when the database is first used. The admin dashboard refreshes every three
seconds, so new inquiries and requests appear on other open admin devices within
about three seconds. Submissions are not emailed unless an email provider is
configured.

For local development, the app continues to use a JSON file at
`./data/portfolio-content.json`; `PORTFOLIO_DATA_DIR` can override its location.
### Deploying to Netlify

The production build uses Nitro's Netlify preset. Configure the Netlify site to
run `npm run build` with `dist` as the publish directory, and deploy the build
through Netlify's Git integration or CLI so the generated serverless function
ships alongside the static assets. Uploading only a `dist` folder as a manual
static deploy will not include the server function; admin login, inquiry
submissions, and database access will not work.

In Netlify's server-side environment settings, provision a persistent PostgreSQL
database and set `DATABASE_URL` (or `POSTGRES_URL` if required by your provider),
`ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` (at least 32
bytes). Do not expose these as `VITE_*` variables. Every deployed app instance
must use the same database URL so submissions and admin updates are shared.
Production requires this database configuration and will fail rather than
silently use local-only storage if it is missing.
