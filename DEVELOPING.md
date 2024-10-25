# Developer docs

## Release process

1. Bump versions in:
   - `package.json`: `version` and `consolePlugin.version`
   - `charts/Chart.yaml`
2. Create a GitHub release:
   - Allow GitHub to auto-create a matching tag in the format `vX.Y.Z`
   - Generate release notes from previous PR's, and review them for quality
3. Quay will automatically build the matching container image
