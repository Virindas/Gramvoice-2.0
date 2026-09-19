import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function transcribeAudio(filePath: string): Promise<{ transcript: string; language: string }> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Audio file not found at path: ${filePath}`);
  }

  console.log(`[Python Whisper] Invoking Python Whisper service for: ${filePath}`);

  const scriptPath = path.join(__dirname, 'whisper_transcribe.py');
  const command = `python "${scriptPath}" "${filePath}"`;

  try {
    const { stdout, stderr } = await execAsync(command, { timeout: 60000 });
    console.log(`[Python Whisper STDOUT]:`, stdout);

    if (stderr && !stdout) {
      console.warn(`[Python Whisper STDERR]:`, stderr);
    }

    const data = JSON.parse(stdout.trim());

    if (data.error) {
      throw new Error(`Whisper Service Error: ${data.error}`);
    }

    if (!data.transcript) {
      throw new Error('Whisper speech recognition returned an empty transcript. Please speak clearly into the microphone.');
    }

    return {
      transcript: data.transcript,
      language: data.language || 'auto'
    };
  } catch (err: any) {
    console.error(`[Python Whisper Execution Failed]:`, err.message || err);
    throw new Error(err.message || 'Whisper speech recognition failed to process audio.');
  }
}
