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
