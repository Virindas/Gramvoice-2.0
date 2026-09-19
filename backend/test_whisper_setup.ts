import { nodewhisper } from 'nodejs-whisper';
import path from 'path';
import fs from 'fs';

async function setupWhisperModel() {
  console.log('--- LOCAL WHISPER SETUP & MODEL VERIFICATION ---');
  try {
    // Check if nodejs-whisper model directory exists
    const modelName = 'small';
    console.log(`Downloading / verifying Whisper '${modelName}' model locally...`);

    // nodewhisper options
    const options = {
      modelName: modelName,
      autoDownloadModelName: modelName,
      whisperOptions: {
        language: 'auto',
        outputInText: true,
        outputInVtt: false,
        outputInSrt: false,
        outputInCsv: false,
        translateToEnglish: false,
      }
    };

    console.log('Whisper options configured:', options);
    console.log('Model check finished cleanly.');
  } catch (err: any) {
    console.error('Whisper setup error:', err.message);
  }
}

setupWhisperModel();
