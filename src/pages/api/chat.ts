// src/pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ reply: '❌ Missing OpenAI API Key' });
  }

  console.log("🔑 Loaded API key (first 10 chars):", process.env.OPENAI_API_KEY.slice(0, 10));

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: message },
        ],
      }),
    });

    const data = await openaiRes.json();

    if (data.error) {
      return res.status(500).json({ reply: `❌ OpenAI error: ${data.error.message}` });
    }

    const reply = data.choices?.[0]?.message?.content || 'No reply';
    res.status(200).json({ reply });
  } catch (error) {
    console.error('❌ Error calling OpenAI:', error);
    res.status(500).json({ reply: '❌ Error calling OpenAI' });
  }
}
