// Fallback script for environments expecting v0 build injection.
// Some deploy targets run: `node .v0/inject-built-with-v0.mjs && next build`.
// Keeping this file in-repo avoids MODULE_NOT_FOUND failures.

process.exit(0)
