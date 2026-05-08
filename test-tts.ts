import { textToSpeech } from "./src/services/aiService";

async function main() {
    console.log("Testing TTS...");
    const response = await textToSpeech("Halo, nama saya Budi.");
    if (response) {
        console.log("Audio received! Size:", response.data.length);
    } else {
        console.log("Audio is null");
    }
}
main();
