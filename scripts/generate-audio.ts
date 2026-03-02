import * as fs from 'fs';
import * as path from 'path';

// Load .env.local from ramp-mvp root
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  }
}

// ── Narration scripts ─────────────────────────────────────────────────
// 9 scenes, ~90 seconds total. ElevenLabs Rachel voice.
const NARRATIONS = [
  {
    id: 'scene-0',
    text: "Finding the right consultant used to mean digging through spreadsheets, email chains, and shared drives. Guessing. Hoping. Not anymore.",
  },
  {
    id: 'scene-1',
    text: "Meet RAMP. Ask anything — in plain English. Who's available for SQL work in April? Who's working on SJCERA, and when do they finish? Just ask.",
  },
  {
    id: 'scene-2',
    text: "Senior SQL DBA, available April — Gregory Pike, right there. Working on SJCERA? Marcus Webb, wrapping up June fifteenth. Instant answers. No digging.",
  },
  {
    id: 'scene-3',
    text: "Upload anything — a resume, a contract brief, or a project document. RAMP reads it, understands the context, and automatically connects it to the right people, projects, and clients. No manual mapping. No tagging. It just knows where everything belongs.",
  },
  {
    id: 'scene-4',
    text: "Every profile is built differently — automatically. Kevin Lynch, Chief Sales Officer: accounts managed, retention rate, years in the game — front and center. RAMP read his resume and just knew. Marcus Webb in sales: win rate, deal size, territory. Gregory the DBA: certifications first, then uptime stats. Same platform. Three completely different people — three completely different profiles.",
  },
  {
    id: 'scene-5',
    text: "Move Gregory to BRCERA at sixty percent, starting April. RAMP plans it, previews it, applies it. One sentence. Done.",
  },
  {
    id: 'scene-6',
    text: "Eighty-nine live assignments. Ten people flagged over capacity — automatically. See everything. Miss nothing.",
  },
  {
    id: 'scene-7',
    text: "Every page has an Edit Agent. Want a new feature? Just say: add a skills gap badge to all profiles. The Edit Agent writes the code, ships it, and notifies you. Not a ticket. A working feature — built by the app itself.",
  },
  {
    id: 'scene-8',
    text: "RAMP. Ask anything. Change anything. The platform that understands your team — and builds itself around them.",
  },
];

// ── Output directory ──────────────────────────────────────────────────
// Saves into the ramp-video project public/audio/ folder
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'ramp-video', 'public', 'audio');

// ── API helpers ───────────────────────────────────────────────────────
async function generateWithElevenLabs(text: string, outputPath: string): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not set');

  const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel — clear, professional, natural pacing

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',  // highest quality model on Starter
      voice_settings: {
        stability: 0.40,          // lower = more expressive/dynamic
        similarity_boost: 0.80,   // stays true to Rachel's character
        style: 0.35,              // adds stylistic flair (ElevenLabs v2 feature)
        use_speaker_boost: true,  // sharper clarity
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs API error ${response.status}: ${errText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

async function generateWithOpenAI(text: string, outputPath: string): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      voice: 'shimmer',
      input: text,
      speed: 0.88,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log('Generating narration audio...\n');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}\n`);
  }

  const useElevenLabs = !!process.env.ELEVENLABS_API_KEY;
  const useOpenAI = !!process.env.OPENAI_API_KEY;

  if (!useElevenLabs && !useOpenAI) {
    console.error('Error: Set ELEVENLABS_API_KEY or OPENAI_API_KEY in .env.local');
    process.exit(1);
  }

  console.log(`Using: ${useElevenLabs ? 'ElevenLabs (Rachel)' : 'OpenAI TTS (nova)'}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  let successCount = 0;
  for (const scene of NARRATIONS) {
    const outputPath = path.join(OUTPUT_DIR, `${scene.id}.mp3`);
    let ok = false;
    // Try ElevenLabs first, fallback to OpenAI
    if (useElevenLabs) {
      try {
        await generateWithElevenLabs(scene.text, outputPath);
        ok = true;
      } catch (err: any) {
        console.warn(`  ElevenLabs failed for ${scene.id}, trying OpenAI... (${err.message.slice(0, 60)})`);
      }
    }
    if (!ok && useOpenAI) {
      try {
        await generateWithOpenAI(scene.text, outputPath);
        ok = true;
      } catch (err: any) {
        console.error(`✗ ${scene.id}.mp3  — OpenAI also failed: ${err.message}`);
      }
    }
    if (ok) {
      const bytes = fs.statSync(outputPath).size;
      console.log(`✓ ${scene.id}.mp3  (${(bytes / 1024).toFixed(1)} KB)`);
      successCount++;
    } else if (!useElevenLabs && !useOpenAI) {
      console.error(`✗ ${scene.id}.mp3  — no API key available`);
    }
  }

  console.log(`\n${successCount}/${NARRATIONS.length} files generated in ${OUTPUT_DIR}`);
}

main().catch(e => { console.error(e); process.exit(1); });
