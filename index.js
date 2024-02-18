// disable deprecation warning about sending files API
process.env.NTBA_FIX_350 = 0;

// import TelegramBot from 'node-telegram-bot-api';
const TelegramBot = require('node-telegram-bot-api');
const tts = require('./tts.js');
const token = require('./credentials/bot-token');

const helpMsg = require('./const-strings');
const keys = require('./inline-keyboards.js');

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

    const num = Math.floor(
        (Math.random() * (userChat.interval[1] - userChat.interval[0] + 1)) + 
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
    const date = new Date();
    date.setFullYear(Math.floor(
            (Math.random() * (userChat.yearinterval[1] - userChat.yearinterval[0] + 1)) +
            userChat.yearinterval[0]
        ));
    date.setMonth(Math.floor(Math.random() * 12));
    date.setDate(Math.ceil(Math.random() * 31));
    
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
        bot.sendMessage(chatId, helpMsg, { parse_mode: 'HTML' });
        return;
    }

    if (text === '/me') {
        bot.sendMessage(chatId, JSON.stringify(userChat));
        return;
    }

    if (String(text).startsWith('/interval')) {
        const match = /^\/interval (\d+) (\d+)/.exec(text);
        if (match !== null) {
            userChat.interval = (Number(match[1]) <= Number(match[2]))
                ? [Number(match[1]), Number(match[2])]
                : [Number(match[2]), Number(match[1])];
            bot.sendMessage(chatId, `Интервал теперь от ${userChat.interval[0]} до ${userChat.interval[1]}`);
            return;
        }
        bot.sendMessage(
            chatId,
            'Чтобы задать интервал, нужно указать через пробел значения после команды, например:\n\`/interval 10 999\`',
            { parse_mode: 'MarkdownV2' }
        );
        return;
    }

    if (String(text).startsWith('/yearinterval')) {
        const matchYear = /^\/yearinterval (\d+) (\d+)/.exec(text);
        if (matchYear !== null) {
            userChat.yearinterval = (Number(matchYear[1]) <= Number(matchYear[2]))
                ? [Number(matchYear[1]), Number(matchYear[2])]
                : [Number(matchYear[2]), Number(matchYear[1])];
            bot.sendMessage(chatId, `Интервал теперь от ${userChat.yearinterval[0]} до ${userChat.yearinterval[1]}`);
            return;
        }
        bot.sendMessage(
            chatId,
            'Чтобы задать интервал, нужно указать через пробел значения после команды, например:\n\`/yearinterval 1900 2025\`',
            { parse_mode: 'MarkdownV2' }
        );
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
        bot.sendMessage(
            chatId,
            'Выберите способ:',
            { reply_markup: keys.getDateKeys(userChat.dateoption) }
        );
        return;
    }
    if (text === '/voice') {
        bot.sendMessage(
            chatId,
            'Выберите голос:',
            { reply_markup: keys.getVoiceKeys(userChat.voice) }
        );
        return;
    }
    if (text === '/speed') {
        bot.sendMessage(
            chatId, 
            'Задайте скорость:',
            { reply_markup: keys.getSpeedKeys(userChat.speed) }
        );
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
            yearinterval: [50, 2400],
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
        bot.editMessageReplyMarkup(
            keys.getDateKeys(userChat.dateoption),
            { chat_id: msg.chat.id, message_id: msg.message_id }
        )
        .catch(err => {
            console.error('Editing menu error:\n', err.message);
        })
        .finally(() => {
            bot.answerCallbackQuery(callbackQuery.id);
        })
        return;
    }
    if (callbackQuery.data === 'ja-JP-Wavenet-C' ||
        callbackQuery.data === 'ja-JP-Wavenet-B'
    ) {
        userChat.voice = callbackQuery.data;
        bot.editMessageReplyMarkup(
            keys.getVoiceKeys(userChat.voice),
            { chat_id: msg.chat.id, message_id: msg.message_id }
        )
        .catch(err => {
            console.error('Editing menu error:\n', err.message);
        })
        .finally(() => {
            bot.answerCallbackQuery(callbackQuery.id);
        })
        return;
    }
    if (!isNaN(Number(callbackQuery.data))) {
        userChat.speed = callbackQuery.data;
        bot.editMessageReplyMarkup(
            keys.getSpeedKeys(userChat.speed),
            { chat_id: msg.chat.id, message_id: msg.message_id }
        )
        .catch(err => {
            console.error('Editing menu error:\n', err.message);
        })
        .finally(() => {
            bot.answerCallbackQuery(callbackQuery.id);
        })
        return;
    }
});
