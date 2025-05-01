const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf("isi di sini");
const API_KEY = "free";
const API_BASE = "https://restapi.rizk.my.id/sfwnsfw/cosplaytelensfw";

bot.start((ctx) => {
  ctx.reply(
    "Selamat datang di bot NSFW Cosplay!\n\nPerintah:\n/update - Update terbaru\n/search <keyword> - Cari cosplay\n/download <url> - Detail dari link"
  );
});

// ====== UPDATE TERBARU ======
bot.command("update", async (ctx) => {
  try {
    const buttons = [];
    for (let i = 1; i <= 6; i++) {
      buttons.push(Markup.button.callback(`Page ${i}`, `update_page_${i}`));
    }

    await ctx.reply("Pilih halaman (1-6):", Markup.inlineKeyboard(buttons, { columns: 3 }));
  } catch (err) {
    ctx.reply("Gagal memuat halaman update.");
  }
});

for (let i = 1; i <= 6; i++) {
  bot.action(`update_page_${i}`, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const res = await axios.get(`${API_BASE}/latest?page=${i}&apikey=${API_KEY}`);
      const items = res.data.data.slice(0, 5); // Batasi 5 item

      for (const item of items) {
        await ctx.replyWithPhoto(item.image, {
          caption: `*${item.title}*\n\n[Link](${item.url})`,
          parse_mode: "Markdown"
        });
      }
    } catch (err) {
      ctx.reply("Gagal mengambil data update.");
    }
  });
}

// ====== SEARCH ======
bot.command("search", async (ctx) => {
  const query = ctx.message.text.split(" ").slice(1).join(" ");
  if (!query) return ctx.reply("Contoh: /search misa");

  try {
    const res = await axios.get(`${API_BASE}/search?query=${encodeURIComponent(query)}&apikey=${API_KEY}`);
    const items = res.data.data.slice(0, 5);

    for (const item of items) {
      await ctx.replyWithPhoto(item.image, {
        caption: `*${item.title}*\n\n[Link](${item.url})`,
        parse_mode: "Markdown"
      });
    }
  } catch (err) {
    ctx.reply("Gagal mencari data.");
  }
});

// ====== DOWNLOAD DETAIL ======
bot.command("download", async (ctx) => {
  const input = ctx.message.text.split(" ")[1];
  if (!input) return ctx.reply("Contoh: /download https://cosplaytele.com/sparkle-11/");

  try {
    const res = await axios.get(`${API_BASE}/detail?url=${encodeURIComponent(input)}&apikey=${API_KEY}`);
    const detail = res.data.data;

    if (!detail.images || detail.images.length === 0) {
      return ctx.reply("Gambar tidak ditemukan.");
    }

    await ctx.reply(`Judul: ${detail.title}`);

    for (const img of detail.images.slice(0, 10)) { // Kirim max 10 gambar agar tidak overload
      await ctx.replyWithPhoto(img);
    }

    if (detail.videos && detail.videos.length > 0) {
      await ctx.reply(`Tersedia ${detail.videos.length} video, tapi video belum ditampilkan oleh bot.`);
    }

  } catch (err) {
    ctx.reply("Gagal mengambil detail, pastikan link valid.");
  }
});

bot.launch();
console.log("Bot aktif!");

