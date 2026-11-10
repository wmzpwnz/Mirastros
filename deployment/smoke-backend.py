"""Exercise a disposable database/API instance, never a production URL."""
import secrets
import subprocess
import sys
import tempfile
import time

import httpx


with tempfile.TemporaryFile() as log:
    process = subprocess.Popen(
        [sys.executable, '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '18000'],
        stdout=log, stderr=log,
    )
    try:
        with httpx.Client(base_url='http://127.0.0.1:18000', timeout=15) as client:
            for attempt in range(60):
                if process.poll() is not None:
                    raise RuntimeError('API exited during startup')
                try:
                    response = client.get('/health/readiness')
                    if response.status_code == 200:
                        break
                except httpx.TransportError:
                    pass
                time.sleep(0.5)
            else:
                raise RuntimeError('API did not become ready')
            email = f'smoke-{secrets.token_hex(8)}@example.com'
            password = secrets.token_urlsafe(20)
            response = client.post('/auth/register', json={
                'email': email, 'password': password, 'full_name': 'CI Smoke Test',
            })
            assert response.status_code == 201, f'Registration status {response.status_code}'
            response = client.post('/auth/login', json={'email': email, 'password': password})
            assert response.status_code == 200, f'Login status {response.status_code}'
            token = response.json()['access_token']
            response = client.get('/auth/me', headers={'Authorization': f'Bearer {token}'})
            assert response.status_code == 200
            assert response.json()['email'] == email
            print('Database/API readiness, registration, login and profile passed')
    finally:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
