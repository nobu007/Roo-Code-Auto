# AUTOMATION.md — Roo-Code-Auto

大ゴール: AIによる全自動開発の実現。人間より圧倒的に効率的に。(fleet共通)

このリポジトリが担う開発方針と現在の作業波:
- [長期方針](docs/LONG_TERM_DIRECTION.md)
- [マイルストーン](docs/MILESTONES.md)
- [Dot 専任ワーカー指示書](docs/DOT_WORKER_INSTRUCTIONS.md)

## 発火 (Driver)
- crontab: 0本(2026-09-15 実測・全41行との突合)
- GitHub Actions: 10本
  - `changeset-release.yml`
  - `code-qa.yml`
  - `codeql.yml`
  - `discord-pr-notify.yml`
  - `evals.yml`
  - `marketplace-publish.yml`
  - `nightly-publish.yml`
  - `update-contributors.yml`
  - `website-deploy.yml`
  - `website-preview.yml`

## Kill Switch
`gh workflow disable changeset-release.yml code-qa.yml codeql.yml discord-pr-notify.yml evals.yml marketplace-publish.yml nightly-publish.yml update-contributors.yml website-deploy.yml website-preview.yml`

## Status
2026-09-15 初版整備(実測: crontab突合・workflow列挙)。fleet台帳: /home/jinno/business_notes/AUTOMATION.md
