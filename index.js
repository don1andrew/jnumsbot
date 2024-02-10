// disable deprecation warning about sending files API
process.env.NTBA_FIX_350 = 0;

// import TelegramBot from 'node-telegram-bot-api';
const TelegramBot = require('node-telegram-bot-api');
const tts = require('./tts.js');
const token = require('./credentials/bot-token');

const helpMsg = require('./const-strings');

const DATE_OPTION_PARAMS = {
    full_date: {
        name: 'Полная дата',
        getRequestString: (year, month, day) => `${year}年${month}月${day}日`,
        getAnswerString: (year, month, day) => `${year}.${month}.${day}`,
    },
    month_date: {
        name: 'Месяц и число',
        getRequestString: (year, month, day) => `${month}月${day}日`,
        getAnswerString: (year, month, day) => `${month}.${day}`,
    },
    date: {
        name: 'Число',
        getRequestString: (year, month, day) => `${day}日`,
        getAnswerString: (year, month, day) => `${day}`,
    },
}

const bot = new TelegramBot(token, { polling: true, filepath: false });

function nop(msg, userChat) {
    // console.log('init method for chatId '+chatId);
}
function askNumber(msg, userChat) {
    const chatId = msg.chat.id;

    const num = Math.floor((Math.random() * 
        (userChat.interval[1] - userChat.interval[0] + 1)) + 
        userChat.interval[0]
    );

    userChat.answer = num;

    // TMP
    // bot.sendMessage(chatId, num);

    tts(num, userChat.voice, userChat.speed).then(res => {
        bot.sendVoice(chatId, res);
    }).catch(err => {
        console.log('TTS ERROR\n', err);
    });

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
    
    const request = DATE_OPTION_PARAMS[userChat.dateoption].getRequestString(year, month, day);
    userChat.answer = DATE_OPTION_PARAMS[userChat.dateoption].getAnswerString(year, month, day);

    // TMP
    // bot.sendMessage(chatId, request);

    tts(request, userChat.voice, userChat.speed).then(res => {
        bot.sendVoice(chatId, res);
    }).catch(err => console.log('tts error', err));

    userChat.action = checkDate;
}
function ask(msg, userChat) {
    if (userChat.ask === 'number') {
        askNumber(msg, userChat);
    }
    if (userChat.ask === 'date') {
        askDate(msg, userChat);
    }
}
function checkDate(msg, userChat) {
    const chatId = msg.chat.id;
    const userAnswer = String(msg.text)
        .split('.')
        .map(item => Number(item))
        .join('.');

    if (userAnswer === userChat.answer) {
        bot.sendMessage(chatId, 'Правильно!').then(() => {
            ask(msg, userChat);
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
            ask(msg, userChat);
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
    if (text === '/asknum') {
        userChat.ask = 'number';
        userChat.action = ask;
    }
    if (text === '/askdate') {
        userChat.ask = 'date';
        userChat.action = ask;
    }
    if (text === '/ask') {
        userChat.action = ask;
    }
    if (text === '/reveal') {
        let answer = '';
        if (userChat.answer === null) {
            answer = 'Мы пока ничего не спросили :)';
            userChat.action = nop;
        } else {
            answer = `Ответ: ${userChat.answer}`;
            userChat.action = ask;
        }
        bot.sendMessage(chatId, answer);
    }
    if (text === '/dateoption') {
        bot.sendMessage(chatId, 'Выберите способ:',
        { "reply_markup": {
            "inline_keyboard": [
                [
                    { "text": 'Полная дата', "callback_data": 'full_date' },
                    { "text": 'Месяц и число', "callback_data": 'month_date' },
                    { "text": 'Число', "callback_data": 'date' },
                ],
        ]}});
        return;
    }
    if (text === '/voice') {
        bot.sendMessage(chatId, 'Выберите голос:',
        { "reply_markup": {
            "inline_keyboard": [
                [
                    { "text": 'Мужской', "callback_data": 'ja-JP-Wavenet-C' },
                    { "text": 'Женский', "callback_data": 'ja-JP-Wavenet-B' },
                ],
        ]}});
        return;
    }
    if (text === '/speed') {
        bot.sendMessage(chatId, 'Задайте скорость:',
        { "reply_markup": { 
            "inline_keyboard": [
                [
                    { "text": '0.5', "callback_data": '0.5' },
                    { "text": '0.75', "callback_data": '0.75' },
                    { "text": '1', "callback_data": '1' },
                    { "text": '1.25', "callback_data": '1.25' },
                ],
        ]}});
        return;
    }

    userChat.action(msg, userChat);
}

const chats = new Object();

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    let userChat = chats[chatId];
    if (userChat === undefined) {
        chats[chatId] = {
            action: nop,
            ask: 'number',
            answer: null,
            interval: [0, 9999],
            dateoption: 'full_date',
            voice: 'ja-JP-Wavenet-B',
            speed: '1',
        }
        userChat = chats[chatId];
    }

    dispatch(msg, userChat);
});

bot.on('polling_error', (err) => {
    console.log(err);
})

bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    userChat = chats[msg.chat.id];
    // add switch if more callback types
    if (callbackQuery.data === 'full_date' ||
        callbackQuery.data === 'month_date' ||
        callbackQuery.data === 'date'
    ) {
        userChat.dateoption = callbackQuery.data;
        bot.answerCallbackQuery(callbackQuery.id)
            .then(() => bot.sendMessage(msg.chat.id,
                'Будет спрашиваться ' + DATE_OPTION_PARAMS[userChat.dateoption].name.toLowerCase()));
        return;
    }
    if (callbackQuery.data === 'ja-JP-Wavenet-C' || callbackQuery === 'ja-JP-Wavenet-B') {
        userChat.voice = callbackQuery.data;
        bot.answerCallbackQuery(callbackQuery.id)
            .then(() => bot.sendMessage(msg.chat.id,
                `Голос теперь ${callbackQuery.data === 'ja-JP-Wavenet-C' ? 'мужской' : 'женский'}`));
        return;
    }
    if (!isNaN(Number(callbackQuery.data))) {
        userChat.speed = callbackQuery.data;
        bot.answerCallbackQuery(callbackQuery.id)
            .then(() => bot.sendMessage(msg.chat.id,
                `Скорость теперь ${callbackQuery.data}`));
        return;
    }
});
