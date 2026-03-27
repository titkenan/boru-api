export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const channelId = req.query.id;
    
    // Tek kanal stream istendiyse
    if (channelId) {
      const streamUrl = `https://boru-pc-tv.vercel.app/api/stream?id=${channelId}`;
      const response = await fetch(streamUrl);
      
      if (!response.ok) {
        throw new Error('Stream alinamadi');
      }
      
      const data = await response.json();
      return res.status(200).json(data);
    }

    // Kanal listesi için boru-pc-tv API'sine istek
    const boruResponse = await fetch('https://boru-pc-tv.vercel.app/api/channels');
    
    if (!boruResponse.ok) {
      throw new Error('Boru TV API ulasilamadi');
    }

    const channels = await boruResponse.json();
    const format = req.query.format || 'json';

    // M3U formatı
    if (format === 'm3u') {
      let m3u = '#EXTM3U\n\n';
      
      if (channels && Array.isArray(channels)) {
        channels.forEach((ch, index) => {
          const channelName = ch.name || `Kanal ${index + 1}`;
          const channelId = ch.id || ch.slug || index;
          const streamUrl = `https://boru-api.vercel.app/api/stream?id=${channelId}`;
          
          m3u += `#EXTINF:-1 tvg-name="${channelName}" tvg-id="${channelId}" group-title="Boru TV",${channelName}\n`;
          m3u += `${streamUrl}\n\n`;
        });
      }

      res.setHeader('Content-Type', 'audio/x-mpegurl');
      return res.status(200).send(m3u);
    }

    // JSON formatı
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      source: 'boru-pc-tv.vercel.app',
      total: channels.length,
      channels: channels.map((ch, index) => ({
        id: ch.id || ch.slug || index,
        name: ch.name,
        logo: ch.logo || '',
        stream: `https://boru-api.vercel.app/api/stream?id=${ch.id || ch.slug || index}`
      }))
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
