const { 
  Client, 
  GatewayIntentBits, 
  SlashCommandBuilder, 
  Routes, 
  REST 
} = require("discord.js");

const TOKEN = process.env.TOKEN; // tokenul din Render
const GUILD_ID = "1424810686529142941";
const CLIENT_ID = "1424879422879699149";
const CANAL_OPINII = "1426272640863178875";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

// === CÂND BOTUL PORNEȘTE ===
client.once("ready", () => {
  console.log(`✅ Botul este online ca ${client.user.tag}`);
});

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
  if (interaction.commandName === "idea") {
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
