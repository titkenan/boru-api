import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800');

  try {
    // Boru-pc-tv HTML'ini çek
    const response = await fetch('https://boru-pc-tv.vercel.app/');
    const html = await response.text();
    
    // JavaScript kodunu parse et
    const scriptMatch = html.match(/const\s+channels\s*=\s*(\[[\s\S]*?\]);/);
    
    if (!scriptMatch) {
      throw new Error('Kanal listesi bulunamadi');
    }
    
    // JSON'a çevir
    const channelsData = eval(scriptMatch[1]);
    
    const format = req.query.format || 'json';

    // M3U formatı
    if (format === 'm3u') {
      let m3u = '#EXTM3U\n\n';
      
      channelsData.forEach(ch => {
        m3u += `#EXTINF:-1 tvg-name="${ch.name}" group-title="Boru TV",${ch.name}\n`;
        m3u += `${ch.url}\n\n`;
      });

      res.setHeader('Content-Type', 'audio/x-mpegurl');
      return res.status(200).send(m3u);
    }

    // JSON formatı
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      total: channelsData.length,
      channels: channelsData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
