# Cloudflare Pages sites

Source repository for the eight websites in Cloudflare account `957cff16ad6c8cfb15c078cded9ac3dc`.

Each Pages project connects directly to this repository's `main` branch, uses its domain directory as the build root, runs `node ../pages-build.mjs DOMAIN`, and publishes `pages-dist`. Automatic production builds watch the domain directory and `pages-build.mjs`.

- vigorbuysheetdesk.com
- cssbuyfindshub.com
- kakobuysheetdesk.com
- lovegobuysheetlab.com
- oopbuyqcguide.com
- orientdigsheetdesk.com
- sugargoosheetdesk.com
- superbuyfindsdesk.com

The site source directories were copied without changes from seo-sites commit d956440a84a4e53c4d670bd06fb1e6badd1aa54f. Static image and interface paths bypass Pages Functions where supported. Pages Functions still share the account's daily free-tier request allowance.
