# Digital Futures Initiative

Static, responsive public site designed for GitHub Pages.

## Publish

1. Create a GitHub repository and push this project to its `main` branch.
2. In GitHub, open **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The included workflow deploys the site when `main` changes.

## Contact form setup

The form is intentionally disabled until there is an official email address.

1. Create a Formspree form using that email address.
2. In `config.js`, paste the generated URL into `formEndpoint`.
3. Optionally add the verified `contactEmail` value.
4. Commit and push. The same form validates locally and submits to Formspree when configured.

Only add impact figures, programme details, addresses, or event information once they are verified.

## Local preview

Open `index.html` in a browser, or run any static web server from this directory.
