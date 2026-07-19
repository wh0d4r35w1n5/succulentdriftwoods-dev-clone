# Feed API Auth Setup

This dev clone is hosted on GitHub Pages, so API secrets must stay in GitHub Actions secrets and never be committed into browser JavaScript.

## GitHub Secrets

Add these repository secrets to `wh0d4r35w1n5/succulentdriftwoods-dev-clone`:

- `GOOGLE_PLACES_API_KEY`: Google Cloud API key with Places API enabled.
- `GOOGLE_PLACE_ID`: Google Place ID for Succulent Driftwoods at 19 Yengarie Way, Ocean Shores NSW 2483.
- `YOUTUBE_API_KEY`: Google Cloud API key with YouTube Data API v3 enabled. This can be the same key as `GOOGLE_PLACES_API_KEY` if both APIs are enabled.
- `INSTAGRAM_ACCESS_TOKEN`: Instagram Graph/Basic Display access token for `@succulentdriftwoods`.
- `INSTAGRAM_USER_ID`: Instagram user ID connected to that token.
- `TIKTOK_ACCESS_TOKEN`: TikTok Display API access token with video list permissions.

## Platform Notes

- Google reviews: use Google Places Details API or Business Profile API. Places Details returns a limited review set; Business Profile API is better for owner-managed reviews but requires account access and OAuth.
- Google review submission: customers must leave reviews on Google. The site links to the Succulent Driftwoods Google Maps listing because Google does not allow posting reviews through a third-party website form.
- Instagram: live feed access requires an Instagram Business/Creator account connected through Meta, or a long-lived token from the official Instagram API flow.
- TikTok: live feed access requires a TikTok developer app and Login Kit/Display API access.
- YouTube: feed access uses YouTube Data API v3 and the `@succulentdriftwoods` handle.

Run the workflow manually after secrets are added:

```bash
gh workflow run update-feeds.yml --repo wh0d4r35w1n5/succulentdriftwoods-dev-clone
```
