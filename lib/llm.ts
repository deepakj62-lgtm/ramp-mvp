import {
  SEARCH_EXTRACTION_PROMPT,
  CHATBOT_PAGE_CONTEXT_TEMPLATE,
  FEEDBACK_EXTRACTION_PROMPT,
} from './llm-prompts';

// ─── Types ───────────────────────────────────────────────────────────

export type LLMProvider = 'anthropic' | 'openai' | 'mock';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string | null;
  model: string;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
}

export interface ExtractedSearchParams {
  skills: string[];
  startDate?: string;
  endDate?: string;
  minAvailability?: number;
  location?: string;
  companyGroup?: string;
  level?: string;
  practice?: string;
  roleFamily?: string;
  rawQuery: string;
}

export interface ExtractedFeedback {
  type: 'bug' | 'feature' | 'data_issue' | 'question';
  title: string;
  description: string;
  priority: number;
  affectedArea?: string;
}

// ─── Config ──────────────────────────────────────────────────────────

export function getConfig(): LLMConfig {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (anthropicKey && anthropicKey !== 'your-anthropic-api-key-here') {
    return { provider: 'anthropic', apiKey: anthropicKey, model: 'claude-haiku-4-5-20251001' };
  }
  if (openaiKey && openaiKey !== 'your-openai-api-key-here') {
    return { provider: 'openai', apiKey: openaiKey, model: 'gpt-4o-mini' };
  }
  return { provider: 'mock', apiKey: null, model: 'mock' };
}

// ─── Core Chat Function ─────────────────────────────────────────────

export async function chat(
  messages: LLMMessage[],
  config?: Partial<LLMConfig>
): Promise<LLMResponse> {
  const cfg = { ...getConfig(), ...config };

  if (cfg.provider === 'mock') {
    return mockChat(messages);
  }

  if (cfg.provider === 'anthropic') {
    return anthropicChat(messages, cfg);
  }

  if (cfg.provider === 'openai') {
    return openaiChat(messages, cfg);
  }

  return mockChat(messages);
}

// ─── Vision Chat (multimodal) ────────────────────────────────────────

export async function chatWithVision(
  messages: LLMMessage[],
  imageBase64: string,
  imageMimeType: string,
  config?: Partial<LLMConfig>
): Promise<LLMResponse> {
  const cfg = { ...getConfig(), ...config };

  if (cfg.provider === 'mock') {
    return mockChat(messages); // mock ignores image, treats as text
  }

  if (cfg.provider === 'anthropic') {
    const systemMessage = messages.find(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    // Attach image to the last user message
    const apiMessages = nonSystemMessages.map((m, idx) => {
      if (m.role === 'user' && idx === nonSystemMessages.length - 1) {
        return {
          role: 'user' as const,
          content: [
            {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: (imageMimeType || 'image/png') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            { type: 'text' as const, text: m.content },
          ],
        };
      }
      return { role: m.role as 'user' | 'assistant', content: m.content };
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': cfg.apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: 2048,
        system: systemMessage?.content || '',
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      console.error('Anthropic vision error:', await response.text());
      return mockChat(messages);
    }

    const data = await response.json();
    return { content: data.content[0].text, provider: 'anthropic' };
  }

  if (cfg.provider === 'openai') {
    const systemMessage = messages.find(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    const apiMessages = [
      ...(systemMessage ? [{ role: 'system', content: systemMessage.content }] : []),
      ...nonSystemMessages.map((m, idx) => {
        if (m.role === 'user' && idx === nonSystemMessages.length - 1) {
          return {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
              { type: 'text', text: m.content },
            ],
          };
        }
        return { role: m.role, content: m.content };
      }),
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: apiMessages, max_tokens: 1024 }),
    });

    if (!response.ok) return mockChat(messages);
    const data = await response.json();
    return { content: data.choices[0].message.content, provider: 'openai' };
  }

  return mockChat(messages);
}

// ─── Anthropic Provider ──────────────────────────────────────────────

async function anthropicChat(messages: LLMMessage[], cfg: LLMConfig): Promise<LLMResponse> {
  const systemMessage = messages.find(m => m.role === 'system');
  const nonSystemMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': cfg.apiKey!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: 2048,
      system: systemMessage?.content || '',
      messages: nonSystemMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Anthropic API error:', error);
    return mockChat(messages); // Fallback to mock
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    provider: 'anthropic',
  };
}

// ─── OpenAI Provider ─────────────────────────────────────────────────

async function openaiChat(messages: LLMMessage[], cfg: LLMConfig): Promise<LLMResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    return mockChat(messages); // Fallback to mock
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    provider: 'openai',
  };
}

// ─── Mock Provider ───────────────────────────────────────────────────

function mockChat(messages: LLMMessage[]): LLMResponse {
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  const content = lastUserMessage?.content || '';

  // Check if this is a search extraction request (system prompt contains "Extract structured search")
  const systemMessage = messages.find(m => m.role === 'system');
  if (systemMessage?.content.includes('Extract structured search')) {
    return { content: mockExtractSearch(content), provider: 'mock' };
  }

  // Default chatbot response
  return {
    content: mockChatbotResponse(content, systemMessage?.content || ''),
    provider: 'mock',
  };
}

function mockExtractSearch(query: string): string {
  const lower = query.toLowerCase();
  const params: any = { skills: [], rawQuery: query };

  // Extract percentage
  const pctMatch = lower.match(/(\d+)\s*%\s*(free|available)/);
  if (pctMatch) {
    params.minAvailability = parseInt(pctMatch[1]);
  }
  if (lower.includes('fully available') || lower.includes('on bench') || lower.includes('completely free')) {
    params.minAvailability = 100;
  }

  // Extract dates/months
  const monthNames: Record<string, string> = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12',
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'jun': '06', 'jul': '07', 'aug': '08', 'sep': '09',
    'oct': '10', 'nov': '11', 'dec': '12',
  };
  for (const [name, num] of Object.entries(monthNames)) {
    if (lower.includes(name)) {
      params.startDate = `2026-${num}-01`;
      const endDay = num === '02' ? '28' : ['04','06','09','11'].includes(num) ? '30' : '31';
      params.endDate = `2026-${num}-${endDay}`;
      break;
    }
  }

  // Quarter extraction
  const qMatch = lower.match(/q([1-4])/);
  if (qMatch) {
    const q = parseInt(qMatch[1]);
    const qStart = ['01', '04', '07', '10'][q - 1];
    const qEnd = ['03', '06', '09', '12'][q - 1];
    params.startDate = `2026-${qStart}-01`;
    const endDay = ['03','06','09','12'].indexOf(qEnd) >= 0 ? '30' : '31';
    params.endDate = `2026-${qEnd}-${qEnd === '03' ? '31' : endDay}`;
  }

  // Extract location
  if (lower.includes('canada') || lower.includes('canadian') || lower.includes('ulc')) {
    params.location = 'Canada';
  } else if (lower.includes(' us ') || lower.includes('united states') || lower.match(/\bus\b/)) {
    params.location = 'US';
  }

  // Extract company group
  if (lower.includes('linea secure') || lower.includes('cyber') || lower.includes('security')) {
    params.companyGroup = 'Linea Secure';
  } else if (lower.includes('icon') || lower.includes('integration')) {
    params.companyGroup = 'ICON';
  } else if (lower.includes('ulc') || lower.includes('canada')) {
    params.companyGroup = 'Linea Solutions ULC';
  }

  // Extract level
  if (lower.includes('principal')) params.level = 'Principal Consultant';
  else if (lower.includes('senior')) params.level = 'Senior Consultant';
  else if (lower.includes('associate')) params.level = 'Associate';

  // Extract practice
  if (lower.includes('pension')) params.practice = 'Pension';
  else if (lower.includes('insurance')) params.practice = 'Insurance';
  else if (lower.includes('workers comp') || lower.includes('workers\' comp') || lower.includes('wcb')) params.practice = 'Workers Compensation';
  else if (lower.includes('benefits')) params.practice = 'Benefits';
  else if (lower.includes('cyber')) params.practice = 'Cybersecurity';

  // Extract role family
  if (lower.includes('business analyst') || lower.includes(' ba ')) params.roleFamily = 'Business Analyst';
  else if (lower.includes('developer') || lower.includes('dev ')) params.roleFamily = 'Developer';
  else if (lower.includes('project manager') || lower.includes(' pm ')) params.roleFamily = 'Project Manager';
  else if (lower.includes('qa') || lower.includes('test')) params.roleFamily = 'QA/Test';
  else if (lower.includes('data analyst')) params.roleFamily = 'Data Analyst';

  // Extract skills - common tech keywords
  const skillKeywords = [
    'sql', 'python', 'tableau', 'power bi', 'powerbi', 'vitech', 'v3', 'sagitec',
    'neospin', 'ssis', 'ssrs', 'jira', 'azure', 'aws', 'salesforce', 'sap',
    'peoplesoft', 'guidewire', 'duck creek', 'crystal reports', 'cobol', 'java',
    '.net', 'c#', 'javascript', 'react', 'excel', 'sharepoint', 'dynamics',
    'oracle', 'postgresql', 'mongodb', 'docker', 'kubernetes', 'terraform',
    'penetration', 'pen test', 'pentest', 'vulnerability', 'siem', 'splunk',
    'nessus', 'burp suite', 'wireshark', 'kali',
  ];
  for (const skill of skillKeywords) {
    if (lower.includes(skill)) {
      params.skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }

  // Extract domain skills from the query
  const domainTerms = [
    'pension', 'insurance', 'workers comp', 'workers compensation', 'benefits',
    'actuarial', 'claims', 'underwriting', 'compliance', 'regulatory',
    'data migration', 'system implementation', 'testing', 'uat',
  ];
  for (const term of domainTerms) {
    if (lower.includes(term) && !params.skills.includes(term.charAt(0).toUpperCase() + term.slice(1))) {
      params.skills.push(term.charAt(0).toUpperCase() + term.slice(1));
    }
  }

  return JSON.stringify(params);
}

function mockChatbotResponse(userMessage: string, systemContext: string): string {
  const lower = userMessage.toLowerCase();

  // Greeting
  if (lower.match(/^(hi|hello|hey|howdy)/)) {
    if (systemContext.includes('Employee Profile')) {
      return "Hi! I see you're viewing an employee profile. How can I help? You can ask me about their skills, availability, or report any data issues you notice.";
    }
    if (systemContext.includes('search') || systemContext.includes('Search')) {
      return "Hi! I can help you with searching for staff. What are you looking for?";
    }
    return "Hi! I'm the Linea Assistant. I can help you navigate the app, find information, or collect your feedback. What's on your mind?";
  }

  // Bug report
  if (lower.includes('bug') || lower.includes('broken') || lower.includes('not working') || lower.includes('error')) {
    return "I'd like to help report this bug. Could you describe:\n1. What were you trying to do?\n2. What happened instead?\n3. How urgent is this? (High/Medium/Low)";
  }

  // Feature request
  if (lower.includes('feature') || lower.includes('would be nice') || lower.includes('should have') || lower.includes('wish')) {
    return "Great idea! To capture this feature request properly, could you tell me:\n1. What should this feature do?\n2. Who would benefit from it?\n3. How important is this to your workflow?";
  }

  // Data issue
  if (lower.includes('wrong data') || lower.includes('incorrect') || lower.includes('data issue') || lower.includes('outdated')) {
    return "I'll help report this data issue. Can you specify:\n1. Which data looks wrong?\n2. What should it be instead?\n3. Is this affecting your work right now?";
  }

  // Question about person
  if (lower.includes('skill') || lower.includes('experience') || lower.includes('available')) {
    return "I can see the details on this page. If you need help finding specific information or comparing with other employees, just let me know!";
  }

  // Submit/done
  if (lower.includes('submit') || lower.includes('done') || lower.includes('that\'s all') || lower.includes('send it')) {
    return "Got it! I'll submit this feedback now. Thank you for helping improve the app!";
  }

  // Default
  return "I'm here to help! You can:\n- Report a bug or data issue\n- Request a new feature\n- Ask questions about the data\n- Get help navigating the app\n\nWhat would you like to do?";
}

// ─── High-Level Functions ────────────────────────────────────────────

export async function extractSearchParams(query: string): Promise<ExtractedSearchParams> {
  const response = await chat([
    { role: 'system', content: SEARCH_EXTRACTION_PROMPT },
    { role: 'user', content: query },
  ]);

  try {
    // Try to parse JSON from the response
    const jsonStr = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    return {
      skills: parsed.skills || [],
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      minAvailability: parsed.minAvailability,
      location: parsed.location,
      companyGroup: parsed.companyGroup,
      level: parsed.level,
      practice: parsed.practice,
      roleFamily: parsed.roleFamily,
      rawQuery: query,
    };
  } catch (e) {
    console.error('Failed to parse LLM search response:', e);
    // Fallback: return just the raw query
    return { skills: [], rawQuery: query };
  }
}

export async function chatbotRespond(
  messages: LLMMessage[],
  pageContext: string
): Promise<LLMResponse> {
  const systemPrompt = CHATBOT_PAGE_CONTEXT_TEMPLATE(pageContext);
  const allMessages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages.filter(m => m.role !== 'system'),
  ];

  return chat(allMessages);
}

export async function extractFeedback(
  chatTranscript: LLMMessage[]
): Promise<ExtractedFeedback> {
  const transcriptText = chatTranscript
    .filter(m => m.role !== 'system')
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const response = await chat([
    { role: 'system', content: FEEDBACK_EXTRACTION_PROMPT },
    { role: 'user', content: transcriptText },
  ]);

  try {
    const jsonStr = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    // Fallback: basic extraction
    const lastUserMsg = [...chatTranscript].reverse().find(m => m.role === 'user')?.content || '';
    return {
      type: 'question',
      title: lastUserMsg.substring(0, 100),
      description: lastUserMsg,
      priority: 2,
    };
  }
}
