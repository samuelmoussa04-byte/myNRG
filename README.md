# Shopify storefront theme

This is a lightweight Shopify Online Store 2.0 theme. Product, collection, page,
search, and cart data are rendered from Shopify with Liquid; no Admin API token
or private credentials belong in this theme.

## Connect it to a store

1. Install the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) and sign in:

   ```sh
   shopify auth login
   ```

2. Preview against your store:

   ```sh
   shopify theme dev --store your-store.myshopify.com
   ```

3. When ready, upload the theme:

   ```sh
   shopify theme push --store your-store.myshopify.com
   ```

   Review Shopify's prompt before publishing. `theme push` uploads a theme; it
   does not publish it to customers unless you explicitly choose to publish.

Choose a collection in the homepage's Featured collection section in the theme
editor. Add products and collections in Shopify Admin; this theme reads them
from the connected store.
