import type { Messages } from "../types";

export const id: Messages = {
  meta: {
    title: "Anthiel",
    description:
      "Kumpulan software engineer berbasis di Batam & Jakarta. Membantu founders membangun bisnis dari 0 → 1 — development software untuk startup di Batam dan Indonesia.",
  },
  intro: {
    p1Prefix: "Kumpulan software engineer berbasis di Batam",
    p1Suffix: "Jakarta, Indonesia.",
    p2Before: "Membantu founders membangun bisnis mereka dari",
    p2After: "dengan tim senior kami.",
    sayHi: "Sapa kami di",
  },
  work: {
    title: "Karya",
    description: "Yang telah kami kerjakan dan proyek sebelumnya dari anggota tim",
    groups: [
      {
        id: "anthiel",
        label: "Proyek",
        projects: [
          {
            number: 1,
            title: "Batam Today",
            year: "2026",
            description:
              "Rewrite penuh portal berita Batam — lebih cepat, tema gelap & terang, plus dashboard multi-peran untuk berita, iklan, pengguna, dan kustomisasi halaman. Proyek pertama Anthiel, selesai dalam 3 bulan.",
            href: "https://batamtoday.com/",
          },
        ],
      },
      {
        id: "past",
        label: "Proyek sebelumnya anggota tim",
        projects: [
          {
            number: 2,
            title: "Arta Samudra",
            year: "2023",
            description:
              "Platform lelang mutiara yang bisa jalan online maupun offline. Bidding live bisa bareng penjualan langsung, jadi lelang tetap jalan meski koneksi kurang stabil.",
          },
          {
            number: 3,
            title: "DNI Skincenter",
            year: "2022",
            description:
              "E-commerce untuk klinik kecantikan di Bali. Ada katalog online dan checkout untuk treatment serta produk skincare.",
          },
          {
            number: 4,
            title: "Virtual Tenant Representative",
            year: "2021",
            description:
              "Aplikasi properti untuk landlord — listing, penyewa, dan operasional harian dalam satu tempat.",
          },
        ],
      },
    ],
  },
  faq: {
    title: "Lebih tentang kami",
    description: "Pilih pertanyaan untuk lihat jawabannya.",
    answerLabel: "Jawaban",
    experienceTemplate: "Kami sudah saling kenal lama, dan memutuskan buat grup {ago}.",
    established: {
      lessThanMonth: "kurang dari sebulan yang lalu",
      oneMonth: "sebulan yang lalu",
      months: (n) => `${n} bulan yang lalu`,
      oneYear: "setahun yang lalu",
      years: (n) => `${n} tahun yang lalu`,
    },
    items: [
      {
        id: "experience",
        question: "Sudah berapa lama kalian kerja bareng?",
        answer: "",
      },
      {
        id: "process",
        question: "Prosesnya seperti apa?",
        answer:
          "Kami mulai dari memahami masalahnya dulu, bukan langsung nulis kode.\n\nBareng-bareng kami tentukan MVP, pecah jadi milestone, minta persetujuan, baru mulai bangun.",
      },
      {
        id: "timeline",
        question: "Berapa lama biasanya sebuah proyek?",
        answer:
          "Tergantung scopenya, tapi kebanyakan butuh **minimal 3 bulan**. Produk kecil sering bisa dari ide sampai production dalam waktu itu.",
      },
      {
        id: "cost",
        question: "Biayanya berapa?",
        answer:
          "Tiap proyek beda-beda.\n\nBiasanya kami lebih terjangkau dari agency tradisional. Kalau budget terbatas, kami bantu cari scope yang pas.",
      },
      {
        id: "why",
        question: "Kenapa Anthiel?",
        answer:
          "Kamu langsung kerja sama engineer yang benar-benar bangun produknya.\n\nTanpa account manager. Tanpa lapisan komunikasi. Keputusan lebih cepat, diskusi lebih jelas, hasilnya software yang lebih baik.",
      },
      {
        id: "start",
        question: "Gimana cara mulainya?",
        answer:
          "Ceritakan saja apa yang mau dibangun, atau masalah yang sedang dihadapi.\n\nKami bahas idenya, tentukan scopenya, dan cari jalan terbaik bareng.\n\n[[contact:Hubungi kami sekarang]]",
      },
    ],
  },
  contact: {
    title: "Hubungi kami",
    description: "Tau lah ya harus ngapain",
    emailLabel: "Alamat email",
    placeholder: "kamu@perusahaan.com",
    sendLabel: "Kirim email",
    success: "Terima kasih — kami segera hubungi kamu.",
    invalid: "Sepertinya belum email yang benar — coba lagi?",
    error: "Ada yang error. Coba lagi sebentar ya.",
    rateLimited: (minutes) =>
      `Beberapa pesan sudah terkirim. Coba lagi sekitar ${minutes} menit lagi ya.`,
    internalMessage: "Homepage email drop — please get in touch.",
  },
  a11y: {
    teamIllustration: "Ilustrasi tim Anthiel",
  },
};
