# Feed Setup

This dev clone is hosted on GitHub Pages. Any API secrets must stay in GitHub Actions secrets and never be committed into browser JavaScript.

## Free Google Reviews Setup

Google reviews stay API-free:

- The site embeds the public Google Map.
- The site links customers to the Succulent Driftwoods Google Maps listing.
- Customers leave reviews directly on Google Maps using their own Google account.

This avoids Google Maps Platform billing and does not require a Google API key.

## Optional Live Social Feed Secrets

Add these repository secrets only if/when you want automated social feed updates:

- `YOUTUBE_API_KEY`: YouTube Data API v3 key for the `@succulentdriftwoods` channel.
- `INSTAGRAM_ACCESS_TOKEN`: Instagram Graph/Basic Display access token for `@succulentdriftwoods`.
- `INSTAGRAM_USER_ID`: Instagram user ID connected to that token.
- `TIKTOK_ACCESS_TOKEN`: TikTok Display API access token with video list permissions.

Instagram and TikTok can stay as public profile links until those account logins are available.

Run the feed workflow manually after any optional secrets are added:

```bash
gh workflow run update-feeds.yml --repo wh0d4r35w1n5/succulentdriftwoods-dev-clone
```
