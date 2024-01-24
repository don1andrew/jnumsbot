// import TelegramBot from 'node-telegram-bot-api';
const TelegramBot = require('node-telegram-bot-api');
const tts = require('./tts.js');
const token = require('./credentials/bot-token');

const helpMsg = require('./const-strings');

const bot = new TelegramBot(token, { polling: true, filepath: false });

function nop(msg, userChat) {
    // console.log('init method for chatId '+chatId);
}
function askNumber(msg, userChat) {
    const chatId = msg.chat.id;

    const num = Math.floor((Math.random() * 
    (userChat.interval[1] - userChat.interval[0] + 1)) + 
    userChat.interval[0]);

    userChat.answer = num;

    // TMP
    bot.sendMessage(chatId, num);

    // tts(num).then(res => {
    //     bot.sendVoice(chatId, res);
    // }).catch(err => {
    //     console.log('TTS ERROR\n', err);
    // });

    userChat.action = checkNum;
}
function askDate(msg, userChat) {
    const chatId = msg.chat.id;

    // получаем физически корректную дату
    const date = new Date(Math.floor((Math.random() * 3200 - 50 + 1) + 50),
        Math.floor(Math.random() * 12),
        Math.ceil(Math.random() * 31));
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const request = `${year}年${month}月${day}日`;
    userChat.answer = `${year}.${month}.${day}`;

    // TMP
    bot.sendMessage(chatId, request);

    // tts(request).then(res => {
    //     bot.sendVoice(chatId, res);
    // }).catch(err => console.log('tts error', err));

    userChat.action = checkDate;
}
function checkDate(msg, userChat) {
    const chatId = msg.chat.id;
    const userAnswer = String(msg.text)
        .split('.')
        .map(item => Number(item))
        .join('.');

    if (userAnswer === userChat.answer) {
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

    // userChat.action = nop;
    console.log(`${userChat.answer} -- ${userAnswer}`);
}
function checkNum(msg, userChat) {
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
    if (text === '/asknum') {
        ask = askNumber;
        userChat.action = ask;
    }
    if (text === '/askdate') {
        ask = askDate;
        userChat.action = ask;
    }
    if (text === '/ask') {
        userChat.action = ask;
    }


    userChat.action(msg, userChat);

    // if (Number.isInteger(Number(text))) {
    //     tts(text).then(res => {
    //         bot.sendVoice(chatId, res);
    //     })
    // }
}

const chats = new Object();
let ask = askNumber;

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
bot.on('polling_error', (err) => {
    console.log(err);
})

