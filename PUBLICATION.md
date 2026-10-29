# Publishing the atlas

The repository is useful independently of a public website: it preserves source-linked data, editable SVGs, the browser app and research audits.

## GitHub Pages

1. In repository Settings → Pages, select **GitHub Actions** as the publishing source.
2. In Actions, choose **Publish atlas to GitHub Pages** and run it. The workflow validates and deploys only `site/dist/`.
3. GitHub reports the resulting Pages URL. The app uses relative URLs, so it also works at a project path such as `https://infowetrust.github.io/ellsworth-kelly/`.

The deployment workflow is manual: pushing data does not automatically publish the website. The validation workflow runs on pushes and pull requests.

## Proposed custom domain: ellsworth.infowetrust.com

After the Pages site is working:

1. Set `ellsworth.infowetrust.com` as the custom domain in the repository's Pages settings.
2. At the DNS provider, add a **CNAME** with host **ellsworth**, targeting **infowetrust.github.io** (the connected GitHub account). The target has no repository path.
3. Wait for GitHub's DNS check and certificate, then enable **Enforce HTTPS** when available.

The DNS lookup during preparation returned Bluehost nameservers for infowetrust.com and no CNAME for this subdomain. No DNS records were changed. Confirm the provider before making changes. With a custom Actions workflow, a CNAME file alone does not configure the custom domain; use Pages settings or its API.

Official references: [GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
