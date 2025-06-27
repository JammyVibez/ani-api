import axios from "axios";
import { Request, Response } from "express";

export const vttProxy = async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;

    if (!url) return res.status(400).json("url is required");

    if (!url.endsWith('.vtt')) {
      const response = await axios.get(url, { responseType: "stream" });
      const headers = Object.fromEntries(response.headers as any);
      res.set(headers);
      return response.data.pipe(res)
    }

    const proxyBaseUrl = `vtt-proxy?url=${url.split("/thumbnails.vtt")[0]}`;
    const response = await axios.get(url);
    const originalContent = response.data as string;
    const headers = Object.fromEntries(response.headers as any);
    const updatedContent = originalContent.split("\n").map((line) => {
      if (line.startsWith("sprite")) {
        return `${proxyBaseUrl}/${line}`
      }
      return line;
    }).join("\n");

    res.set(headers);
    return res.send(updatedContent);
  } catch (error: any) {
    console.log(error.message);
  }
}