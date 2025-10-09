// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('ERROR: DISCORD_TOKEN nu este setat!');
  process.exit(1);
}

/* ---------- Discord bot ---------- */
const client = new Client({
  intents: [ 
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent // doar dacă ai nevoie de content
  ]
});

client.once('ready', () => {
  console.log(`Discord bot connected as ${client.user.tag}`);
});

client.on('messageCreate', msg => {
  if (msg.author.bot) return;
  if (msg.content === '!ping') msg.reply('pong');
});

client.login(token).catch(err => {
  console.error('Login error:', err);
  process.exit(1);
});

/* ---------- Mini HTTP server (pentru Render) ---------- */
const app = express();

app.get('/', (req, res) => res.send('OK - bot running'));
app.get('/health', (req, res) => res.json({ status: 'ok', bot: !!client.user }));

const port = parseInt(process.env.PORT, 10) || 3000;
const server = app.listen(port, () => {
  console.log(`HTTP server listening on port ${port}`);
});

/* ---------- Graceful shutdown ---------- */
function shutdown() {
  console.log('Shutdown initiated');
  server.close(() => console.log('HTTP server closed'));
  client.destroy();
  // așteaptă puțin ca să se finalizeze log-urile
  setTimeout(() => process.exit(0), 1000);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
