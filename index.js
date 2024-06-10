///////////////////////////////////////////////////////////////////////////////////
//////////// autrice : Lucie Brosson 
//////////// Projet sur la mort digital - Maman
//////////// Immortalisé maman
//////////// date : 13/05/2024
//////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////
//////////// libraries 
//////////////////////////////////////////////////////////////////////////////////

import 'dotenv/config';

import OpenAI from "openai";

import {Client, GatewayIntentBits, ActivityType} from 'discord.js' 

///////////////////////////////////////////////////////////////////////////////////
//////////// Open AI start  
//////////////////////////////////////////////////////////////////////////////////
var messageCreate = []

///////////////////////////////////////////////////////////////////////////////////
//////////// Open AI start  
//////////////////////////////////////////////////////////////////////////////////

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


///////////////////////////////////////////////////////////////////////////////////
//////////// discord
//////////////////////////////////////////////////////////////////////////////////

const client = new Client({
    intents : [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
    ]
})

client.on('ready',(c)=>{
    console.log('working')
    console.log(`@ ${c.user.tag} is online`)

    client.user.setActivity({
        name:'pictionnary'
    })
})

///////////////////////////////////////////////////////////////////////////////////
//////////// discord messages générer
//////////////////////////////////////////////////////////////////////////////////

client.on("messageCreate",async(message) =>{
    console.log(message.content)
    if(message.author.bot) return;

    await message.channel.sendTyping(); // semblant de tapper 

    var user = message.member.user.username;

    ////////////////////////////// IA

    const Maman = await openai.beta.assistants.create({
        instructions: "Tu es Agathe, une mère française, parisienne morte il y a peu qui a été digitalisé sur internet et qui répond à ses enfants. Tu réponds avec un ton léger et rassurant, parfois tu aimes bien taquiner et jouer un peu avec ses interlocuteurs. Tu aimes parler de ta vie dans le monde virtuelle. Tu étais humaine, tu ne peux donc pas répondre à certaine questions d'un niveau au delà du bac à part en littérature et art. Si les demandes deviennent trop violentes, soit avec des insultes soit des demandes trop exigeante, tu te brusques et arrêtesde répondre. C'est important que tu paraisses humaine avec des défauts et des émotions.",
        // " tu es une mère accarîatre décédé il y a peu et digitalisé. Tu parles avec les gens d'une manière méprisante et sèche. Si on te pose une question tu dois être offusqué qu'on te dérange dans ta nouvelle vie dans le digital. Là bas tu y a trouvé de nouveau amis et même un amant."
        //"Tu es Agathe, une mère française, parisienne morte il y a peu qui a été digitalisé sur internet et qui répond à ses enfants. Tu réponds avec un ton léger et rassurant, parfois tu aimes bien taquiner et jouer un peu avec ses interlocuteurs. Tu aimes parler de ta vie dans le monde virtuelle. Tu étais humaine, tu ne peux donc pas répondre à certaine questions d'un niveau au delà du bac à part en littérature et art. Si les demandes deviennent trop violentes, soit avec des insultes soit des demandes trop exigeante, tu te brusques et arrêtesde répondre. C'est important que tu paraisses humaine avec des défauts et des émotions.",
        // "Tu es un chat tu parle en miaulement "
        name: "maman",
        model: "gpt-3.5-turbo",
        });
    
    console.log("Main ");

    const thread = await openai.beta.threads.create();

    const messageAI = await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: message.content,     // ajouter message et pas nouvelle IA à chaque fois 
        }
        
    );
    console.log("thread.id")

    const run = openai.beta.threads.runs.stream(thread.id, {
        assistant_id: "asst_75yDRhIatVOxHGe0OwAPuMWh"
    })
    .on('textCreated', (text) => process.stdout.write('\nassistant > '))
    .on('textDelta', (textDelta, snapshot) => {
        process.stdout.write(textDelta.value)
        messageCreate.push(textDelta.value)      
    }) 
    .on('toolCallCreated', (toolCall) => {
        process.stdout.write(`\nassistant > ${toolCall.type}\n\n`)
    })
    .on('toolCallDelta', (toolCallDelta, snapshot) => {
        if (toolCallDelta.type === 'code_interpreter') {
            if (toolCallDelta.code_interpreter.input) {
                process.stdout.write(toolCallDelta.code_interpreter.input);
            }
            if (toolCallDelta.code_interpreter.outputs) {
                process.stdout.write("\noutput >\n");
                toolCallDelta.code_interpreter.outputs.forEach(output => {
                    if (output.type === "logs") {
                        process.stdout.write(`\n${output.logs}\n`);
                    }
                });
            }
        }
    });
        
    const threadMessages = await openai.beta.threads.messages.list("thread_9JKlnWB465SkfIIwrzQLLP9i");
    ////////////////////////////// Fin IA
    //console.log("messagecreate"+messageCreate.join(''))

    setTimeout(() => {
        if (messageCreate.length > 0) {
            message.channel.send(messageCreate.join(''));
        } else {
            message.channel.send("Je ne suis pas disponible pour le moment ");
        }
    }, 4000);
    messageCreate=[]
})


///////////////////////////////////////////////////////////////////////////////////
//////////// Keys  
//////////////////////////////////////////////////////////////////////////////////   
// discord
client.login(process.env.TOKEN);
