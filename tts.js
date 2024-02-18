const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient({ 
    keyFile: './credentials/jwords-bot-2fe88c4c3474.json'
});

async function tts(text, voice = 'ja-JP-Wavenet-B', speed = '1') {
    const request = {
        input: { text: text },
        voice: { languageCode: 'ja-JP', name: voice, },
        audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: speed },
    };
    const [response] = await client.synthesizeSpeech(request);
    return response.audioContent;
}
module.exports = tts;
