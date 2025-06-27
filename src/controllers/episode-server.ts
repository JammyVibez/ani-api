import axios from "axios";
import { Request, Response } from "express";
import * as cheerio from "cheerio";

type EpisodeServerType = {
  sub: {
    serverName: string;
    category: string;
    serverId: number | null;
  }[];
  dub: {
    serverName: string;
    category: string;
    serverId: number | null;
  }[];
  raw: {
    serverName: string;
    category: string;
    serverId: number | null;
  }[];
  episodeId: string;
  episodeNo: number | null;
  estimatedNextEpisode: Date | null
};

export const episodeServer = async (req: Request, res: Response) => {
  try {
    const { episodeId, ep } = req.query;
    const response = await axios.get(
      `${process.env.BASE_URL_AJAX}/episode/servers?episodeId=${ep}`,
      {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "User-Agent":
            "Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );
    const html = response.data.html;
    const $ = cheerio.load(html);

    const data: EpisodeServerType = {
      sub: [],
      dub: [],
      raw: [],
      episodeId: episodeId as string,
      episodeNo: 0,
      estimatedNextEpisode: null,
    };

    const epNoSelector = ".server-notice strong";
    data.episodeNo = Number($(epNoSelector).text().split(" ").pop()) || 0;

    function getServer(category: string) {
      $(`.ps_-block.ps_-block-sub.servers-${category} .ps__-list .server-item`).each(
        (_, el) => {
          const server = $(el).attr("data-server-id")

          switch (server) {
            case "6":
              data[category as "sub" | "dub" | "raw"].push({
                serverName: "HD-3",
                category,
                serverId: Number($(el)?.attr("data-server-id")?.trim()) || null,
              });
              break;
            case "4":
              data[category as "sub" | "dub" | "raw"].push({
                serverName: "vidstreaming",
                category,
                serverId: Number($(el)?.attr("data-server-id")?.trim()) || null,
              });
              break;
            case "1":
              data[category as "sub" | "dub" | 'raw'].push({
                serverName: "vidcloud",
                category,
                serverId: Number($(el)?.attr("data-server-id")?.trim()) || null,
              });
              break;
          }
        }
      );
    }

    getServer("sub");
    getServer("dub");
    getServer("raw");

    const estimatedScheduleResponse = await axios.get(`${process.env.BASE_URL}/watch/${episodeId}?ep=${ep}`);
    const $$ = cheerio.load(estimatedScheduleResponse.data);
    data.estimatedNextEpisode = new Date($$("#schedule-date").attr("data-value")?.replace(" ", "T") as string) || null;

    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};
