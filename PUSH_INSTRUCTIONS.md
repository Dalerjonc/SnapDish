# Push Instructions

The local commits are ready. To push to GitHub, run one of:

## Option 1: GitHub Personal Access Token (PAT)

```bash
cd /Users/anton/.openclaw/workspace/SnapDish
git remote set-url origin https://YOUR_PAT@github.com/Dalerjonc/SnapDish.git
git push origin main
```

Replace `YOUR_PAT` with a GitHub PAT that has `repo` scope.
Generate one at: https://github.com/settings/tokens

## Option 2: GitHub CLI

```bash
gh auth login  # Follow prompts
cd /Users/anton/.openclaw/workspace/SnapDish
git push origin main
```

## Option 3: SSH Key

Set up SSH key for GitHub and change remote:
```bash
git remote set-url origin git@github.com:Dalerjonc/SnapDish.git
git push origin main
```

## Commits waiting to be pushed:

1. `c2709d4` - security: remove service-account.json from tracking, use env var for Google Vision credentials
2. `5209285` - feat: session auth, string recipe IDs, DB caching, subscription model
3. `e1408e5` - feat: auth improvements — persistent sessions, Google/Apple OAuth, protected routes
