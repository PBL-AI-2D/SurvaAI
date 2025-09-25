# RUN 'locust -f test/locust/02-dapat-melakukan-pembayaran-pengajuan-survei.py'

from locust import HttpUser, task, between

class SurveiPembayaranUser(HttpUser):
    wait_time = between(1, 2)
    token = None
    created_survey_ids = []

    def on_start(self):
        """
        Login dan ambil ID survei milik user.
        """
        login_payload = {
            "email": "", # <-- Modify the value with real email
            "password": "" # <-- Modify the value with real password
        }

        login_response = self.client.post("/api/login", json=login_payload)

        if login_response.status_code == 200:
            try:
                self.token = login_response.json()["data"]["accessToken"]
                print("✅ Login berhasil.")

                # Ambil survei user
                headers = {"Authorization": f"Bearer {self.token}"}
                survei_res = self.client.get("/api/users/survei", headers=headers)

                if survei_res.status_code == 200:
                    survei_data = survei_res.json()["data"]
                    if survei_data:
                        self.created_survey_ids = [s["id"] for s in survei_data]
                        print(f"✅ Ditemukan {len(self.created_survey_ids)} survei.")
                    else:
                        print("⚠️ Tidak ada survei ditemukan.")
                else:
                    print("❌ Gagal ambil survei:", survei_res.status_code, survei_res.text)

            except Exception as e:
                print("❌ Gagal parsing login/survei:", e)
        else:
            print("❌ Login gagal:", login_response.status_code, login_response.text)

    @task
    def bayar_survei(self):
        """
        Kirim pembayaran ke endpoint: POST /api/users/pembayaran-survei/:id
        """
        if not self.token or not self.created_survey_ids:
            return

        survei_id = self.created_survey_ids[0]

        headers = {
            "Authorization": f"Bearer {self.token}"
        }

        payload = {
            "metode_pembayaran": "qris"
        }

        res = self.client.post(
            f"/api/users/pembayaran-survei/{survei_id}",
            json=payload,
            headers=headers,
            name="POST /api/users/pembayaran-survei/:id"
        )

        if res.status_code == 200:
            print(f"✅ Pembayaran berhasil untuk survei {survei_id}")
        else:
            print(f"❌ Gagal bayar: {res.status_code} | {res.text}")
