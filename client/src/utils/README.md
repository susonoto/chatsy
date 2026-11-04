# Utils

Pure helper modules used across the client.

| File          | Purpose                                                                 |
|---------------|-------------------------------------------------------------------------|
| `crypto.ts`   | End-to-end encryption helpers using the Web Crypto API (AES-GCM + PBKDF2) |
| `storage.ts`  | Optional local-only message history (localStorage)                      |
| `cn.ts`       | Tiny utility combining `clsx` + `tailwind-merge` for class names        |

These modules have no React dependencies and can be unit-tested independently.
