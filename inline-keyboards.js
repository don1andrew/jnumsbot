function getLabeledKeys(option, buttons) {
    const selected = buttons
        .find(btn => btn.callback_data === option);
    selected.text = `🔹 ${selected.text}`;
    return { 
        "inline_keyboard": [ buttons ]
    };
}

function getVoiceKeys(option) {
    const buttons = [
        { text: 'Мужской', callback_data: 'ja-JP-Wavenet-C' },
        { text: 'Женский', callback_data: 'ja-JP-Wavenet-B' },
    ];
    return getLabeledKeys(option, buttons);
}

function getSpeedKeys(option) {
    const buttons = [
        { text: '0.5', callback_data: '0.5' },
        { text: '0.75', callback_data: '0.75' },
        { text: '1', callback_data: '1' },
        { text: '1.25', callback_data: '1.25' },
    ];
    return getLabeledKeys(option, buttons);
}

function getDateKeys(option) {
    const buttons = [
        { text: 'Полная дата', callback_data: 'full_date' },
        { text: 'Месяц и число', callback_data: 'month_date' },
        { text: 'Число', callback_data: 'date' },
    ];
    return getLabeledKeys(option, buttons);
}

module.exports = {
    getVoiceKeys,
    getSpeedKeys,
    getDateKeys
}
