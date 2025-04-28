import { OpenAI } from 'openai';
import axios from 'axios';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { imageBase64 } = req.body;

    // Upload image to Imgur
    const imgurResponse = await axios.post('https://api.imgur.com/3/image', {
      image: imageBase64,
      type: 'base64',
    }, {
      headers: {
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
      },
    });

    const imageUrl = imgurResponse.data.data.link;

    // Ask OpenAI for critique
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'You are an expert architecture critic. Critique this building design.' },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 1000,
    });

    res.status(200).json({ critique: response.choices[0].message.content });

  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ critique: null });
  }
}
