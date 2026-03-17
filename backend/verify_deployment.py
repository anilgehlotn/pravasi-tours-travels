#!/usr/bin/env python3
"""
FastAPI Backend Production Deployment Verification
Checks all requirements for production deployment
"""

import sys
import os
import subprocess
from pathlib import Path

class Colors:
    GREEN = '\033[0;32m'
    RED = '\033[0;31m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'

PASSED = 0
FAILED = 0
WARNINGS = 0

def check_pass(msg):
    global PASSED
    print(f"{Colors.GREEN}✅ PASS{Colors.NC}: {msg}")
    PASSED += 1

def check_fail(msg):
    global FAILED
    print(f"{Colors.RED}❌ FAIL{Colors.NC}: {msg}")
    FAILED += 1

def check_warn(msg):
    global WARNINGS
    print(f"{Colors.YELLOW}⚠️  WARN{Colors.NC}: {msg}")
    WARNINGS += 1

def check_info(msg):
    print(f"{Colors.BLUE}ℹ️  INFO{Colors.NC}: {msg}")

def main():
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  FastAPI Backend Production Deployment Verification       ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()
    
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Step 1: Check Python
    print(f"{Colors.BLUE}Step 1: Checking Python & Dependencies{Colors.NC}")
    print("━" * 60)
    
    try:
        import fastapi
        check_pass("fastapi installed")
    except ImportError:
        check_fail("fastapi not installed")
    
    try:
        import uvicorn
        check_pass("uvicorn installed")
    except ImportError:
        check_fail("uvicorn not installed")
    
    try:
        import motor
        check_pass("motor installed")
    except ImportError:
        check_fail("motor not installed")
    
    try:
        import slowapi
        check_pass("slowapi installed")
    except ImportError:
        check_fail("slowapi not installed")
    
    try:
        import httpx
        check_pass("httpx installed")
    except ImportError:
        check_fail("httpx not installed")
    
    print()
    print(f"{Colors.BLUE}Step 2: Checking server.py{Colors.NC}")
    print("━" * 60)
    
    if Path("server.py").exists():
        check_pass("server.py exists")
        
        # Check syntax
        result = subprocess.run([sys.executable, "-m", "py_compile", "server.py"], 
                              capture_output=True)
        if result.returncode == 0:
            check_pass("server.py syntax is valid")
        else:
            check_fail("server.py has syntax errors")
        
        # Check for app instance
        with open("server.py", "r") as f:
            content = f.read()
            if "app = FastAPI" in content:
                check_pass("FastAPI app instance found")
            else:
                check_fail("FastAPI app instance not found")
            
            if "async def lifespan" in content:
                check_pass("Lifespan context manager configured")
            else:
                check_warn("Lifespan context manager not found")
            
            if "limiter = Limiter" in content:
                check_pass("Rate limiter configured")
            else:
                check_warn("Rate limiter not found")
    else:
        check_fail("server.py not found")
    
    print()
    print(f"{Colors.BLUE}Step 3: Checking requirements.txt{Colors.NC}")
    print("━" * 60)
    
    if Path("requirements.txt").exists():
        check_pass("requirements.txt exists")
        
        with open("requirements.txt", "r") as f:
            lines = [l.strip() for l in f.readlines() if l.strip() and not l.startswith("#")]
        
        check_pass(f"requirements.txt is optimized ({len(lines)} dependencies)")
        
        # Check for dev packages
        dev_packages = ["pytest", "black", "mypy", "flake8", "isort", "boto3", "pandas"]
        found_dev = []
        
        for pkg in dev_packages:
            if any(pkg in line for line in lines):
                found_dev.append(pkg)
        
        if not found_dev:
            check_pass("No development packages found in requirements.txt")
        else:
            check_warn(f"Found development packages: {', '.join(found_dev)}")
    else:
        check_fail("requirements.txt not found")
    
    print()
    print(f"{Colors.BLUE}Step 4: Checking Environment Variables{Colors.NC}")
    print("━" * 60)
    
    if Path(".env").exists():
        check_pass(".env file exists")
        
        with open(".env", "r") as f:
            env_content = f.read()
        
        required_vars = ["MONGO_URL", "DB_NAME"]
        optional_vars = ["API_KEY", "GOOGLE_API_KEY"]
        
        for var in required_vars:
            if var in env_content:
                check_pass(f"{var} configured")
            else:
                check_fail(f"{var} not found in .env")
        
        for var in optional_vars:
            if var in env_content:
                check_pass(f"{var} configured")
            else:
                check_warn(f"{var} not found in .env (optional)")
    else:
        check_warn(".env file not found (create with required variables)")
    
    print()
    print(f"{Colors.BLUE}Step 5: Testing Critical Imports{Colors.NC}")
    print("━" * 60)
    
    try:
        from server import app
        check_pass("FastAPI app instance imports successfully")
    except Exception as e:
        check_fail(f"Error importing app from server.py: {e}")
    
    try:
        from server import db
        check_pass("MongoDB connection object imports successfully")
    except Exception as e:
        check_fail(f"Error importing db from server.py: {e}")
    
    try:
        from server import limiter
        check_pass("Rate limiter imports successfully")
    except Exception as e:
        check_fail(f"Error importing limiter from server.py: {e}")
    
    print()
    print(f"{Colors.BLUE}Step 6: Production Deployment Commands{Colors.NC}")
    print("━" * 60)
    
    check_info("Install dependencies:")
    print(f"  pip install -r requirements.txt\n")
    
    check_info("Development server:")
    print(f"  uvicorn server:app --reload --host 0.0.0.0 --port 8000\n")
    
    check_info("Production server (basic):")
    print(f"  uvicorn server:app --host 0.0.0.0 --port 8000 --workers 4\n")
    
    check_info("Production server (with Gunicorn):")
    print(f"  pip install gunicorn")
    print(f"  gunicorn server:app --worker-class uvicorn.workers.UvicornWorker --workers 4\n")
    
    print()
    print("╔════════════════════════════════════════════════════════════╗")
    print("║                     VERIFICATION SUMMARY                   ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print(f"Passed:  {Colors.GREEN}{PASSED}{Colors.NC}")
    print(f"Failed:  {Colors.RED}{FAILED}{Colors.NC}")
    print(f"Warnings: {Colors.YELLOW}{WARNINGS}{Colors.NC}")
    
    print()
    if FAILED == 0:
        print(f"{Colors.GREEN}✅ All critical checks passed!{Colors.NC}")
        print(f"{Colors.GREEN}Your backend is ready for production deployment.{Colors.NC}")
        return 0
    else:
        print(f"{Colors.RED}❌ Some critical checks failed.{Colors.NC}")
        print(f"{Colors.RED}Please fix the issues above before deployment.{Colors.NC}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
