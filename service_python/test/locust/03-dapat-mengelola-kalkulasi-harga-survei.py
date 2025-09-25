# RUN 'locust -f test/locust/03-dapat-mengelola-kalkulasi-harga-survei.py'

from locust import HttpUser, task, between
import json

class AuthenticatedUser(HttpUser):
    wait_time = between(1, 3)
    token = None

    def on_start(self):
        """
        Proses login dijalankan saat Locust user pertama kali aktif.
        """
        login_payload = {
            "email": "", # <-- Modify the value with real email
            "password": "" # <-- Modify the value with real password
        }

        response = self.client.post(
            "/api/login",
            json=login_payload,
            name="Login"
        )

        if response.status_code == 200:
            try:
                self.token = response.json()["data"]["accessToken"]
                print("✅ Token berhasil diambil:", self.token[:30], "...")
            except Exception as e:
                print("❌ Gagal parsing token:", e)
                print("Response JSON:", response.text)
        else:
            print("❌ Login gagal:", response.status_code)
            print("Response:", response.text)

    @task
    def update_konfigurasi_harga(self):
        """
        PATCH konfigurasi harga survei dengan token autentikasi.
        """
        if not self.token:
            print("❌ Token belum tersedia, lewati task.")
            return

        payload = {
            "harga_dasar": 6000,
            "harga_per_pertanyaan": 1500,
            "harga_per_responden": 2500,
            "harga_per_durasi": 4000
        }

        headers = {
            "Authorization": f"Bearer {self.token}"
        }

        self.client.patch(
            "/api/konfigurasi-harga",
            json=payload,
            headers=headers,
            name="Update Harga Survei"
        )
