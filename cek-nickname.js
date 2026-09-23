/* =========================================================
   api/cek-nickname.js
   Vercel Serverless Function - TIDAK PERLU app.listen(), TIDAK
   PERLU install Express, dan Vercel Hobby TIDAK MEMINTA KARTU
   untuk proyek pribadi. Vercel otomatis mengenali setiap file
   di dalam folder api/ sebagai satu endpoint.

   Endpoint ini akan aktif di:
   https://nama-proyekmu.vercel.app/api/cek-nickname

   Sama seperti versi Express di folder backend/: server ini
   memanggil API resmi Yanjie Store (https://yanjiestore.com/api/docs)
   dan menyimpan API key dengan aman lewat Environment Variable
   di dashboard Vercel (bukan di kode).
   ========================================================= */

const KODE_YANJIE = {
  mlbb:    { kode: "MOBILE_LEGENDS" },
  hok:     { kode: "HOKNEW" },
  ff:      { kode: "FREEFIRE" },
  pubgm:   { kode: "Pubgmnya" },
  genshin: { kode: "GENSHIN_IMPACT" }
  // roblox sengaja tidak ada - lihat catatan di backend/server.js
};

async function panggilCekNicknameYanjie(kode, id, server) {
  const body = new URLSearchParams({
    api_key: process.env.YANJIE_API_KEY || "",
    id: id,
    kode: kode
  });
  if (server) { body.set("server", server); }

  const respons = await fetch("https://yanjiestore.com/api/cek", {
    method: "POST",
    body: body
  });

  const data = await respons.json();
  if (data && data.status && data.nickname) {
    return data.nickname;
  }
  throw new Error((data && data.msg) || "Nama akun tidak ditemukan.");
}

module.exports = async function handler(req, res) {
  // Izinkan website-mu memanggil endpoint ini dari domain manapun
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") {
    res.status(405).json({ sukses: false, pesan: "Method tidak didukung." });
    return;
  }

  try {
    if (!process.env.YANJIE_API_KEY) {
      res.status(500).json({
        sukses: false,
        pesan: "Server belum dikonfigurasi: isi Environment Variable YANJIE_API_KEY di dashboard Vercel (Settings > Environment Variables)."
      });
      return;
    }

    const { gameId, dataId } = req.body || {};
    const peta = KODE_YANJIE[gameId];
    if (!peta) {
      res.status(400).json({ sukses: false, pesan: "Game ini belum punya pemetaan kode di api/cek-nickname.js." });
      return;
    }

    const nilaiId = Object.values(dataId || {});
    const idUtama = nilaiId[0] || "";
    const serverOpsional = nilaiId[1] || "";
    if (!idUtama) {
      res.status(400).json({ sukses: false, pesan: "ID belum diisi." });
      return;
    }

    const nama = await panggilCekNicknameYanjie(peta.kode, idUtama, serverOpsional);
    res.status(200).json({ sukses: true, nama: nama });

  } catch (kesalahan) {
    res.status(400).json({ sukses: false, pesan: kesalahan.message });
  }
};
