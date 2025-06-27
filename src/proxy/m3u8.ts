import axios from "axios";
import { Request, Response } from "express";
import { allowedExtensions, LineTransform } from "../utils/line-transform";

export const m3u8Proxy = async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url) return res.status(400).json("url is required");

    const isDirectFile = allowedExtensions.some(ext => url.endsWith(ext));
    const baseUrl = url.replace(/[^/]+$/, "");

    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        Accept: "*/*",
        Referer: "https://megacloud.club/",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    const headers = { ...response.headers };
    if (!isDirectFile) delete headers['content-length'];
    headers['access-control-allow-origin'] = '*';
    headers['access-control-allow-methods'] = '*';
    headers['access-control-allow-headers'] = '*';
    headers['access-control-allow-credentials'] = '*'
    res.set(headers);

    if (isDirectFile) {
      return response.data.pipe(res);
    }

    if (!url.endsWith(".m3u8")) {
      return response.data.pipe(res);
    }

    const transform = new LineTransform(baseUrl);
    response.data.pipe(transform).pipe(res);
  } catch (error: any) {
    res.status(500).json(error.message)
  }
}