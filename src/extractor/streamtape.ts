import axios from 'axios';
import * as cheerio from "cheerio"

export async function StreamTape(videoUrl: URL) {
  const serverName = "StreamTape";
  const sources = [];

  try {
    const { data } = await axios.get(videoUrl.href).catch(() => {
      throw new Error("Video not found");
    });
    const $ = cheerio.load(data);

    let [fh, sh] = $.html()?.match(/robotlink'\).innerHTML = (.*)'/)
    ?.[1].split("+ ('") || [];

    sh = sh.substring(3);
    fh = fh.replace(/\'/g, "");

    const url = `https:${fh}${sh}`;

    sources.push({
      url: url,
      isM3U8: url.includes(".m3u8"),
    });

    return sources;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
