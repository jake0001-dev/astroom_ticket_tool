const {Client, Intents, GatewayIntentBits, EmbedBuilder, ButtonBuilder,ButtonStyle,ActionRowBuilder,ChannelType,PermissionsBitField } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
let fs = require('fs');
const config = require('./config.json');
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
]})

client.on('ready', async() => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setPresence({
        activities: [{ name: 'with Tickets' }],
        status: 'online'
    })

    let channel = client.channels.cache.get(config.support_channel_id);
    console.log(channel.id);

    channel.messages.fetch({ limit: 100 }).then( messages => {
        try {
            messages.forEach( message => {
                if(message.embeds[0].title === 'Astroom Ticket System') {
                    message.delete();
                }
            })
        } catch (error) {
            console.log(error);
        }

    }
    ).catch(console.error);


    let embed = new EmbedBuilder()
        .setTitle('Astroom Ticket System')
        .setDescription('React with 🎫 to open a ticket')
        .setThumbnail('https://cdn.discordapp.com/icons/963808848425136159/4ae19e69350a2ceb8c66350ea5eaf549.webp')
        .setColor('#7f00e6')
        .setFooter({ text: 'Astroom Tickets', iconURL: 'https://cdn.discordapp.com/icons/963808848425136159/4ae19e69350a2ceb8c66350ea5eaf549.webp' });
        
    let button = new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫');


    let actionRow = new ActionRowBuilder()
        .addComponents(button)

    channel.send({ embeds: [embed], components: [actionRow] })

})


    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;
        if (interaction.customId === 'create_ticket') {

            catagory = interaction.guild.channels.cache.get(config.ticket_category_id);

            // Create a new channel
            let channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: catagory,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                    }
                ]
            })
            await interaction.reply({ content: `Your ticket has been created at ${channel}`, ephemeral: true });
        
            // Send a message to the channel
            let embed = new EmbedBuilder()
            .setTitle('Astroom Ticket System')
            .setDescription('Thanks for Reaching out to us. Please describe your issue and we will get back to you as soon as possible.')
            .setColor('#7f00e6')
            .setFooter({ text: 'Astroom Tickets', iconURL: 'https://cdn.discordapp.com/icons/963808848425136159/4ae19e69350a2ceb8c66350ea5eaf549.webp' });
            
        let button = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Create Ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🎫');
    
    
        let actionRow = new ActionRowBuilder()
            .addComponents(button)
    
        channel.send({ embeds: [embed], components: [actionRow] })

        }
    
        

        if (interaction.customId === 'close_ticket') {
            const attachment = await discordTranscripts.createTranscript(interaction.channel);
            let logging_channel = client.channels.cache.get(config.transcript_channel);
            await logging_channel.send({ files: [attachment] });
            await interaction.channel.delete();
        }
    })



client.login(config.token);