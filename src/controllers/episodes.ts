import axios from "axios";
import { Request, Response } from "express";
import * as cheerio from "cheerio";

type EpisodesTypes = {
  totalEpisodes: number;
  episodes: {
    title: string | null;
    jtitle: string | null;
    episodeId: string | null
    number: number | null
    isFiller: boolean | null
  }[]
}

export const episodes = async (req: Request, res: Response) => {
  try {
    const { infoId } = req.params
    const splitId = infoId.split("-").pop();
    const response = await axios.get(`${process.env.BASE_URL_AJAX}/episode/list/${splitId}`, {
      headers: {
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "User-Agent": "Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    const html = response.data.html;
    const $ = cheerio.load(html);

    const data: EpisodesTypes = {
      totalEpisodes: 0,
      episodes: [],
    };

    data.totalEpisodes = Number($(".detail-infor-content .ss-list a").length);

    $(".detail-infor-content .ss-list a").each((i, el) => {
      data.episodes.push({
        title: $(el)?.attr("title")?.trim() || null,
        jtitle: $(el)?.find(".ssli-detail .ep-name").attr("data-jname") || null,
        episodeId: $(el)?.attr("href")?.split("/")?.pop() || null,
        number: Number($(el).attr("data-number")),
        isFiller: $(el).hasClass("ssl-item-filler"),
      });
    });
    
    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
}