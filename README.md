# marketing-dashboard


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Google Analytics

The `/dashboard/google-analytics` tab reads GA4 data through the Google Analytics Data API.
Configure these server-side environment variables before using it:

```bash
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
GOOGLE_ANALYTICS_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_ANALYTICS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Alternatively, for temporary local testing, you can provide:

```bash
GOOGLE_ANALYTICS_ACCESS_TOKEN=ya29...
```

The service account must have read access to the GA4 property.



