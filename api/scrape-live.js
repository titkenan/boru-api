import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  let browser;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // Boru-pc-tv sitesine git
    await page.goto('https://boru-pc-tv.vercel.app/', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // JavaScript'ten kanal listesini al
    const channels = await page.evaluate(() => {
      // window.channels veya başka bir global değişkende olabilir
      return window.channels || [];
    });

    await browser.close();

    const format = req.query.format || 'json';

    if (format === 'm3u') {
      let m3u = '#EXTM3U\n\n';
      
      channels.forEach(ch => {
        m3u += `#EXTINF:-1 tvg-name="${ch.name}",${ch.name}\n`;
        m3u += `${ch.url}\n\n`;
      });

      res.setHeader('Content-Type', 'audio/x-mpegurl');
      return res.status(200).send(m3u);
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      total: channels.length,
      channels: channels
    });

  } catch (error) {
    if (browser) await browser.close();
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
