require("dotenv").config();
const { 
  Client, 
  GatewayIntentBits, 
  SlashCommandBuilder, 
  Routes, 
  REST 
} = require("discord.js");
const express = require('express');

const TOKEN = process.env.TOKEN;  // tokenul din Render
const GUILD_ID = "1424810686529142941";
const CLIENT_ID = "1424879422879699149";
const CANAL_OPINII = "1426272640863178875";

if (!token) {
  console.error('ERROR: TOKEN nu este setat!');
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



// === ATRIBUIE AUTOMAT ROL LA INTRARE ===
client.on("guildMemberAdd", async member => {
  const roleName = "Soldato Della Legione";

  try {
    const role = member.guild.roles.cache.find(r => r.name === roleName);
    if (!role) {
      console.log(`❌ Rolul "${roleName}" nu există pe serverul ${member.guild.name}`);
      return;
    }

    await member.roles.add(role);
    console.log(`✅ Rolul "${roleName}" a fost adăugat lui ${member.user.tag}`);
  } catch (err) {
    console.error("❌ Eroare la adăugarea rolului:", err);
  }
});

// === SLASH COMMAND /opinia ===
const commands = [
  new SlashCommandBuilder()
    .setName("idea")
    .setDescription("Invia un'idea in forma anonima nel canale dedicato")
    .addStringOption(option =>
      option.setName("mesaj")
        .setDescription("Il tuo messaggio anonimo")
        .setRequired(true)
    )
].map(command => command.toJSON());

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

// === HANDLER PENTRU /opinia ===
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "opinia") {
    const mesaj = interaction.options.getString("mesaj");
    const canal = interaction.guild.channels.cache.get(CANAL_OPINII);

    if (!canal) {
      return interaction.reply({
        content: "❌ Canalul pentru opinii nu a fost găsit.",
        ephemeral: true
      });
    }

    await canal.send(`💭 **Idea anonima:** ${mesaj}`);
    await interaction.reply({
      content: "✅ Il tuo commento è stato inviato in forma anonima.!",
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);
