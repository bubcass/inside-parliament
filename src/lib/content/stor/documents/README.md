Canonical Stór documents should be saved here as metadata-wrapped JSON files.

Recommended layout:

- `committee-reports/<committee-slug>/<story-slug>.json`
- `library-research-service/<story-slug>.json`
- `parliamentary-budget-office/<story-slug>.json`

The publisher route at `/publisher` shows the suggested repo path for each export.

Both `.json` canonical documents and legacy `.ts` wrapper documents are currently loaded so the repo can transition gradually.
