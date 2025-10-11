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
const CANAL_OPINII = "1426272640863178875";     // ID canale suggerimenti
const ROLE_NAME = "Soldato Della Legione";      // Nome del ruolo
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error("❌ Errore: il TOKEN non è impostato nel file .env!");
  process.exit(1);
}

/* ===== INIZIALIZZAZIONE CLIENT ===== */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

/* ===== AVVIO BOT ===== */
client.once("ready", async () => {
  const now = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" });
  console.log(`✅ Bot connesso come ${client.user.tag} — ${now}`);

  // === HANDLER PER /idea ===
  client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "idea") {
      const message = interaction.options.getString("message");
      const canal = interaction.guild.channels.cache.get(CANAL_OPINII);

      if (!canal) {
        return interaction.reply({
          content: "❌ Non è stato possibile trovare il canale dei suggerimenti.",
          ephemeral: true
        });
      }

      await canal.send(`💭 **Idea:** ${message}`);
      await interaction.reply({
        content: "✅ La tua idea è stata inviata con successo!",
        ephemeral: true
      });
    }
  });

  // Registrazione del comando /idea
  const commands = [
    new SlashCommandBuilder()
      .setName("idea")
      .setDescription("Invia un suggerimento ai moderatori.")
      .addStringOption(option =>
        option.setName("message")
          .setDescription("Il tuo messaggio.")
          .setRequired(true)
      )
  ].map(command => command.toJSON());

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    console.log("🔁 Registrazione del comando /idea in corso...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comando /idea registrato con successo!");
  } catch (error) {
    console.error("❌ Errore durante la registrazione del comando:", error);
  }
});

/* ===== ASSEGNAZIONE AUTOMATICA RUOLO ===== */
client.on("guildMemberAdd", async (member) => {
  try {
    const role = member.guild.roles.cache.find(r => r.name === ROLE_NAME);
    if (!role) {
      console.log(`⚠️ Il ruolo "${ROLE_NAME}" non esiste nel server ${member.guild.name}`);
      return;
    }

    await member.roles.add(role);
    console.log(`✅ Ruolo "${ROLE_NAME}" assegnato a ${member.user.tag}`);
  } catch (err) {
    console.error("❌ Errore durante l'assegnazione del ruolo:", err);
  }
});

/* ===== GESTIONE ERRORI E RICONNESSIONE ===== */
client.on("error", err => console.error("❌ Errore client Discord:", err));
client.on("shardError", err => console.error("⚠️ Errore di shard:", err));
client.on("disconnect", event => console.warn("⚠️ Bot disconnesso:", event.code));
client.on("reconnecting", () => console.log("🔁 Il bot si sta riconnettendo..."));
process.on("unhandledRejection", err => console.error("❌ Promessa non gestita:", err));

/* ===== LOGIN ===== */
client.login(TOKEN).catch(err => {
  console.error("❌ Errore durante il login:", err);
  process.exit(1);
});

/* ===== SERVER HTTP (per Render o uptime) ===== */
const app = express();

app.get("/", (req, res) => res.send("✅ Il bot è attivo e funzionante"));
app.get("/health", (req, res) => res.json({ status: "ok", bot_online: !!client.user }));

const port = process.env.PORT || 10000;
const server = app.listen(port, () => {
  console.log(`🌐 Server HTTP avviato sulla porta ${port}`);
});

/* ===== ARRESTO GRACEFUL ===== */
function shutdown() {
  console.log("🛑 Arresto del bot in corso...");
  server.close(() => console.log("🌐 Server HTTP arrestato."));
  client.destroy();
  setTimeout(() => process.exit(0), 1000);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
