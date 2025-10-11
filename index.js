require("dotenv").config();
const { 
  Client, 
  GatewayIntentBits, 
  SlashCommandBuilder, 
  Routes, 
  REST 
} = require("discord.js");
const express = require("express");

/* ===== CONFIG ===== */
const GUILD_ID = "1424810686529142941";         // ID server
const CLIENT_ID = "1424879422879699149";        // ID bot
const CANAL_OPINII = "1426272640863178875";     // ID canal opinii
const ROLE_NAME = "Soldato Della Legione";      // Numele rolului
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error("❌ Eroare: TOKEN nu este setat în .env!");
  process.exit(1);
}

/* ===== INITIALIZARE CLIENT ===== */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

/* ===== PORNIRE BOT ===== */
client.once("ready", async () => {
  const now = new Date().toLocaleString("ro-RO", { timeZone: "Europe/Bucharest" });
  console.log(`✅ Bot conectat ca ${client.user.tag} — ${now}`);

  // Înregistrează comanda /idea
  const commands = [
    new SlashCommandBuilder()
      .setName("idea")
      .setDescription("Trimite o idee anonimă în canalul dedicat")
      .addStringOption(option =>
        option
          .setName("mesaj")
          .setDescription("Mesajul tău anonim")
          .setRequired(true)
      )
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    console.log("🔁 Înregistrez comanda /idea...");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log("✅ Comanda /idea a fost înregistrată!");
  } catch (err) {
    console.error("❌ Eroare la înregistrarea comenzii:", err);
  }
});

/* ===== COMANDĂ /idea ===== */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "idea") return;

  const mesaj = interaction.options.getString("mesaj");

  try {
    const canal = await interaction.guild.channels.fetch(CANAL_OPINII);
    if (!canal) {
      return interaction.reply({
        content: "❌ Canalul pentru opinii nu a fost găsit.",
        ephemeral: true
      });
    }

    await canal.send(`💭 **Idee anonimă:** ${mesaj}`);
    await interaction.reply({
      content: "✅ Ideea ta a fost trimisă anonim!",
      ephemeral: true
    });
  } catch (err) {
    console.error("❌ Eroare la trimiterea ideii:", err);
    await interaction.reply({
      content: "❌ A apărut o eroare la trimiterea ideii.",
      ephemeral: true
    });
  }
});

/* ===== ATRIBUIRE AUTOMATĂ ROL ===== */
client.on("guildMemberAdd", async (member) => {
  try {
    const role = member.guild.roles.cache.find(r => r.name === ROLE_NAME);
    if (!role) {
      console.log(`⚠️ Rolul "${ROLE_NAME}" nu există pe serverul ${member.guild.name}`);
      return;
    }

    await member.roles.add(role);
    console.log(`✅ Rolul "${ROLE_NAME}" a fost adăugat lui ${member.user.tag}`);
  } catch (err) {
    console.error("❌ Eroare la adăugarea rolului:", err);
  }
});

/* ===== HANDLERE ERORI ȘI RECONNECT ===== */
client.on("error", err => console.error("❌ Eroare client Discord:", err));
client.on("shardError", err => console.error("⚠️ Eroare de shard:", err));
client.on("disconnect", event => console.warn("⚠️ Bot deconectat:", event.code));
client.on("reconnecting", () => console.log("🔁 Botul se reconectează..."));
process.on("unhandledRejection", err => console.error("❌ Unhandled promise rejection:", err));

/* ===== LOGIN ===== */
client.login(TOKEN).catch(err => {
  console.error("❌ Eroare la login:", err);
  process.exit(1);
});

/* ===== SERVER HTTP (pentru Render sau uptime) ===== */
const app = express();

app.get("/", (req, res) => res.send("✅ Botul rulează corect"));
app.get("/health", (req, res) => res.json({ status: "ok", bot_online: !!client.user }));

const port = process.env.PORT || 10000;
const server = app.listen(port, () => {
  console.log(`🌐 HTTP server pornit pe portul ${port}`);
});

/* ===== SHUTDOWN GRACEFUL ===== */
function shutdown() {
  console.log("🛑 Oprire bot...");
  server.close(() => console.log("🌐 Server HTTP oprit."));
  client.destroy();
  setTimeout(() => process.exit(0), 1000);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
