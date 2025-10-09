Storybook build & access

1) CI build

- This repository includes a GitHub Actions workflow: `.github/workflows/build-storybook.yml`.
- On push to `main` or on pull requests targeting `main`, the workflow will:
  - install dependencies
  - build Storybook (`npm run build-storybook`)
  - upload the `storybook-static` directory as an artifact
  - publish the `storybook-static` directory to GitHub Pages (branch `gh-pages`)

2) Downloading the artifact manually

- Open the repository on GitHub, go to the Actions tab, pick the workflow run you want, and find the "Artifacts" section on the run summary.
- Download the `storybook-static` artifact and extract it locally. Open the extracted `index.html` in a browser to view Storybook.

3) View Storybook on GitHub Pages

- After a successful workflow run, the static Storybook will be published to GitHub Pages. The URL will typically be:

  https://<owner>.github.io/<repo>/

- Replace `<owner>` (Geodev122) and `<repo>` (Mitche) accordingly. If the repo is private, GitHub Pages publishing may behave differently.
