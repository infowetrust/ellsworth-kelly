# Publishing the study

The canonical repository is https://github.com/infowetrust/ellsworth-kelly . The static application is `site/dist/`; it has no server, user database, third-party analytics or site credentials.

## GitHub Pages

Production target: **https://ellsworth.infowetrust.com/**. The public repository uses GitHub Pages with an Actions deployment. The November 8 deployment and initial custom-domain setup are preserved in the [dated record](research/publication-2026-11-08.json). This release selects preview O and includes the Gallery / Catalog / Plot refinements and source-reviewed palettes.

The November 9 release was merged in [PR #1](https://github.com/infowetrust/ellsworth-kelly/pull/1), deployed successfully, and verified on the custom domain with a valid certificate and HTTPS enforcement. All 497 SVGs and the other site files matched the local release byte for byte over HTTPS. See the [verification record](research/publication-2026-11-09.json).

Each deployment adds its exact Git commit to `/release.json`. Check that marker, the selected O preview and representative SVG/data assets on the live domain before reporting a release complete. The custom-domain certificate was retriggered on November 9 after correct DNS was independently verified; issuance completed and normal TLS verification passed before HTTPS enforcement was enabled.

Use GitHub Actions as the repository's Pages publishing source. Run **Publish study to GitHub Pages** manually after validation passes. The workflow deploys only `site/dist/`, including its data and SVG studies. Pushes validate changes without automatically deploying them.

Without a custom domain, the project URL is https://infowetrust.github.io/ellsworth-kelly/ . Relative asset paths support the repository path or a custom-domain root.

## Custom domain

Confirmed target: **ellsworth.infowetrust.com**.

1. Configure that domain in repository Settings → Pages (or the Pages API).
2. In the DNS manager for `infowetrust.com`, add a **CNAME** with host **ellsworth** and target **infowetrust.github.io**. Do not include a scheme, slash or repository path.
3. After public DNS resolves and GitHub provisions the certificate, enable **Enforce HTTPS**. Verify the actual HTTPS page before reporting the domain live.

The authoritative nameservers checked on November 8, 2026 were Bluehost's `ns1.bluehost.com` and `ns2.bluehost.com`. DNS editing requires the owner's signed-in account; no DNS credential belongs in this repository. The dated deployment record records what was actually completed, rather than treating this checklist as publication evidence.

With an Actions deployment, adding a CNAME file alone does not configure the Pages custom domain. Configure it in Pages settings/API. Configure Pages before pointing DNS, and preserve unrelated DNS records.

## Publication boundary

Only the sanitized portable repository is public. Source photographs, scanned books, raw OCR, local research captures, hosting state and credentials are excluded. `npm test` checks the distributed assets and this boundary. Original software is MIT; original research contributions are CC BY 4.0; the artwork studies and third-party material are excluded from both. See [LICENSING.md](LICENSING.md) and [RIGHTS.md](RIGHTS.md). This scope is not a rights clearance for public display of each artwork study.

Official references: [publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
