// import TelegramBot from 'node-telegram-bot-api';
const TelegramBot = require('node-telegram-bot-api');
const tts = require('./tts.js');
const token = require('./credentials/bot-token');

const helpMsg = require('./const-strings');

const bot = new TelegramBot(token, { polling: true, filepath: false });

function nop(msg, userChat) {
    // console.log('init method for chatId '+chatId);
}
function ask(msg, userChat) {
    const chatId = msg.chat.id;

    const num = Math.floor((Math.random() * 
    (userChat.interval[1] - userChat.interval[0] + 1)) + 
    userChat.interval[0]);

    userChat.answer = num;

    // bot.sendMessage(chatId, `Asking you: ${num}?`);
    tts(num).then(res => {
        bot.sendVoice(chatId, res);
    });

    userChat.action = check;

}
function check(msg, userChat) {
    const chatId = msg.chat.id;

    if (Number(msg.text) === userChat.answer) {
        bot.sendMessage(chatId, 'Правильно!').then(() => {
            if (userChat.train) {
                ask(msg, userChat);
            } else {
                userChat.action = nop;
            }
        });
    } else {
        bot.sendMessage(chatId, 'Нет...');
    }

    

}


function dispatch(msg, userChat) {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text.length > 30) {
        bot.sendMessage(chatId, 'too long message');
        return;
    }

    if (text === '/reset') {
        delete chats[msg.chat.id];
    }

    if (text === '/help' || text === '/start') {
        bot.sendMessage(chatId, helpMsg);
        return;
    }

    if (text === '/me') {
        bot.sendMessage(chatId, JSON.stringify(userChat));
        return;
    }

    const match = /^\/interval (\d+) (\d+)/.exec(text);
    if (match !== null) {
        userChat.interval = (Number(match[1]) <= Number(match[2])) ? 
        [Number(match[1]), Number(match[2])] : [Number(match[2]), Number(match[1])];
        bot.sendMessage(chatId, `Интервал теперь от ${userChat.interval[0]} до ${userChat.interval[1]}`);
        return;
    }

    if (text === '/ask') {
        userChat.action = ask;
    }
    if (text === '/train') {
        userChat.train = true;
        bot.sendMessage(chatId, 'Режим тренировки: ВКЛ');
        return;
    }
    if (text === '/stop') {
        userChat.train = false;
        bot.sendMessage(chatId, 'Режим тренировки: ВЫКЛ');
        return;
    }

    userChat.action(msg, userChat);

    // if (Number.isInteger(Number(text))) {
    //     tts(text).then(res => {
    //         bot.sendVoice(chatId, res);
    //     })
    // }
}

const chats = new Object();

bot.on('message', (msg) => {
    
    const chatId = msg.chat.id;

    let userChat = chats[chatId];
    if (userChat === undefined) {
        chats[chatId] = {
            action: nop,
            answer: null,
            train: true,
            interval: [0, 9999],
        }
        userChat = chats[chatId];
    }

    dispatch(msg, userChat);
    
    // if (msg.text === '/start') {
    //     chats.add(chatId);
    //     bot.sendMessage(chatId, `Купи слона!`)
    // } else if (chats.has(chatId)) {
    //     bot.sendMessage(chatId, `Все говорят "${msg.text}", а ты купи слона!`);
    // }
});

