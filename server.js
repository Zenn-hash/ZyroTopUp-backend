/* =========================================================
   SERVER.JS - backend kecil untuk fitur "Cek Nama Akun"

   Ini SERVER, bukan file website statis - harus dijalankan
   pakai Node.js (bukan dibuka lewat Chrome seperti index.html).
   Inilah yang tidak bisa dilakukan HTML/CSS/JS saja: menyimpan
   API key rahasia dengan aman dan meneruskan permintaan ke
   penyedia API cek nickname.

   CONTOH INTEGRASI INI MEMAKAI: Yanjie Store (yanjiestore.com)
   - Dokumentasi resmi mereka: https://yanjiestore.com/api/docs
   - PENTING: aku tidak bisa menjamin layanan pihak ketiga mana pun.
     Cek dulu sendiri syarat & ketentuan, harga, dan ulasan mereka
     sebelum daftar dan memakai API key mereka. Kalau kamu memilih
     penyedia lain (Digiflazz, VIP Reseller, Tokovoucher, dst),
     cukup ganti bagian panggilCekNicknameYanjie() di bawah sesuai
     dokumentasi API mereka - struktur server ini tetap sama.

   CARA MENJALANKAN (lihat juga README.md di folder ini):
   1. Install Node.js (https://nodejs.org) versi 18 ke atas.
   2. Di folder ini, jalankan:  npm install
   3. Salin file .env.example jadi .env, lalu isi YANJIE_API_KEY
      dengan API key asli dari akun reseller Yanjie Store-mu.
   4. Jalankan:  npm start
   5. Server aktif di http://localhost:3000
   6. Di script.js (frontend), ganti BACKEND_URL supaya menunjuk
      ke alamat server ini (localhost saat development, atau
      alamat hosting-mu setelah di-deploy).
   ========================================================= */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());          // izinkan frontend memanggil server ini
app.use(express.json());  // baca body JSON dari frontend

const PORT = process.env.PORT || 3000;
const YANJIE_API_KEY = process.env.YANJIE_API_KEY || "";

/* =========================================================
   PEMETAAN GAME -> KODE YANG DIMINTA API YANJIE STORE
   Sumber: https://yanjiestore.com/kode-nickname.html
   (dicek langsung dari dokumentasi mereka, per hari ini)

   Kalau kamu menambah game baru di GAME (frontend, script.js),
   tambahkan juga pemetaannya di sini - id di kiri harus SAMA
   dengan id game di frontend.
   ========================================================= */
const KODE_YANJIE = {
  mlbb:    { kode: "MOBILE_LEGENDS" },
  hok:     { kode: "HOKNEW" },
  ff:      { kode: "FREEFIRE" },
  pubgm:   { kode: "Pubgmnya" },
  genshin: { kode: "GENSHIN_IMPACT" }
  // roblox sengaja tidak ada di sini: Roblox tidak dicek pakai ID
  // game, tapi voucher yang dikirim ke nomor WhatsApp, jadi di
  // frontend Roblox memang dilewatkan (lihat perluCekNama: false).
};

// Memanggil API resmi Yanjie Store untuk mengambil nickname
async function panggilCekNicknameYanjie(kode, id, server) {
  const body = new URLSearchParams({
    api_key: YANJIE_API_KEY,
    id: id,
    kode: kode
  });
  if (server) { body.set("server", server); }

  const respons = await fetch("https://yanjiestore.com/api/cek", {
    method: "POST",
    body: body
  });

  const data = await respons.json();

  // Format sukses dari Yanjie: { status: true, nickname: "..." }
  // Format gagal dari Yanjie:  { result: false, msg: "..." }
  if (data && data.status && data.nickname) {
    return data.nickname;
  }
  throw new Error((data && data.msg) || "Nama akun tidak ditemukan.");
}

/* =========================================================
   ENDPOINT: POST /cek-nickname
   Dipanggil dari frontend (script.js -> fungsi ambilNamaAkun).

   Body yang diharapkan dari frontend:
   {
     "gameId": "mlbb",
     "dataId": { "userId": "12345678", "zoneId": "1234" }
   }
   ========================================================= */
app.post("/cek-nickname", async function (req, res) {
  try {
    const { gameId, dataId } = req.body;

    if (!YANJIE_API_KEY) {
      return res.status(500).json({
        sukses: false,
        pesan: "Server belum dikonfigurasi: isi YANJIE_API_KEY di file .env"
      });
    }

    const peta = KODE_YANJIE[gameId];
    if (!peta) {
      return res.status(400).json({
        sukses: false,
        pesan: "Game ini belum punya pemetaan kode di server.js (KODE_YANJIE)."
      });
    }

    // Ambil nilai kolom ID pertama sebagai "id" utama, dan kolom
    // kedua (kalau ada, misalnya Zone ID / server) sebagai "server".
    const nilaiId = Object.values(dataId || {});
    const idUtama = nilaiId[0] || "";
    const serverOpsional = nilaiId[1] || "";

    if (!idUtama) {
      return res.status(400).json({ sukses: false, pesan: "ID belum diisi." });
    }

    const nama = await panggilCekNicknameYanjie(peta.kode, idUtama, serverOpsional);
    res.json({ sukses: true, nama: nama });

  } catch (kesalahan) {
    res.status(400).json({ sukses: false, pesan: kesalahan.message });
  }
});

app.get("/", function (req, res) {
  res.send("Server cek-nickname aktif. Gunakan POST /cek-nickname dari frontend.");
});

app.listen(PORT, function () {
  console.log("Server cek-nickname berjalan di http://localhost:" + PORT);
});
