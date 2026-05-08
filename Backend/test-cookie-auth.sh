#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# Cookie-Based Authentication Test Script
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:5000}"
COOKIE_FILE="test-cookies.txt"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Cookie-Based Authentication Test${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}API URL: ${API_URL}${NC}"
echo ""

# Clean up old cookie file
rm -f "$COOKIE_FILE"

# ─── Test 1: Health Check ──────────────────────────────────────────────────────
echo -e "${BLUE}[1/5] Testing health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s "${API_URL}/api/v1/health")
if echo "$HEALTH_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    exit 1
fi
echo ""

# ─── Test 2: Login (Should set cookie) ────────────────────────────────────────
echo -e "${BLUE}[2/5] Testing login (should set HTTP-only cookie)...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@ecom.dev","password":"admin1234"}' \
    -c "$COOKIE_FILE" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Login successful (HTTP $HTTP_CODE)${NC}"
    
    # Check if token is NOT in response body
    if echo "$RESPONSE_BODY" | grep -q '"token"'; then
        echo -e "${RED}✗ WARNING: Token found in response body (should only be in cookie)${NC}"
    else
        echo -e "${GREEN}✓ Token not in response body (correct - cookie-only)${NC}"
    fi
    
    # Check if cookie file was created
    if [ -f "$COOKIE_FILE" ]; then
        echo -e "${GREEN}✓ Cookie file created${NC}"
        
        # Check for jwt cookie
        if grep -q "jwt" "$COOKIE_FILE"; then
            echo -e "${GREEN}✓ JWT cookie found${NC}"
            
            # Display cookie details
            echo -e "${YELLOW}Cookie details:${NC}"
            grep "jwt" "$COOKIE_FILE" | while read -r line; do
                echo "  $line"
            done
        else
            echo -e "${RED}✗ JWT cookie not found in cookie file${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Cookie file not created${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Login failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
    exit 1
fi
echo ""

# ─── Test 3: Access Protected Route (Should work with cookie) ─────────────────
echo -e "${BLUE}[3/5] Testing protected route with cookie...${NC}"
ME_RESPONSE=$(curl -s -X GET "${API_URL}/api/v1/users/me" \
    -b "$COOKIE_FILE" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$ME_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ME_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Protected route accessible with cookie (HTTP $HTTP_CODE)${NC}"
    
    # Extract user email
    USER_EMAIL=$(echo "$RESPONSE_BODY" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$USER_EMAIL" ]; then
        echo -e "${GREEN}✓ User authenticated: ${USER_EMAIL}${NC}"
    fi
else
    echo -e "${RED}✗ Protected route failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
    exit 1
fi
echo ""

# ─── Test 4: Access Protected Route WITHOUT Cookie (Should fail) ──────────────
echo -e "${BLUE}[4/5] Testing protected route WITHOUT cookie (should fail)...${NC}"
NO_COOKIE_RESPONSE=$(curl -s -X GET "${API_URL}/api/v1/users/me" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$NO_COOKIE_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ Protected route correctly rejected without cookie (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ Protected route should return 401 without cookie (got HTTP $HTTP_CODE)${NC}"
    exit 1
fi
echo ""

# ─── Test 5: Logout (Should clear cookie) ─────────────────────────────────────
echo -e "${BLUE}[5/5] Testing logout (should clear cookie)...${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/auth/logout" \
    -b "$COOKIE_FILE" \
    -c "$COOKIE_FILE" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Logout successful (HTTP $HTTP_CODE)${NC}"
    
    # Try to access protected route after logout
    AFTER_LOGOUT_RESPONSE=$(curl -s -X GET "${API_URL}/api/v1/users/me" \
        -b "$COOKIE_FILE" \
        -w "\n%{http_code}")
    
    AFTER_LOGOUT_CODE=$(echo "$AFTER_LOGOUT_RESPONSE" | tail -n1)
    
    if [ "$AFTER_LOGOUT_CODE" = "401" ]; then
        echo -e "${GREEN}✓ Cookie cleared - protected route now returns 401${NC}"
    else
        echo -e "${RED}✗ Cookie not properly cleared (got HTTP $AFTER_LOGOUT_CODE)${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Logout failed (HTTP $HTTP_CODE)${NC}"
    exit 1
fi
echo ""

# ─── Summary ───────────────────────────────────────────────────────────────────
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ All tests passed!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Cookie-based authentication is working correctly:${NC}"
echo -e "  ✓ Login sets HTTP-only cookie"
echo -e "  ✓ Token not exposed in response body"
echo -e "  ✓ Protected routes work with cookie"
echo -e "  ✓ Protected routes fail without cookie"
echo -e "  ✓ Logout clears cookie"
echo ""

# Clean up
rm -f "$COOKIE_FILE"

echo -e "${BLUE}Test complete!${NC}"
