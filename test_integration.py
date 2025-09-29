#!/usr/bin/env python3
"""
Integration test script for Sidai Encop Farm Management System
"""

import subprocess
import time
import requests
import sys
import json

def test_backend():
    """Test if backend is working"""
    print("🧪 Testing Backend...")
    
    # Test Django check
    try:
        result = subprocess.run(
            ["python", "backend/manage.py", "check"],
            capture_output=True,
            text=True,
            cwd="."
        )
        if result.returncode == 0:
            print("✅ Django configuration is valid")
        else:
            print("❌ Django configuration has issues:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Error running Django check: {e}")
        return False
    
    # Start server in background
    print("🚀 Starting Django server...")
    server_process = None
    try:
        server_process = subprocess.Popen(
            ["python", "backend/manage.py", "runserver", "8000"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd="."
        )
        
        # Wait for server to start
        time.sleep(3)
        
        # Test API endpoints
        base_url = "http://localhost:8000"
        
        # Test registration
        print("📝 Testing user registration...")
        register_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        
        try:
            response = requests.post(f"{base_url}/api/auth/register/", data=register_data)
            if response.status_code == 201:
                print("✅ User registration working")
                user_data = response.json()
                token = user_data.get('token')
                
                # Test animals endpoint
                print("🐄 Testing animals API...")
                headers = {'Authorization': f'Token {token}'}
                animals_response = requests.get(f"{base_url}/api/api/animals/", headers=headers)
                
                if animals_response.status_code == 200:
                    print("✅ Animals API working")
                    
                    # Test creating an animal
                    print("➕ Testing animal creation...")
                    animal_data = {
                        'name': 'Test Cow',
                        'sex': 'Female',
                        'breed': 'Jersey',
                        'year_of_birth': 2020,
                        'health_status': 'Healthy'
                    }
                    
                    create_response = requests.post(
                        f"{base_url}/api/api/animals/",
                        json=animal_data,
                        headers=headers
                    )
                    
                    if create_response.status_code == 201:
                        animal = create_response.json()
                        print(f"✅ Animal created: {animal['name']} (ID: {animal['animal_id']})")
                        print("✅ Backend is fully functional!")
                        return True
                    else:
                        print(f"❌ Animal creation failed: {create_response.status_code}")
                        print(create_response.text)
                else:
                    print(f"❌ Animals API failed: {animals_response.status_code}")
            else:
                print(f"❌ Registration failed: {response.status_code}")
                print(response.text)
        
        except requests.exceptions.ConnectionError:
            print("❌ Could not connect to Django server")
            return False
        except Exception as e:
            print(f"❌ Error testing API: {e}")
            return False
            
    finally:
        if server_process:
            server_process.terminate()
            server_process.wait()
            print("🛑 Django server stopped")
    
    return False

def test_frontend():
    """Test if frontend files are properly structured"""
    print("\n🧪 Testing Frontend...")
    
    # Check if Next.js files exist
    import os
    
    required_files = [
        "frontend/package.json",
        "frontend/next.config.js",
        "frontend/tailwind.config.js",
        "frontend/tsconfig.json",
        "frontend/app/layout.tsx",
        "frontend/app/page.tsx",
        "frontend/app/globals.css",
        "frontend/components/AuthProvider.tsx",
        "frontend/components/Navbar.tsx",
        "frontend/lib/api.ts",
        "frontend/types/index.ts"
    ]
    
    all_exist = True
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} (missing)")
            all_exist = False
    
    if all_exist:
        print("✅ All frontend files are present")
        print("🔧 To run frontend:")
        print("   cd frontend")
        print("   npm install")
        print("   npm run dev")
        return True
    else:
        print("❌ Some frontend files are missing")
        return False

def main():
    """Main test function"""
    print("🎯 Sidai Enkop Farm Management System - Integration Test")
    print("=" * 60)
    
    backend_ok = test_backend()
    frontend_ok = test_frontend()
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS:")
    print(f"Backend:  {'✅ PASS' if backend_ok else '❌ FAIL'}")
    print(f"Frontend: {'✅ PASS' if frontend_ok else '❌ FAIL'}")
    
    if backend_ok and frontend_ok:
        print("\n🎉 System is ready for development!")
        print("\n🚀 To start the system:")
        print("1. Backend:  cd backend && python manage.py runserver")
        print("2. Frontend: cd frontend && npm install && npm run dev")
        print("3. Visit:    http://localhost:3000")
    else:
        print("\n🔧 Some issues need to be resolved before the system is fully functional.")
    
    return 0 if (backend_ok and frontend_ok) else 1

if __name__ == "__main__":
    sys.exit(main())
