# Yoav Got Mail Dashboard

Static analytics hub and note suggestion machine for `https://yoavgotmail.substack.com/`.

## What it does

- Pulls public publication metadata and the RSS feed.
- Pulls public profile activity, including notes and post activity.
- Pulls public activity from a configurable watchlist of other Substacks.
- Builds a static `data/dashboard.json` snapshot for GitHub Pages.
- Shows note prompts, draft note copy, post coverage, timing slots, and watchlist patterns.

## Refresh the data

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\update-data.ps1
```

The script reads `config/watchlist.json` and writes `data/dashboard.json`.

## Customize the watchlist

Edit `config/watchlist.json` and add more Substack handles:

```json
{
  "handles": [
    { "handle": "on", "label": "On Substack" },
    { "handle": "examplewriter", "label": "Example Writer" }
  ]
}
```

## Deploy

This repo is static. Push it to GitHub and enable GitHub Pages from the root branch.
