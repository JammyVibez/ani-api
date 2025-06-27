import axios from "axios";
import { Request, Response } from "express";
import * as cheerio from "cheerio";
import { retrieveServerId } from "../utils/method";
import { MegaCloud } from "../extractor/megacloud";
import { StreamSB } from "../extractor/streamsb";
import { StreamTape } from "../extractor/streamtape";

export const episodeSrcs = async (req: Request, res: Response) => {
  try {
    const { id, ep, category, server } = req.query;

    if (!id || !ep || !category || !server) {
      throw new Error("id, ep, category, and server query are required");
    }

    const animeURL = new URL(id as string, process.env.BASE_URL)?.href;

    const [episodeSrcsData, anilist_malId] = await Promise.all([
      scrapeAnimeEpisodeSources(
        `${id}?ep=${ep}`,
        server as string,
        category as string
      ),
      axios.get(animeURL, {
        headers: {
          Referer: process.env.BASE_URL,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
        },
      }),
    ]);

    const $ = cheerio.load(anilist_malId.data);

    let anilistID;
    let malID;

    try {
      anilistID = Number(
        JSON.parse($("body")?.find("#syncData")?.text())?.anilist_id
      );
      malID = Number(JSON.parse($("body")?.find("#syncData")?.text())?.mal_id);
    } catch (err) {
      anilistID = null;
      malID = null;
    }

    return res.status(200).json({ ...episodeSrcsData, anilistID, malID });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

async function scrapeAnimeEpisodeSources(
  episodeId: string,
  server: string,
  category?: string
) {
  if (episodeId.startsWith("http")) {
    const serverUrl = new URL(episodeId);
    switch (server) {
      case "HD-3":
      case "vidstreaming":
      case "vidcloud":
        return {
          ...(await new MegaCloud().extract3(serverUrl, String(category))),
        };
      case "streamsb":
        return {
          headers: {
            Referer: serverUrl.href,
            watchsb: "streamsb",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
          },
          sources: await StreamSB(serverUrl, true),
        };
      case "streamtape":
        return {
          headers: {
            Referer: serverUrl.href,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
          },
          sources: await StreamTape(serverUrl),
        };
    }
  }

  try {
    const resp = await axios.get(
      `${process.env.BASE_URL_AJAX}/episode/servers?episodeId=${episodeId.split("?ep=")[1]
      }`,
      {
        headers: {
          Referer: `${process.env.BASE_URL}/watch/${episodeId}`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );
    const $ = cheerio.load(resp.data.html);

    let serverId;

    switch (server) {
      case "HD-3":
        serverId = retrieveServerId($, 6, category);
        if (!serverId) throw new Error("HD-3 not found");
        break;
      case "vidstreaming":
        serverId = retrieveServerId($, 4, category);
        if (!serverId) throw new Error("Vidstreaming not found");
        break;
      case "vidcloud":
        serverId = retrieveServerId($, 1, category);
        if (!serverId) throw new Error("Vidcloud not found");
        break;
      case "streamsb": {
        serverId = retrieveServerId($, 5, category);
        if (!serverId) throw new Error("StreamSB not found");
        break;
      }
      case "streamtape": {
        serverId = retrieveServerId($, 3, category);
        if (!serverId) throw new Error("StreamTape not found");
        break;
      }
    }

    const [{ data: { link } }, { data: key }] = await Promise.all([
      axios.get(`${process.env.BASE_URL_AJAX}/episode/sources?id=${serverId}`),
      axios.get("https://key.hi-anime.site/")
    ]);

    return await scrapeAnimeEpisodeSources(link, server, key.key);
  } catch (error: any) {
    throw new Error(error.message);
  }
}
