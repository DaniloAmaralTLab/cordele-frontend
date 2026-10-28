# Cordelê — frontend

Part of **Cordelê**, a B2B platform that turns manuscripts (DOCX / Markdown)
into valid ePub publications. This is the Angular 21 web client, in an Nx 22
workspace.

## Layout

```
apps/cordele-web/        shell application
libs/imp/                Importação (upload, structure review)
libs/comp/               Composição (metadata, layout, preview)
libs/pub/                Publicação (export, validation, history)
libs/proj/               Projetos (library, download & history)
libs/shared/             auth session, empresa context, access decision, HTTP base, UI
docs/                    architecture: lib specs, ADRs, standards, issues
design-reference/        design prototypes
```

## Setup (Node 22)

```bash
npm install
npx nx serve cordele-web
npx nx run-many -t test
npx nx run-many -t lint
npx nx build cordele-web
```

Each module lib ships mock and HTTP adapters (`provideImp({ adapter: 'mock' })` etc.).
The session is read from a JWT in `localStorage['cordele_access_token']`.

## License

MIT — see [LICENSE](LICENSE).
