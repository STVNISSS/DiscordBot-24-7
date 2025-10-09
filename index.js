const { Client, GatewayIntentBits } = require('discord.js');
const TOKEN = process.env.TOKEN;


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // necesar pentru detectarea noilor membri
  ],
});

// Când botul pornește
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

client.login(token);


