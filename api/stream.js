export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const channelId = req.query.id;
    
    if (!channelId) {
      return res.status(400).json({ error: 'Kanal ID gerekli' });
    }

    // Boru-PC-TV API'sinden CANLI stream al
    const response = await fetch(
      `https://boru-pc-tv.vercel.app/api/stream?id=${channelId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://boru-pc-tv.vercel.app/'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Boru TV stream alinamadi: ${response.status}`);
    }

    const data = await response.json();
    
    // M3U8 URL'i döndür
    if (data.url) {
      return res.status(200).json({
        success: true,
        url: data.url,
        expires: data.expires || 'unknown'
      });
    }

    throw new Error('Stream URL bulunamadi');

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
