export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800');

  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/titkenan/cumakablo/main/channels.json'
    );
    
    if (!response.ok) {
      throw new Error('GitHub data alinamadi');
    }

    const data = await response.json();
    const format = req.query.format || 'json';

    if (format === 'm3u') {
      let m3u = '#EXTM3U\n\n';
      
      if (data.channels) {
        data.channels.forEach(ch => {
          m3u += `#EXTINF:-1 tvg-name="${ch.name}" group-title="Cuma Kablo",${ch.name}\n`;
          m3u += `${ch.url}\n\n`;
        });
      }

      res.setHeader('Content-Type', 'audio/x-mpegurl');
      return res.status(200).send(m3u);
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      total: data.channels?.length || 0,
      channels: data.channels || []
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
