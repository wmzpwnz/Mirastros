#!/usr/bin/env python3
"""
Test runner script with coverage reporting
"""
import subprocess
import sys
import os
from pathlib import Path

def run_tests():
    """Run all tests with coverage"""
    print("🧪 Running Backend Tests")
    print("=" * 50)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Install test dependencies if needed
    print("📦 Installing test dependencies...")
    subprocess.run([
        sys.executable, "-m", "pip", "install", 
        "pytest", "pytest-asyncio", "pytest-cov", "httpx", "aiosqlite"
    ], check=True)
    
    # Run tests with coverage
    print("\n🏃 Running tests with coverage...")
    try:
        result = subprocess.run([
            sys.executable, "-m", "pytest",
            "tests/",
            "--cov=app",
            "--cov-report=term-missing",
            "--cov-report=html:htmlcov",
            "--cov-report=xml:coverage.xml",
            "-v",
            "--tb=short"
        ], check=True)
        
        print("\n✅ Tests completed successfully!")
        print(f"Coverage report saved to: {backend_dir}/htmlcov/index.html")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Tests failed with exit code {e.returncode}")
        return False

def run_specific_tests(test_pattern: str = None):
    """Run specific tests"""
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    cmd = [
        sys.executable, "-m", "pytest",
        "-v",
        "--tb=short"
    ]
    
    if test_pattern:
        cmd.append(f"-k={test_pattern}")
    else:
        cmd.append("tests/")
    
    print(f"🏃 Running: {' '.join(cmd)}")
    subprocess.run(cmd)

def generate_coverage_report():
    """Generate detailed coverage report"""
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    print("📊 Generating detailed coverage report...")
    subprocess.run([
        sys.executable, "-m", "pytest",
        "tests/",
        "--cov=app",
        "--cov-report=term-missing:skip-covered",
        "--cov-report=html:detailed_cov",
        "--cov-report=xml:detailed_coverage.xml"
    ])

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--specific":
            pattern = sys.argv[2] if len(sys.argv) > 2 else None
            run_specific_tests(pattern)
        elif sys.argv[1] == "--coverage":
            generate_coverage_report()
        else:
            print("Usage:")
            print("  python run_tests.py              # Run all tests")
            print("  python run_tests.py --specific   # Run specific tests")
            print("  python run_tests.py --coverage   # Generate detailed coverage")
    else:
        success = run_tests()
        sys.exit(0 if success else 1)