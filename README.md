# Competitor Live Ads

A lightweight client-side tool to view Real Money Gaming (RMG) ads from the Meta Ad Library grouped by publisher, with filters for RMG categories and quick links to ad snapshots for screenshots.

## Running the app

This project is entirely static: open `index.html` in your browser or serve the folder locally.

```bash
# from the repo root
python -m http.server 8000
# then visit http://localhost:8000
```

## Using the Meta Graph API

1. Paste a valid Meta Graph API access token into the **Meta Graph API access token** field. The token is stored in local storage for convenience only.
2. Optionally enter search terms; otherwise the app defaults to a broad "real money gaming" query.
3. Choose RMG categories to **include** or **exclude**, then pick one or more publishers. Publishers are preloaded for each RMG vertical and restricted to the United States region.
4. Click **Fetch live ads** to request the latest ads from `https://graph.facebook.com/v19.0/ads_archive`. Results are grouped by publisher with snapshot links so you can capture screenshots per publisher.

If the Graph API request fails or you want to preview the layout, click **Load mock sample** to populate the UI with mock data.

## Notes

- Ads are requested with `ad_reached_countries=["US"]` to align with the provided publisher list.
- Category filters are applied based on the selected publishers and the configured category mapping from the RMG doc.
