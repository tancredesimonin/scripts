# 🚀 Ghost

### Build

```bash
yarn build
```

## Commands

### export ghost data

```bash
yarn run ghost export
```

### Steps done by the export script

- ✅ validate ghost blog export json file
- ✅ parse the ghost blog export json file
- 🧹 remove unpublished posts
- 🧹 remove pages
- ✅ write each post to a markdown file in /export
