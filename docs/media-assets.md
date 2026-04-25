# Media Asset Process

This repo is at the stage where accidental asset sprawl is a bigger risk than missing files. The goal from here is:

- keep paths stable once a story is published
- make new assets easy to place and easy to find
- avoid silent dependencies on scaffold media

## Current rules

- Do not rename or move an existing file in `static/media/` unless every repo reference has been updated in the same pass.
- Before deleting a file from `static/media/`, search the repo for its `/media/...` path first.
- A video should only declare a captions file if it actually has one. There is no longer a global default captions asset.

## Structure for new assets

Use nested folders under `static/media/` for all new story assets:

- `static/media/parliament-now/<story-slug>/`
- `static/media/parliament-at-work/<story-slug>/`
- `static/media/parliament-explained/<story-slug>/`
- `static/media/shared/` for assets intentionally reused across multiple stories

Examples:

- `static/media/parliament-at-work/the-seanad-at-work/cathaoirleach-hero.jpg`
- `static/media/parliament-at-work/the-seanad-at-work/full-chamber-poster.jpg`
- `static/media/parliament-now/health-report-23-april/report-launch.mp4`

Existing flat files in `static/media/` can stay where they are until there is a deliberate migration.

## Naming

- Use lowercase.
- Use hyphenated filenames.
- Prefer short descriptive names tied to the story purpose.
- Avoid spaces and underscores in new filenames.
- Keep derivatives explicit:
  - `full-chamber.jpg`
  - `full-chamber-poster.jpg`
  - `full-chamber-thumb.jpg`

## Recommended workflow

1. Add raw exports outside the repo or in a temporary local workspace.
2. Choose the final image or video.
3. Export a web-ready version with the final filename.
4. Place it in the appropriate `static/media/<section>/<story-slug>/` folder.
5. Reference that final path in the story file.
6. If replacing an existing asset, update the story reference first, then remove the old file only after a repo search confirms it is unused.

## Migration strategy

If we want to clean up the current flat media directory later, do it in small batches:

1. Pick one story.
2. Move only that story's assets into a folder.
3. Update references in the same change.
4. Verify no old paths remain.

Avoid doing a full-directory rename sweep in one pass.

## Known cleanup candidates

These files are currently present but not referenced anywhere in `src/`:

- `Commemorative-coin-presented-to-President-Zelenskyy-in-2025.jpg`
- `ceann_comhairle_chair.jpg`
- `ceann_comhairle_in_dail.jpg`
- `ceann_comhairle_in_the_chair.jpg`
- `harbour-hero.png`
- `harbour-motion.mp4`
- `island-harbour.png`
- `island-north-road.png`
- `island-overview.png`
- `island-saltmarsh.png`
- `letter-and-gift-to-President-Zelenskyy-of-Ukraine-2025.jpg`
- `seanad_wide.png`
- `taoiseach_in_dail.jpg`
- `taoiseach_leaders.png`

Treat these as review candidates, not automatic deletions.
