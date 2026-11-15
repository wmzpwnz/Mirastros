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
            headers = {'Authorization': f'Bearer {token}'}
            response = client.get('/auth/onboarding/state', headers=headers)
            assert response.status_code == 200 and not response.json()['started']
            assert client.post('/auth/onboarding/start', headers=headers).status_code == 200
            response = client.post('/auth/onboarding/step', headers=headers, json={'step': 'name', 'full_name': 'Александр'})
            assert response.status_code == 200 and response.json()['portrait']['name']['verified']
            response = client.post('/auth/onboarding/step', headers=headers, json={'step': 'birth', 'birth_date': '1990-01-01'})
            assert response.status_code == 200 and response.json()['portrait']['number']['value'] == 3
            response = client.post('/auth/onboarding/step', headers=headers, json={
                'step': 'sky', 'birth_time': None,
                'birth_location': {'city': 'Москва', 'country': 'Россия', 'latitude': 55.75, 'longitude': 37.62},
            })
            assert response.status_code == 200, response.text
            assert response.json()['portrait']['sky']['ascendant'] is None
            assert client.post('/auth/onboarding/complete', headers=headers).status_code == 200
            assert client.get('/auth/onboarding/state', headers=headers).json()['completed']
            assert client.get('/auth/me', headers=headers).json()['birth_date'] == '1990-01-01'
            assert client.get('/auth/onboarding/state').status_code in (401, 403)
            print('Database/API readiness, registration, login, shared profile and welcome flow passed')
    finally:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
