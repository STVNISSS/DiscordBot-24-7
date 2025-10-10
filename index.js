// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

/* ---------- Discord token ---------- */
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('ERROR: DISCORD_TOKEN nu este setat!');
  process.exit(1);
}

/* ---------- Discord client ---------- */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
client.once('ready', () => {
  console.log(`✅ Botul este online ca ${client.user.tag}`);
});

// Când intră un nou membru pe server
client.on('guildMemberAdd', async member => {
  const roleName = 'Soldato Della Legione'; // schimbă cu numele exact al rolului tău

  try {
    const role = member.guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
      console.log(`❌ Rolul "${roleName}" nu a fost găsit pe serverul ${member.guild.name}`);
      return;
    }

    await member.roles.add(role);
    console.log(`✅ Rolul "${roleName}" a fost adăugat lui ${member.user.tag}`);
  } catch (err) {
    console.error('❌ Eroare la adăugarea rolului:', err);
  }
});

client.once('ready', () => {
  const { SlashCommandBuilder, Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");

// înlocuiește cu ID-ul serverului tău și al aplicației
const GUILD_ID = "1424810686529142941";
const CLIENT_ID = "1424879422879699149"; // din Discord Developer Portal

  const now = new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' });
  console.log(`✅ Bot conectat ca ${client.user.tag} — ${now}`);
});

client.on('messageCreate', msg => {
  if (msg.author.bot) return;
  if (msg.content === '!ping') msg.reply('pong');
});

/* ---------- Handlers pentru erori / reconectare ---------- */
client.on('error', err => console.error('❌ Eroare client Discord:', err));
client.on('shardError', err => console.error('⚠️ Eroare de shard:', err));
client.on('disconnect', event => console.warn('⚠️ Bot deconectat:', event.code));
client.on('reconnecting', () => console.log('🔁 Botul se reconectează la Discord...'));

process.on('unhandledRejection', err => console.error('❌ Unhandled promise rejection:', err));

client.login(token).catch(err => {
  // === DEFINIREA COMENZII ===
const commands = [
  new SlashCommandBuilder()
    .setName("/idea")
    .setDescription("Invia un parere anonimo nel canale dedicato")
    .addStringOption(option =>
      option
        .setName("mesaj")
        .setDescription("Mesajul tău anonim")
        .setRequired(true)
    )
].map(command => command.toJSON());

// === PUBLICARE COMANDĂ LA PORNIRE ===
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("🔁 Înregistrez comanda /idea...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comanda /idea a fost înregistrată!");
  } catch (error) {
    console.error("❌ Eroare la înregistrarea comenzii:", error);
  }
})();

// === HANDLERUL PENTRU /opinia ===
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "idea") {
    const mesaj = interaction.options.getString("mesaj");

    // ID-ul canalului unde vrei să ajungă mesajele
    const CANAL_OPINII = "1426272640863178875";

    const canal = interaction.guild.channels.cache.get(CANAL_OPINII);
    if (!canal) {
      return interaction.reply({
        content: "❌ Canalul pentru opinii nu a fost găsit.",
        ephemeral: true
      });
    }

    await canal.send(`💭 **idea anonima:** ${mesaj}`);
    await interaction.reply({
      content: "✅ Opinia ta a fost trimisă anonim!",
      ephemeral: true
    });
  }
});

  console.error('❌ Login error:', err);
});

/* ---------- Mini HTTP server (pentru Render) ---------- */
const app = express();

app.get('/', (req, res) => res.send('OK - bot running'));
app.get('/health', (req, res) => res.json({ status: 'ok', bot: !!client.user }));

const port = process.env.PORT || 10000;
const server = app.listen(port, () => {
  console.log(`🌐 HTTP server pornit pe portul ${port}`);
});

/* ---------- Graceful shutdown ---------- */
function shutdown() {
  console.log('🛑 Shutdown initiat...');
  server.close(() => console.log('🌐 HTTP server oprit.'));
  client.destroy();
  setTimeout(() => process.exit(0), 1000);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

