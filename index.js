const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");
const express = require("express");
const app = express();
const port = 3000; // Ganti dengan port yang ingin Anda gunakan

// Fungsi untuk mencari video
async function searchVideo(keyword) {
  const url =
    "https://pmpk.kemdikbud.go.id/sibi/pencarian/pencariankata";

  // Data form yang akan dikirim
  const formData = {
    key: keyword, // Mengisi dengan kata yang ingin dicari
  };

  try {
    // Mengirim permintaan POST ke URL form
    const response = await axios.post(
      url,
      qs.stringify(formData),
      {
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      }
    );

    // Memuat HTML hasil respons dengan Cheerio
    const $ = cheerio.load(response.data);

    // Mengurai dan mengumpulkan URL video dari elemen <source> dalam tag <video>
    const videoUrls = [];
    $("source").each((index, element) => {
      const sourceUrl = $(element).attr("src");
      if (sourceUrl) {
        videoUrls.push(sourceUrl);
      }
    });

    return videoUrls; // Mengembalikan array URL video
  } catch (error) {
    console.error("Error fetching data:", error);
    return []; // Mengembalikan array kosong jika terjadi error
  }
}

// Middleware untuk mengurai data JSON
app.use(express.json());

// Endpoint untuk API GET
app.get("/api/kamus-sibi", async (req, res) => {
  const kata = req.query.kata;
  if (!kata) {
    return res
      .status(400)
      .json({ error: "Parameter 'kata' diperlukan" });
  }

  try {
    const videoUrls = await searchVideo(kata);
    res.json({
      keyword: kata,
      videos: videoUrls,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal mengambil data video" });
  }
});

// Menjalankan server di port yang ditentukan
app.listen(port, () => {
  console.log(
    `Server is running on http://localhost:${port}`
  );
});
