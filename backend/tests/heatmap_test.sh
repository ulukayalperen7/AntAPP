#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# Heatmap Load Test Script
#
# Prerequisites:
#   - Backend running locally (dotnet run / dotnet watch)
#   - Valkey running on localhost:6379
#   - Auth:AutoConfirmEmail=true for load-test users (or pre-confirm them manually)
#
# Usage:
#   chmod +x heatmap_test.sh
#   ./heatmap_test.sh              # default: 20 users, 50 pings each
#   ./heatmap_test.sh 10 100       # 10 users, 100 pings each
###############################################################################

API_URL="${API_URL:-https://antapp.fun/api}"
USER_COUNT="${1:-20}"
PINGS_PER_USER="${2:-50}"
PASSWORD="Test1234!"

# Antalya bounding box (lat/lng)
MIN_LAT=36.82
MAX_LAT=36.92
MIN_LNG=30.60
MAX_LNG=30.80

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CREDS_FILE="$SCRIPT_DIR/heatmap_test_users.json"
TOKENS_FILE=$(mktemp)
RESULTS_FILE=$(mktemp)

trap 'rm -f "$TOKENS_FILE" "$RESULTS_FILE"' EXIT

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $*"; }
ok()   { echo -e "${GREEN}  ✓${NC} $*"; }
fail() { echo -e "${RED}  ✗${NC} $*"; }
warn() { echo -e "${YELLOW}  ⚠${NC} $*"; }

# Robust curl wrapper
api_call() {
    local METHOD="$1"
    local API_PATH="$2"
    local DATA="${3:-}"
    local TOKEN="${4:-}"
    
    local OPTS=("-s" "-w" "\n%{http_code}")
    OPTS+=("-X" "$METHOD")
    OPTS+=("-H" "Content-Type: application/json")
    
    if [[ -n "$TOKEN" ]]; then
        OPTS+=("-H" "Authorization: Bearer $TOKEN")
    fi
    
    if [[ -n "$DATA" ]]; then
        OPTS+=("-d" "$DATA")
    fi
    
    # We use '|| true' to prevent set -e from killing the script on curl transfer errors
    local RESPONSE
    RESPONSE=$(curl "${OPTS[@]}" "${API_URL}${API_PATH}" 2>/dev/null || echo -e "\n000")
    
    echo "$RESPONSE"
}

###############################################################################
# Phase 1: Register 20 users
###############################################################################
log "Phase 1: Registering ${USER_COUNT} users..."

echo "[" > "$CREDS_FILE"
REGISTERED=0

for i in $(seq 1 "$USER_COUNT"); do
    EMAIL="heatmap.test${i}@antapp.test"
    USERNAME="heatmaptest${i}"

    RESPONSE=$(api_call "POST" "/auth/register" "{
            \"userType\": 0,
            \"email\": \"${EMAIL}\",
            \"userName\": \"${USERNAME}\",
            \"password\": \"${PASSWORD}\",
            \"confirmPassword\": \"${PASSWORD}\"
        }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [[ "$HTTP_CODE" == "200" ]]; then
        ok "Registered ${USERNAME} (${EMAIL})"
        REGISTERED=$((REGISTERED + 1))
    else
        # Could already exist from a previous run
        if echo "$BODY" | grep -qi "already"; then
            warn "Already exists: ${USERNAME}"
            REGISTERED=$((REGISTERED + 1))
        else
            fail "Failed to register ${USERNAME} (HTTP ${HTTP_CODE}): ${BODY}"
        fi
    fi

    # Write credentials
    COMMA=""
    if [ "$i" -lt "$USER_COUNT" ]; then COMMA=","; fi
    echo "  {\"email\": \"${EMAIL}\", \"username\": \"${USERNAME}\", \"password\": \"${PASSWORD}\"}${COMMA}" >> "$CREDS_FILE"
done

echo "]" >> "$CREDS_FILE"
log "Credentials saved to: ${CREDS_FILE}"
log "Registered/found ${REGISTERED}/${USER_COUNT} users"

###############################################################################
# Phase 2: Login all users & collect JWT tokens
###############################################################################
log "Phase 2: Logging in ${USER_COUNT} users..."

LOGGED_IN=0
> "$TOKENS_FILE"

for i in $(seq 1 "$USER_COUNT"); do
    EMAIL="heatmap.test${i}@antapp.test"

    RESPONSE=$(api_call "POST" "/auth/login" "{\"email\": \"${EMAIL}\", \"password\": \"${PASSWORD}\"}")

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [[ "$HTTP_CODE" == "200" ]]; then
        TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['jwToken'])" 2>/dev/null || echo "")
        if [[ -n "$TOKEN" ]]; then
            echo "$TOKEN" >> "$TOKENS_FILE"
            LOGGED_IN=$((LOGGED_IN + 1))
            ok "Login OK: heatmaptest${i}"
        else
            fail "Login OK but no token: heatmaptest${i}"
        fi
    else
        fail "Login failed for heatmaptest${i}: ${BODY}"
    fi
done

log "Logged in ${LOGGED_IN}/${USER_COUNT} users"

if [[ "$LOGGED_IN" -eq 0 ]]; then
    fail "No users logged in. Is the backend running? Is ASPNETCORE_ENVIRONMENT=Development?"
    exit 1
fi

###############################################################################
# Phase 3: Functional test — single ping + tile check
###############################################################################
log "Phase 3: Functional test..."

FIRST_TOKEN=$(head -1 "$TOKENS_FILE")

# Ping with a known coordinate (Antalya city center)
RESPONSE=$(api_call "POST" "/heatmap/ping" '{"latitude": 36.8969, "longitude": 30.7133}' "$FIRST_TOKEN")

PING_CODE=$(echo "$RESPONSE" | tail -1)
PING_BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$PING_CODE" == "200" ]]; then
    ok "Ping endpoint works: ${PING_BODY}"
else
    fail "Ping failed (HTTP ${PING_CODE}): ${PING_BODY}"
    exit 1
fi

# Fetch tiles covering that area
RESPONSE=$(api_call "GET" "/heatmap/tiles?minLat=36.85&minLng=30.65&maxLat=36.95&maxLng=30.75&zoom=14")

TILES_CODE=$(echo "$RESPONSE" | tail -1)
TILES_BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$TILES_CODE" == "200" ]]; then
    TILE_COUNT=$(echo "$TILES_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null || echo "?")
    ok "Tiles endpoint works: ${TILE_COUNT} non-zero tiles returned"
else
    fail "Tiles failed (HTTP ${TILES_CODE}): ${TILES_BODY}"
fi

# Test with fake token — should be rejected
RESPONSE=$(api_call "POST" "/heatmap/ping" '{"latitude": 36.8969, "longitude": 30.7133}' "totally.fake.token.here")
FAKE_CODE=$(echo "$RESPONSE" | tail -1)
if [[ "$FAKE_CODE" == "401" ]]; then
    ok "Fake token correctly rejected (401)"
else
    fail "Fake token was NOT rejected (HTTP ${FAKE_CODE}) — SECURITY ISSUE"
fi

# Test with no token — should be rejected
RESPONSE=$(api_call "POST" "/heatmap/ping" '{"latitude": 36.8969, "longitude": 30.7133}')
NO_TOKEN_CODE=$(echo "$RESPONSE" | tail -1)
if [[ "$NO_TOKEN_CODE" == "401" ]]; then
    ok "No-token request correctly rejected (401)"
else
    fail "No-token request was NOT rejected (HTTP ${NO_TOKEN_CODE})"
fi

###############################################################################
# Phase 4: Swarm test — concurrent pings
###############################################################################
log "Phase 4: Swarm test — ${LOGGED_IN} users × ${PINGS_PER_USER} pings = $((LOGGED_IN * PINGS_PER_USER)) total requests"

random_lat() {
    python3 -c "import random; print(f'{random.uniform(${MIN_LAT}, ${MAX_LAT}):.6f}')"
}
random_lng() {
    python3 -c "import random; print(f'{random.uniform(${MIN_LNG}, ${MAX_LNG}):.6f}')"
}

> "$RESULTS_FILE"
START_TIME=$(date +%s%N)

# Launch all users in parallel, each sending PINGS_PER_USER sequential pings
USER_IDX=0
while IFS= read -r TOKEN; do
    USER_IDX=$((USER_IDX + 1))
    (
        SUCCESSES=0
        FAILURES=0
        for i in $(seq 1 "$PINGS_PER_USER"); do
            LAT=$(random_lat)
            LNG=$(random_lng)
            
            RESPONSE=$(api_call "POST" "/heatmap/ping" "{\"latitude\": ${LAT}, \"longitude\": ${LNG}}" "$TOKEN")
            HTTP_CODE=$(echo "$RESPONSE" | tail -1)

            if [[ "$HTTP_CODE" == "200" ]]; then
                SUCCESSES=$((SUCCESSES + 1))
            else
                FAILURES=$((FAILURES + 1))
            fi
            
            # Progress log every 10 pings or at the end
            if (( i % 10 == 0 || i == PINGS_PER_USER )); then
                echo "User $USER_IDX: $i/$PINGS_PER_USER pings completed" >&2
            fi
        done
        echo "${SUCCESSES},${FAILURES}" >> "$RESULTS_FILE"
    ) &
done < "$TOKENS_FILE"

# Wait for all background jobs
log "Waiting for all swarm requests to complete..."
wait

END_TIME=$(date +%s%N)
ELAPSED_MS=$(( (END_TIME - START_TIME) / 1000000 ))
ELAPSED_SEC=$(python3 -c "print(f'{${ELAPSED_MS}/1000:.2f}')")

# Tally results
TOTAL_OK=0
TOTAL_FAIL=0
while IFS=',' read -r S F; do
    TOTAL_OK=$((TOTAL_OK + S))
    TOTAL_FAIL=$((TOTAL_FAIL + F))
done < "$RESULTS_FILE"

TOTAL=$((TOTAL_OK + TOTAL_FAIL))
RPS=$(python3 -c "print(f'{${TOTAL}/(${ELAPSED_MS}/1000):.1f}')" 2>/dev/null || echo "?")

echo ""
log "═══════════════════════════════════════════════"
log "  SWARM TEST RESULTS"
log "═══════════════════════════════════════════════"
log "  Users:         ${LOGGED_IN}"
log "  Pings/user:    ${PINGS_PER_USER}"
log "  Total:         ${TOTAL}"
log "  Success:       ${TOTAL_OK}"
log "  Failed:        ${TOTAL_FAIL}"
log "  Duration:      ${ELAPSED_SEC}s"
log "  Throughput:    ${RPS} req/s"
log "═══════════════════════════════════════════════"

###############################################################################
# Phase 5: Verify heatmap state
###############################################################################
log "Phase 5: Verifying final heatmap state..."

FINAL_TILES=$(curl -s "${API_URL}/heatmap/tiles?minLat=${MIN_LAT}&minLng=${MIN_LNG}&maxLat=${MAX_LAT}&maxLng=${MAX_LNG}&zoom=14" 2>/dev/null)

TILE_INFO=$(echo "$FINAL_TILES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
tiles = data.get('data', [])
total_users = sum(t['count'] for t in tiles)
print(f'tiles={len(tiles)} users_in_tiles={total_users}')
" 2>/dev/null || echo "tiles=? users_in_tiles=?")

ok "Final state: ${TILE_INFO}"

if [[ "$TOTAL_FAIL" -eq 0 ]]; then
    echo ""
    echo -e "${GREEN}All tests passed!${NC}"
else
    echo ""
    echo -e "${YELLOW}Tests completed with ${TOTAL_FAIL} failures.${NC}"
fi
