/* =========================================================
   SCRIPT.JS - logika toko top up game

   Daftar isi:
   1. Pengaturan toko          (ganti nama & nomor WhatsApp di sini)
   2. Metode pembayaran & rekening/QRIS (data)
   3. Daftar game & harga      (data - bagian yang paling sering diubah)
   4. Variabel & fungsi bantu
   5. Berpindah layar (Katalog / Transaksi / Pembayaran)
   6. LAYAR 1: Menampilkan daftar game
   7. LAYAR 2: Transaksi (akun, nominal, metode bayar)
   8. LAYAR 3: Pembayaran (QR/rekening, ringkasan, kirim WA)
   9. Menjalankan halaman
   ========================================================= */


/* =========================================================
   1. PENGATURAN TOKO
   ========================================================= */
const NAMA_TOKO = "ZyroTopUp";
const TAGLINE = "Top up game cepat, aman, dan harga bersahabat.";

// Nomor WhatsApp admin. Awali dengan 62, tanpa 0 dan tanpa tanda +.
// Contoh: 0812-3456-7890  ->  6281234567890
const NOMOR_WA = "6285784232708";


/* =========================================================
   2. METODE PEMBAYARAN & REKENING/QRIS

   Ada 2 metode utama yang langsung tampil: QRIS dan E-Wallet.
   Keduanya memakai FOTO QRIS YANG SAMA (karena satu kode QRIS
   memang bisa dipakai dari DANA/GoPay/OVO/ShopeePay/m-banking),
   jadi kamu cukup siapkan SATU foto barcode saja.

   Metode lainnya (transfer bank) disembunyikan dulu di balik
   tombol "Metode Lainnya" supaya tampilan awal tidak terlalu
   ramai - baru terbuka kalau pembeli menekannya.

   utama: true  -> selalu tampil
   utama: false -> baru tampil setelah tombol "Metode Lainnya" ditekan

   >>> CARA MEMASANG FOTO QRIS KAMU <<<
   1. Taruh file fotonya (misalnya "qris.jpg") di folder yang
      sama dengan index.html, style.css, dan script.js ini.
   2. Ganti baris di bawah ini:
        const QR_GAMBAR = "";
      menjadi:
        const QR_GAMBAR = "qris.jpg";
   Selama masih kosong (""), akan tampil kotak petunjuk di
   layar pembayaran supaya kamu ingat untuk menggantinya.

   Untuk menambah bank baru, salin satu blok { ... } tipe
   "rekening" lalu ubah isinya.
   ========================================================= */
const QR_GAMBAR = "";

const PEMBAYARAN = [
  { id: "qris",    nama: "QRIS",     tipe: "qr", utama: true,
    info: "Scan dari e-wallet atau m-banking apa pun" },
  { id: "ewallet", nama: "E-Wallet", tipe: "qr", utama: true,
    info: "DANA, GoPay, OVO, ShopeePay - pakai QR yang sama" },

  { id: "bca",     nama: "Transfer BCA",     tipe: "rekening", utama: false,
    rekening: { bank: "BCA", nomor: "4720524487", atasNama: "SATYA RAYA RAMADHANI" } },
  { id: "bri",     nama: "Transfer BRI",     tipe: "rekening", utama: false,
    rekening: { bank: "BRI",     nomor: "1234567890", atasNama: "Nama Pemilik Toko" } },
  { id: "mandiri", nama: "Transfer Mandiri", tipe: "rekening", utama: false,
    rekening: { bank: "Mandiri", nomor: "1234567890", atasNama: "Nama Pemilik Toko" } }
];


/* =========================================================
   3. DAFTAR GAME & HARGA

   PENTING: SEMUA HARGA DI BAWAH HANYA CONTOH.
   Ganti dengan harga jualmu sendiri (harga modal dari supplier
   + keuntunganmu).

   Cara menambah game baru: salin satu blok { ... } lengkap,
   tempel di bawahnya (jangan lupa koma di antara blok),
   lalu ubah isinya.
   ========================================================= */
const GAME = [
  {
    id: "mlbb",
    nama: "Mobile Legends",
    penerbit: "Moonton",
    singkatan: "ML",
    warna: "#2563eb",
    populer: true,
    ket: "Isi User ID dan Zone ID. Cek di menu profil dalam game.",
    akun: [
      { kunci: "userId", label: "User ID", placeholder: "Contoh: 12345678", mode: "numeric" },
      { kunci: "zoneId", label: "Zone ID", placeholder: "Contoh: 1234", mode: "numeric" }
    ],
    nominal: [
      { nama: "86 Diamonds",  harga: 22000 },
      { nama: "172 Diamonds", harga: 44000 },
      { nama: "257 Diamonds", harga: 65000 },
      { nama: "344 Diamonds", harga: 87000 },
      { nama: "514 Diamonds", harga: 130000 },
      { nama: "706 Diamonds", harga: 175000 }
    ]
  },
  {
    id: "hok",
    nama: "Honor of Kings",
    penerbit: "TiMi Studios",
    singkatan: "HOK",
    warna: "#b45309",
    populer: true,
    ket: "Isi Player ID yang tertera di profil akunmu.",
    akun: [
      { kunci: "playerId", label: "Player ID", placeholder: "Contoh: 1234567890", mode: "numeric" }
    ],
    nominal: [
      { nama: "16 Tokens",  harga: 4000 },
      { nama: "80 Tokens",  harga: 20000 },
      { nama: "240 Tokens", harga: 60000 },
      { nama: "400 Tokens", harga: 100000 },
      { nama: "560 Tokens", harga: 140000 }
    ]
  },
  {
    id: "roblox",
    nama: "Roblox",
    penerbit: "Roblox Corporation",
    singkatan: "RBX",
    warna: "#dc2626",
    populer: true,
    perluCekNama: false, // Roblox tidak pakai ID game, jadi dilewatkan dari cek nickname
    ket: "Kode voucher dikirim lewat WhatsApp setelah pembayaran diterima.",
    akun: [
      { kunci: "kontak", label: "Nomor WhatsApp penerima kode", placeholder: "Contoh: 081234567890", mode: "tel" }
    ],
    nominal: [
      { nama: "Voucher Roblox Rp50.000",  harga: 54000 },
      { nama: "Voucher Roblox Rp100.000", harga: 106000 },
      { nama: "Voucher Roblox Rp200.000", harga: 210000 }
    ]
  },
  {
    id: "ff",
    nama: "Free Fire",
    penerbit: "Garena",
    singkatan: "FF",
    warna: "#ea580c",
    populer: false,
    ket: "Isi Player ID Free Fire kamu.",
    akun: [
      { kunci: "playerId", label: "Player ID", placeholder: "Contoh: 123456789", mode: "numeric" }
    ],
    nominal: [
      { nama: "50 Diamonds",   harga: 7000 },
      { nama: "100 Diamonds",  harga: 14000 },
      { nama: "310 Diamonds",  harga: 42000 },
      { nama: "520 Diamonds",  harga: 70000 },
      { nama: "1060 Diamonds", harga: 140000 }
    ]
  },
  {
    id: "pubgm",
    nama: "PUBG Mobile",
    penerbit: "Level Infinite",
    singkatan: "PM",
    warna: "#4d7c0f",
    populer: false,
    ket: "Isi Player ID PUBG Mobile kamu.",
    akun: [
      { kunci: "playerId", label: "Player ID", placeholder: "Contoh: 5123456789", mode: "numeric" }
    ],
    nominal: [
      { nama: "60 UC",   harga: 15000 },
      { nama: "325 UC",  harga: 78000 },
      { nama: "660 UC",  harga: 155000 },
      { nama: "1800 UC", harga: 385000 }
    ]
  },
  {
    id: "genshin",
    nama: "Genshin Impact",
    penerbit: "HoYoverse",
    singkatan: "GI",
    warna: "#0e7490",
    populer: false,
    ket: "Isi UID dan server akunmu (Asia, Europe, America, atau TW/HK/MO).",
    akun: [
      { kunci: "uid",    label: "UID",    placeholder: "Contoh: 800123456", mode: "numeric" },
      { kunci: "server", label: "Server", placeholder: "Contoh: Asia",      mode: "text" }
    ],
    nominal: [
      { nama: "60 Genesis Crystals",   harga: 16000 },
      { nama: "330 Genesis Crystals",  harga: 80000 },
      { nama: "1090 Genesis Crystals", harga: 250000 },
      { nama: "2240 Genesis Crystals", harga: 500000 }
    ]
  }
];


/* =========================================================
   4. VARIABEL & FUNGSI BANTU
   ========================================================= */
let gameAktif = null;      // game yang sedang dibuka
let nominalAktif = null;   // nomor urut nominal yang dipilih (0, 1, 2, ...)
let bayarAktif = null;     // metode pembayaran yang dipilih
let tabAktif = "populer";  // tab yang sedang aktif: "populer" atau "semua"
let kataCari = "";         // kata kunci yang sedang diketik di kolom cari
let kodePesananAktif = ""; // dibuat SETELAH metode pembayaran dipilih (lihat pilihBayar)
let lainnyaTerbuka = false; // status tombol "Metode Lainnya": terbuka/tertutup
let namaAkunHasil = "";    // nama akun yang berhasil didapat lewat cekNamaAkun()

function rupiah(angka) {
  return "Rp" + angka.toLocaleString("id-ID");
}

function cariGame(id) {
  return GAME.find(function (g) { return g.id === id; });
}

// Membaca isi semua kolom ID yang sedang ditampilkan (User ID, Zone ID, dst)
function kumpulkanDataId() {
  const data = {};
  gameAktif.akun.forEach(function (a) {
    data[a.kunci] = document.getElementById("akun-" + a.kunci).value.trim();
  });
  return data;
}

// Mengecek apakah semua kolom ID sudah diisi
function idLengkap() {
  if (!gameAktif) { return false; }
  return gameAktif.akun.every(function (a) {
    const kolom = document.getElementById("akun-" + a.kunci);
    return kolom && kolom.value.trim() !== "";
  });
}

// Alamat server backend. Dua pilihan (lihat folder backend/ dan
// backend-vercel/ untuk kodenya, dan file README di masing-masing
// folder untuk cara deploy-nya):
//   - Render (folder backend/): perlu verifikasi kartu $1 yang
//     otomatis di-refund (dijelaskan di render.com/pricing).
//   - Vercel (folder backend-vercel/): TIDAK perlu kartu sama
//     sekali untuk proyek pribadi.
// Selama menjalankan backend di komputer/HP-mu sendiri, biarkan
// seperti ini. Setelah backend di-deploy, ganti jadi alamat
// hosting-mu, misalnya "https://zyrotopup-cek-nama.vercel.app".
const BACKEND_URL = "http://localhost:3000";

// Apakah game ini perlu dicek nickname-nya (lewat backend)?
// Default: perlu (true), kecuali game punya perluCekNama: false
// secara eksplisit di data GAME (contoh: Roblox).
function perluCekNama() {
  return gameAktif && gameAktif.perluCekNama !== false;
}

/* =========================================================
   ambilNamaAkun() memanggil BACKEND kita sendiri (bukan langsung
   ke penyedia API), supaya API key tetap aman di server dan
   tidak pernah terlihat di kode website ini.

   Backend-nya (folder backend/server.js) yang meneruskan
   permintaan ke API resmi penyedia cek-nickname (contoh di sini
   memakai Yanjie Store, https://yanjiestore.com/api/docs).
   ========================================================= */
async function ambilNamaAkun(game, dataId) {
  let respons;
  try {
    respons = await fetch(BACKEND_URL + "/api/cek-nickname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: game.id, dataId: dataId })
    });
  } catch (e) {
    throw new Error("Tidak bisa menghubungi server cek nama. Pastikan backend-nya sedang berjalan (lihat backend/README.md).");
  }

  const data = await respons.json();
  if (!data.sukses) {
    throw new Error(data.pesan || "ID tidak ditemukan. Periksa kembali ID yang kamu masukkan.");
  }
  return data.nama;
}

// Kode pesanan unik, contoh: TRX-4821-K9F2Q
// Dibuat SETELAH pembeli selesai memilih metode pembayaran (lihat
// fungsi pilihBayar), supaya lebih ringkas: pembeli tidak perlu lihat
// kode ini sebelum siap membayar. Muncul di layar pembayaran & di
// pesan WhatsApp, supaya kamu (admin) bisa mencocokkan pesanan mana
// yang sudah benar-benar dibayar.
function buatKodePesanan() {
  const waktu = Date.now().toString().slice(-4);
  const acak = Math.random().toString(36).slice(2, 7).toUpperCase();
  return "TRX-" + waktu + "-" + acak;
}

// Syarat lengkap: ID sudah diisi, DAN (kalau game ini perlu dicek
// nickname) nama akun sudah berhasil ditemukan. Roblox (perluCekNama:
// false) cukup ID/nomor WA-nya saja tanpa perlu dicek.
function akunLengkap() {
  if (!idLengkap()) { return false; }
  if (!perluCekNama()) { return true; }
  return namaAkunHasil !== "";
}


/* =========================================================
   5. BERPINDAH LAYAR
   Cuma tiga layar: layarKatalog, layarTransaksi, layarPembayaran.
   Fungsi ini menyembunyikan semua layar lalu menampilkan satu saja,
   supaya terasa seperti pindah "halaman" walau tetap satu file.
   ========================================================= */
function pindahLayar(idTujuan) {
  document.querySelectorAll(".layar").forEach(function (layar) {
    layar.hidden = (layar.id !== idTujuan);
  });
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}


/* =========================================================
   6. LAYAR 1: MENAMPILKAN DAFTAR GAME
   ========================================================= */
function pilihTab(tab) {
  tabAktif = tab;
  document.getElementById("tabPopuler").classList.toggle("aktif", tab === "populer");
  document.getElementById("tabSemua").classList.toggle("aktif", tab === "semua");
  tampilkanGame();
}

function tampilkanGame() {
  const wadah = document.getElementById("daftarGame");

  let hasil = GAME.filter(function (g) {
    return g.nama.toLowerCase().includes(kataCari);
  });

  if (tabAktif === "populer" && kataCari === "") {
    hasil = hasil.filter(function (g) { return g.populer; });
  }

  if (hasil.length === 0) {
    wadah.innerHTML = '<p class="kosong">Game tidak ditemukan.</p>';
    return;
  }

  wadah.innerHTML = hasil.map(function (g) {
    return `
      <button class="kartu-game" style="--warna: ${g.warna}" onclick="pilihGame('${g.id}')">
        <span class="inisial">${g.singkatan}</span>
        <span class="teks-game">
          <span class="nama-game">${g.nama}</span>
          <span class="penerbit-game">${g.penerbit}</span>
        </span>
        ${g.populer ? '<span class="lencana">Populer</span>' : ""}
      </button>
    `;
  }).join("");
}


/* =========================================================
   7. LAYAR 2: TRANSAKSI
   Klik kartu game (di Layar 1) memanggil pilihGame(), yang langsung
   memindahkan tampilan ke Layar Transaksi.
   ========================================================= */
function pilihGame(id) {
  gameAktif = cariGame(id);
  nominalAktif = null;
  bayarAktif = null;
  namaAkunHasil = "";
  kodePesananAktif = "";     // belum dibuat - baru dibuat setelah metode bayar dipilih
  lainnyaTerbuka = false;

  const ikon = document.getElementById("ikonPanel");
  ikon.style.setProperty("--warna", gameAktif.warna);
  ikon.textContent = gameAktif.singkatan;
  document.getElementById("namaPanel").textContent = gameAktif.nama;
  document.getElementById("ketPanel").textContent = gameAktif.ket;

  document.getElementById("areaBayar").innerHTML = "";
  document.getElementById("konfirmasiBayar").checked = false;

  tampilkanKolomAkun();
  tampilkanNominal();
  tampilkanBayar();

  // Pindah ke Layar Transaksi (ID akun + nominal + metode bayar)
  pindahLayar("layarTransaksi");
}

// Kolom isi ID akun (berbeda tiap game), plus tombol "Cek Nama Akun"
// dan area hasilnya di bawah kolom ID.
function tampilkanKolomAkun() {
  const wadah = document.getElementById("kolomAkun");

  const kolomId = gameAktif.akun.map(function (a) {
    return `
      <div class="kolom">
        <label for="akun-${a.kunci}">${a.label}</label>
        <input type="text" id="akun-${a.kunci}" placeholder="${a.placeholder}"
               inputmode="${a.mode || "text"}" autocomplete="off">
      </div>
    `;
  }).join("");

  const bagianCekNama = perluCekNama()
    ? `
      <button type="button" class="tombol-cek-nama" id="tombolCekNama" onclick="cekNamaAkun()" disabled>
        🔍 Cek Nama Akun
      </button>
      <div class="hasil-cek" id="hasilCekNama"></div>
    `
    : "";

  wadah.innerHTML = kolomId + bagianCekNama;

  // Setiap kali ID diketik ulang, hasil cek sebelumnya jadi tidak berlaku
  // lagi (harus cek ulang) - supaya tidak ada nama lama yang "kebawa"
  // ke ID yang sudah diubah.
  wadah.querySelectorAll("input").forEach(function (kolom) {
    kolom.addEventListener("input", function () {
      if (perluCekNama()) {
        namaAkunHasil = "";
        document.getElementById("hasilCekNama").className = "hasil-cek";
        document.getElementById("hasilCekNama").innerHTML = "";
        document.getElementById("tombolCekNama").disabled = !idLengkap();
      }
      tampilkanNominal();
      tampilkanBayar();
    });
  });
}

// Dipanggil saat tombol "Cek Nama Akun" ditekan.
async function cekNamaAkun() {
  const tombol = document.getElementById("tombolCekNama");
  const hasil = document.getElementById("hasilCekNama");

  tombol.disabled = true;
  hasil.className = "hasil-cek memuat";
  hasil.textContent = "Mengecek nama akun...";

  try {
    const nama = await ambilNamaAkun(gameAktif, kumpulkanDataId());
    namaAkunHasil = nama;
    hasil.className = "hasil-cek berhasil";
    hasil.innerHTML = "✅ Nama akun: <strong>" + nama + "</strong> " +
      "<span class=\"tanda-demo\">(DEMO - bukan nama asli, lihat komentar ambilNamaAkun di script.js)</span>";
  } catch (kesalahan) {
    namaAkunHasil = "";
    hasil.className = "hasil-cek gagal";
    hasil.textContent = "❌ " + kesalahan.message;
  }

  tombol.disabled = false;
  tampilkanNominal();
  tampilkanBayar();
}

function tampilkanNominal() {
  const wadah = document.getElementById("daftarNominal");
  const siap = akunLengkap();

  wadah.innerHTML = gameAktif.nominal.map(function (n, i) {
    const dipilih = (nominalAktif === i) ? "dipilih" : "";
    return `
      <button class="opsi ${dipilih}" onclick="pilihNominal(${i})" ${siap ? "" : "disabled"}>
        <span class="opsi-nama">${n.nama}</span>
        <span class="opsi-harga">${rupiah(n.harga)}</span>
      </button>
    `;
  }).join("");
}

function pilihNominal(nomor) {
  if (!akunLengkap()) { return; } // jaga-jaga: ID/nama harus lengkap dulu
  nominalAktif = nomor;
  tampilkanNominal();
  tampilkanBayar(); // nominal sudah dipilih -> tombol metode bayar mungkin terbuka
}

// Menampilkan tombol metode bayar. TERKUNCI (tidak bisa diklik) selama
// akun belum lengkap ATAU nominal belum dipilih - supaya tidak ada
// pembeli yang "lompat" ke pembayaran dengan data yang belum lengkap.
//
// Metode "utama" (QRIS, E-Wallet) selalu tampil. Metode lain (transfer
// bank) baru muncul setelah tombol "Metode Lainnya" ditekan.
function tampilkanBayar() {
  const wadah = document.getElementById("daftarBayar");
  const ketKunci = document.getElementById("ketKunciBayar");
  const siapBayar = akunLengkap() && nominalAktif !== null;

  ketKunci.textContent = siapBayar
    ? "Pilih salah satu metode di bawah untuk lanjut ke pembayaran."
    : perluCekNama()
      ? "Cek nama akun dan pilih nominal dulu untuk membuka metode bayar."
      : "Isi data dan pilih nominal dulu untuk membuka metode bayar.";

  const utama = PEMBAYARAN.filter(function (b) { return b.utama; });
  const lainnya = PEMBAYARAN.filter(function (b) { return !b.utama; });

  function tombolMetode(b) {
    return `
      <button class="opsi opsi-bayar" onclick="pilihBayar('${b.id}')" ${siapBayar ? "" : "disabled"}>
        <span>
          <span class="opsi-nama">${b.nama}</span>
          ${b.info ? "<br><small>" + b.info + "</small>" : ""}
        </span>
      </button>
    `;
  }

  let html = utama.map(tombolMetode).join("");

  if (lainnya.length > 0) {
    html += `
      <button type="button" class="tombol-lainnya" onclick="toggleLainnya()" ${siapBayar ? "" : "disabled"}>
        ${lainnyaTerbuka ? "▴ Sembunyikan metode lainnya" : "▾ Metode Lainnya (Transfer Bank, dll)"}
      </button>
    `;
    if (lainnyaTerbuka) {
      html += `<div class="daftar-bayar daftar-bayar-lainnya">${lainnya.map(tombolMetode).join("")}</div>`;
    }
  }

  wadah.innerHTML = html;
}

// Buka/tutup daftar "Metode Lainnya"
function toggleLainnya() {
  lainnyaTerbuka = !lainnyaTerbuka;
  tampilkanBayar();
}

// Dipanggil saat metode bayar diklik (hanya bisa diklik kalau tidak terkunci).
// Kode pesanan BARU DIBUAT di sini (setelah metode bayar selesai dipilih),
// lalu langsung memindahkan tampilan ke Layar Pembayaran.
function pilihBayar(id) {
  if (!(akunLengkap() && nominalAktif !== null)) { return; } // jaga-jaga

  bayarAktif = PEMBAYARAN.find(function (b) { return b.id === id; });
  kodePesananAktif = buatKodePesanan();
  document.getElementById("kodePesananTampil").innerHTML =
    "Kode pesanan: <strong>" + kodePesananAktif + "</strong>";

  tampilkanAreaBayar();
  perbaruiRingkasan();

  pindahLayar("layarPembayaran");
}


/* =========================================================
   8. LAYAR 3: PEMBAYARAN
   ========================================================= */

// Kotak foto QRIS (untuk QRIS/E-Wallet) atau info rekening (untuk
// transfer bank). SELALU diletakkan di tengah lewat CSS.
function tampilkanAreaBayar() {
  const wadah = document.getElementById("areaBayar");
  if (!bayarAktif) { wadah.innerHTML = ""; return; }

  if (bayarAktif.tipe === "qr") {
    const isiGambar = QR_GAMBAR
      ? `<img src="${QR_GAMBAR}" alt="Kode QRIS">`
      : `<div class="kotak-qr-kosong">
           <span class="ikon-besar" aria-hidden="true">🔲</span>
           Foto QRIS belum dipasang.<br>Isi QR_GAMBAR di script.js
         </div>`;

    wadah.innerHTML = `
      <div class="kotak-qr">
        ${isiGambar}
        <p class="ket-kecil">Scan kode ini pakai aplikasi e-wallet atau m-banking kamu.</p>
      </div>
    `;
    return;
  }

  const r = bayarAktif.rekening;
  wadah.innerHTML = `
    <div class="kotak-rekening">
      <p class="ket-kecil">Transfer ke rekening</p>
      <p class="nomor" id="nomorRekeningTampil">${r.bank} ${r.nomor}</p>
      <p class="atas-nama">a.n. ${r.atasNama}</p>
      <button type="button" class="tombol-salin" id="tombolSalinRekening">Salin nomor rekening</button>
    </div>
  `;

  document.getElementById("tombolSalinRekening").addEventListener("click", function () {
    navigator.clipboard.writeText(r.nomor).then(function () {
      const t = document.getElementById("tombolSalinRekening");
      t.textContent = "Tersalin!";
      setTimeout(function () { t.textContent = "Salin nomor rekening"; }, 1500);
    });
  });
}

// Menambah satu baris "label ... nilai" ke ringkasan.
// Memakai textContent supaya teks yang diketik pembeli aman ditampilkan.
function tambahBaris(induk, label, nilai, tebal) {
  const baris = document.createElement("div");
  baris.className = "baris" + (tebal ? " tebal" : "");

  const dt = document.createElement("dt");
  dt.textContent = label;

  const dd = document.createElement("dd");
  dd.textContent = nilai;

  baris.append(dt, dd);
  induk.appendChild(baris);
}

function perbaruiRingkasan() {
  if (!gameAktif || !bayarAktif || nominalAktif === null) { return; }

  const ringkasan = document.getElementById("isiRingkasan");
  const tombol = document.getElementById("tombolPesan");
  const bantu = document.getElementById("pesanBantu");
  const kotakKonfirmasi = document.getElementById("konfirmasiBayar");

  const dataAkun = gameAktif.akun.map(function (a) {
    return { label: a.label, nilai: document.getElementById("akun-" + a.kunci).value.trim() };
  });
  if (perluCekNama()) {
    dataAkun.unshift({ label: "Nama akun (hasil cek)", nilai: namaAkunHasil });
  }
  const item = gameAktif.nominal[nominalAktif];
  const total = item.harga;

  ringkasan.innerHTML = "";
  tambahBaris(ringkasan, "Kode pesanan", kodePesananAktif);
  tambahBaris(ringkasan, "Game", gameAktif.nama);
  dataAkun.forEach(function (d) {
    tambahBaris(ringkasan, d.label, d.nilai || "-");
  });
  tambahBaris(ringkasan, "Item", item.nama);
  tambahBaris(ringkasan, "Pembayaran", bayarAktif.nama);
  tambahBaris(ringkasan, "Total bayar", rupiah(total), true);

  // Tombol kirim HANYA aktif kalau kotak konfirmasi sudah dicentang.
  // Ini pengaman terakhir supaya tidak ada pesanan yang "lolos" terkirim
  // tanpa pembeli menegaskan bahwa mereka sudah membayar.
  if (!kotakKonfirmasi.checked) {
    tombol.classList.add("mati");
    tombol.setAttribute("href", "#");
    bantu.textContent = "Centang dulu kotak konfirmasi di atas setelah kamu benar-benar sudah membayar.";
    return;
  }

  let pesan = "Halo " + NAMA_TOKO + ", saya sudah bayar pesanan berikut:\n\n";
  pesan += "Kode pesanan: " + kodePesananAktif + "\n";
  pesan += "Game: " + gameAktif.nama + "\n";
  dataAkun.forEach(function (d) {
    pesan += d.label + ": " + d.nilai + "\n";
  });
  pesan += "Item: " + item.nama + "\n";
  pesan += "Pembayaran: " + bayarAktif.nama + "\n";
  pesan += "Total: " + rupiah(total) + "\n\n";
  pesan += "(Bukti transfer/screenshot pembayaran akan saya lampirkan di chat ini)";

  tombol.classList.remove("mati");
  tombol.setAttribute("href", "https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent(pesan));
  bantu.textContent = "Setelah terbuka di WhatsApp, jangan lupa lampirkan screenshot bukti pembayaran sebelum menekan kirim.";
}


/* =========================================================
   9. MENJALANKAN HALAMAN
   ========================================================= */
document.title = NAMA_TOKO + " - Top Up Game";
document.getElementById("logoToko").textContent = NAMA_TOKO;
document.getElementById("tagline").textContent = TAGLINE;
document.getElementById("teksFooter").textContent = "© " + NAMA_TOKO + ". Pesanan diproses lewat WhatsApp admin.";

document.getElementById("bannerLabel").textContent = "✨ Promo Minggu Ini";
document.getElementById("bannerJudul").textContent = "Top up hemat, main auto lancar!";
document.getElementById("bannerKet").textContent = "Semua game favoritmu ada di sini, proses cepat lewat WhatsApp.";

document.getElementById("cariGame").addEventListener("input", function (e) {
  kataCari = e.target.value.toLowerCase().trim();
  if (kataCari !== "") {
    tabAktif = "semua";
    document.getElementById("tabPopuler").classList.remove("aktif");
    document.getElementById("tabSemua").classList.add("aktif");
  }
  tampilkanGame();
});

document.getElementById("konfirmasiBayar").addEventListener("change", perbaruiRingkasan);

pindahLayar("layarKatalog");
tampilkanGame();
