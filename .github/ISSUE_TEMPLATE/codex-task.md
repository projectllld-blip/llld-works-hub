---
name: Codex Task
about: Codexに依頼する作業票
title: "[Codex] "
labels: codex-ready
assignees: ""
---

## Phase

## Issue種別
例: automation / portal / marketplace / supabase / docs / qa / security / uiux

## 対象領域
例: Codex運用 / 社内ポータル / Works Market / Supabase Auth / QA workflow

## 目的

## 作業内容

## 今回やらないこと

## 前回からの引き継ぎ

## 必ず参照するファイル
- AGENTS.md
- docs/00_PROJECT_STATUS.md
- docs/02_STOP_CONDITIONS.md
- docs/03_CODEX_REPORT_FORMAT.md
- docs/04_NEXT_PROMPT_RULES.md

## 触ってよいファイル

## 触ってはいけないファイル

## STOP条件
docs/02_STOP_CONDITIONS.md に該当した場合は、それ以上勝手に進めず、HUMAN_REQUIRED: YESとして報告してください。

## HUMAN_REQUIREDになりそうなポイント

## 確認項目

## 完了条件

## 想定ラベル
例: codex-ready, automation, docs

## 次にCodexへ投げる指示の要否
必要 / 不要

## HUMAN_REQUIREDの扱い
STOP条件に該当した場合は、それ以上勝手に進めず、HUMAN_REQUIRED: YESとして報告してください。

## 注意
- secretやAPIキーはIssue本文に貼らない。
- Supabase Dashboard操作が必要な場合はIssue内で明記する。
- UIUX判断が必要な場合は `needs-uiux-check` を想定ラベルに入れる。
- CodexはIssue本文とrepo内ドキュメントを正として作業する。
- 古いチャットログ全文は前提にしない。
