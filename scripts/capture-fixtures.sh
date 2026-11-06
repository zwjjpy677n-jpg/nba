#!/usr/bin/env bash
# Save real ESPN responses into tests/fixtures for parser tests.
# Usage: scripts/capture-fixtures.sh [POST_DATE] [PRE_DATE] [EVENT_ID]
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=tests/fixtures
POST=${1:-20261104}
PRE=${2:-20261110}
EVENT=${3:-401909922}
SITE=https://site.api.espn.com/apis/site/v2/sports/basketball/nba
V2=https://site.api.espn.com/apis/v2/sports/basketball/nba
WEB=https://site.web.api.espn.com/apis/common/v3
mkdir -p "$OUT"
get() { curl -fsS "$2" | python3 -m json.tool --no-ensure-ascii > "$OUT/$1"; echo "saved $1"; }
get scoreboard-post.json "$SITE/scoreboard?dates=$POST"
get scoreboard-pre.json "$SITE/scoreboard?dates=$PRE"
get summary.json "$SITE/summary?event=$EVENT"
get standings.json "$V2/standings"
get teams.json "$SITE/teams"
get schedule-min.json "$SITE/teams/min/schedule"
get roster-min.json "$SITE/teams/min/roster"
get teamstats-min.json "$SITE/teams/min/statistics"
get search-edwards.json "$WEB/search?query=edwards&type=player&sport=basketball&league=nba&limit=10"
get overview-4594268.json "$WEB/sports/basketball/nba/athletes/4594268/overview"
get leaders.json "$WEB/sports/basketball/nba/statistics/byathlete?region=us&lang=en&isqualified=true&page=1&limit=3&sort=offensive.avgPoints%3Adesc&category=offensive"
get athlete-4594268.json "$WEB/sports/basketball/nba/athletes/4594268"
get gamelog-4594268.json "$WEB/sports/basketball/nba/athletes/4594268/gamelog"
echo '{"events":[]}' > "$OUT/scoreboard-empty.json"
