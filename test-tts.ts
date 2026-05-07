import { textToSpeech } from "./src/services/aiService";

async function main() {
    console.log("Testing TTS...");
    const audio = await textToSpeech("Halo, nama saya Budi.");
    if (audio) {
        console.log("Audio received! Size:", audio.length);
    } else {
        console.log("Audio is null");
    }
}
main();
