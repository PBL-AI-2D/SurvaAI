# RUN 'locust -f test/locust/01-dapat-membuat-survei.py'

from locust import HttpUser, task, between
import random
import string

class SurveiUser(HttpUser):
    wait_time = between(1, 2)
    token = None
    created_survey_ids = []

    def on_start(self):
        """
        Login saat virtual user dimulai, simpan token akses.
        """
        login_payload = {
            "email": "", # <-- Modify the value with real email
            "password": "" # <-- Modify the value with real password
        }

        response = self.client.post("/api/login", json=login_payload)

        if response.status_code == 200:
            try:
                self.token = response.json()["data"]["accessToken"]
                print("✅ Login berhasil. Token didapat.")
            except Exception as e:
                print("❌ Gagal parsing token:", e)
        else:
            print("❌ Login gagal:", response.status_code, response.text)

    @task
    def create_survei(self):
        """
        Buat survei dengan payload yang valid. Simpan ID untuk digunakan GET & DELETE.
        """
        if not self.token:
            return

        random_suffix = ''.join(random.choices(string.ascii_uppercase, k=5))
        payload = {
            "judul": f"[LOAD TESTING] Survei {random_suffix}",
            "deskripsi": "Tes load otomatis dengan Locust",
            "jumlah_responden": 10,
            "tanggal_mulai": "2040-02-04",
            "tanggal_berakhir": "2040-02-10",
            "kriteria": {
                "usia": {
                    "min": 20,
                    "max": 35
                },
                "lokasi": ["Jakarta", "Bandung"],
                "pekerjaan": ["mahasiswa", "pegawai"]
            }
        }

        headers = {"Authorization": f"Bearer {self.token}"}

        res = self.client.post(
            "/api/users/survei",
            json=payload,
            headers=headers,
            name="POST /api/users/survei"
        )

        if res.status_code == 200:
            try:
                survei_id = res.json()["data"]["id"]
                self.created_survey_ids.append(survei_id)
                print(f"✅ Survei dibuat: {survei_id}")
            except Exception as e:
                print("❌ Tidak bisa ambil ID dari response:", e)
        else:
            print(f"❌ Gagal membuat survei: {res.status_code} | {res.text}")

    @task
    def get_survei_by_id(self):
        """
        Ambil survei berdasarkan ID yang dibuat sebelumnya.
        """
        if not self.token or not self.created_survey_ids:
            return

        survei_id = random.choice(self.created_survey_ids)
        headers = {"Authorization": f"Bearer {self.token}"}

        self.client.get(
            f"/api/users/survei/{survei_id}",
            headers=headers,
            name="GET /api/users/survei/:id"
        )

    @task
    def delete_survei(self):
        """
        Hapus survei berdasarkan ID yang telah dibuat.
        """
        if not self.token or not self.created_survey_ids:
            return

        survei_id = self.created_survey_ids.pop()
        headers = {"Authorization": f"Bearer {self.token}"}

        self.client.delete(
            f"/api/users/survei/{survei_id}",
            headers=headers,
            name="DELETE /api/users/survei/:id"
        )
