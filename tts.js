const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient({ 
    keyFile: './credentials/eco-hangar-327722-f7dd8bc97f4d.json'
});

async function tts(text) {
    const request = {
        input: { text: text },
        voice: { languageCode: 'ja-JP', name: 'ja-JP-Wavenet-B', },
        audioConfig: { audioEncoding: 'OGG_OPUS' },
    };
    const [response] = await client.synthesizeSpeech(request);
    return response.audioContent;
}
module.exports = tts;