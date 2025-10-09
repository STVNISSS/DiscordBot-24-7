const { Client, GatewayIntentBits } = require("discord.js");

// preia tokenul din variabilele de mediu (Render)
const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", () => {
  console.log(`✅ Botul este online ca ${client.user.tag}`);
});

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

client.login(TOKEN);
