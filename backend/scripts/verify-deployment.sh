#!/bin/bash

# FastAPI Backend Production Deployment Verification Script
# This script verifies all requirements are met for production deployment

set -e

echo "================================================================"
echo "  FastAPI Backend Production Deployment Verification"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check counters
PASSED=0
FAILED=0

check_pass() {
    echo -e "${GREEN}PASS${NC}: $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}FAIL${NC}: $1"
    ((FAILED++))
}

check_info() {
    echo -e "${BLUE}INFO${NC}: $1"
}

check_warn() {
    echo -e "${YELLOW}WARN${NC}: $1"
}

cd "$(dirname "$0")/.."

echo -e "${BLUE}Step 1: Checking Python & Virtual Environment${NC}"
echo "-----------------------------------------------------------"

if [ -d "venv" ]; then
    check_pass "Virtual environment exists"

    if source venv/bin/activate 2>/dev/null; then
        check_pass "Virtual environment is activated"

        if python --version >/dev/null 2>&1; then
            PYTHON_VERSION=$(python --version)
            check_pass "Python is available: $PYTHON_VERSION"
        else
            check_fail "Python not found in venv"
        fi
    else
        check_fail "Could not activate virtual environment"
    fi
else
    check_warn "Virtual environment not found (create with: python -m venv venv)"
fi

echo ""
echo -e "${BLUE}Step 2: Checking Required Dependencies${NC}"
echo "-----------------------------------------------------------"

PACKAGES=("fastapi" "uvicorn" "starlette" "pydantic" "motor" "pymongo" "httpx" "slowapi")

for package in "${PACKAGES[@]}"; do
    if python -c "import ${package}" 2>/dev/null; then
        check_pass "Package installed: $package"
    else
        check_fail "Package missing: $package"
    fi
done

echo ""
echo -e "${BLUE}Step 3: Checking src/pravasi_api${NC}"
echo "-----------------------------------------------------------"

if [ -f "src/pravasi_api/main.py" ]; then
    check_pass "src/pravasi_api/main.py exists"

    if python -m py_compile src/pravasi_api/main.py 2>/dev/null; then
        check_pass "main.py syntax is valid"
    else
        check_fail "main.py has syntax errors"
    fi

    if grep -q "app = FastAPI" src/pravasi_api/main.py; then
        check_pass "FastAPI app instance found"
    else
        check_fail "FastAPI app instance not found"
    fi

    if grep -q "async def lifespan" src/pravasi_api/main.py; then
        check_pass "Lifespan context manager configured"
    else
        check_warn "Lifespan context manager not found"
    fi

    if grep -q "limiter = Limiter" src/pravasi_api/config.py; then
        check_pass "Rate limiter configured"
    else
        check_warn "Rate limiter not found"
    fi
else
    check_fail "src/pravasi_api/main.py not found"
fi

echo ""
echo -e "${BLUE}Step 4: Checking requirements.txt${NC}"
echo "-----------------------------------------------------------"

if [ -f "requirements.txt" ]; then
    check_pass "requirements.txt exists"

    REQ_COUNT=$(wc -l < requirements.txt | xargs)
    if [ "$REQ_COUNT" -lt 50 ]; then
        check_pass "requirements.txt is optimized ($REQ_COUNT lines)"
    else
        check_warn "requirements.txt is large ($REQ_COUNT lines), consider optimization"
    fi

    DEV_PACKAGES=("pytest" "black" "mypy" "flake8" "isort")
    for pkg in "${DEV_PACKAGES[@]}"; do
        if grep -q "^$pkg" requirements.txt; then
            check_warn "Development package found in requirements.txt: $pkg (should be in requirements-dev.txt)"
        fi
    done
else
    check_fail "requirements.txt not found"
fi

echo ""
echo -e "${BLUE}Step 5: Checking Environment Variables${NC}"
echo "-----------------------------------------------------------"

if [ -f ".env" ]; then
    check_pass ".env file exists"

    if grep -q "MONGO_URL" .env; then
        check_pass "MONGO_URL configured"
    else
        check_fail "MONGO_URL not found in .env"
    fi

    if grep -q "DB_NAME" .env; then
        check_pass "DB_NAME configured"
    else
        check_fail "DB_NAME not found in .env"
    fi

    if grep -q "API_KEY" .env; then
        check_pass "API_KEY configured"
    else
        check_warn "API_KEY not found in .env"
    fi

    if grep -q "GOOGLE_API_KEY" .env; then
        check_pass "GOOGLE_API_KEY configured"
    else
        check_warn "GOOGLE_API_KEY not found in .env (optional, fallback available)"
    fi
else
    check_warn ".env file not found (copy .env.example and fill in real values)"
fi

echo ""
echo -e "${BLUE}Step 6: Testing Imports${NC}"
echo "-----------------------------------------------------------"

if PYTHONPATH=src python -c "from pravasi_api.main import app; from pravasi_api.config import limiter" 2>/dev/null; then
    check_pass "All critical imports successful"
else
    check_fail "Error importing pravasi_api"
fi

echo ""
echo -e "${BLUE}Step 7: Production Commands${NC}"
echo "-----------------------------------------------------------"

check_info "Install dependencies: pip install -r requirements.txt"
check_info "Development server: uvicorn pravasi_api.main:app --reload --host 0.0.0.0 --port 8000"
check_info "Production server: uvicorn pravasi_api.main:app --host 0.0.0.0 --port 8000 --workers 4"

echo ""
echo "================================================================"
echo "                     TEST SUMMARY"
echo "================================================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}All checks passed. Ready for production deployment.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}Some checks failed. Fix the issues above.${NC}"
    exit 1
fi
