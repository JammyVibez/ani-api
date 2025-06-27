import axios from "axios";
import { Request, Response } from "express";
import * as cheerio from 'cheerio';

type EstimatedScheduleTypes = {
  id: string | null;
  time: string | null;
  name: string | null;
  jname: string | null;
  episode: string | null;
}

export const estimatedSchedule = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const response = await axios.get(`${process.env.BASE_URL}/ajax/schedule/list?tzOffset=-480&date=${date}`, {
      headers: {
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "User-Agent": "Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    const html = response.data.html;
    const $ = cheerio.load(html);

    const data: EstimatedScheduleTypes[] = [];

    $("li").each(function() {
      data.push({
        id: $(this).find("a").attr("href")?.replace("/", "") || null,
        time: $(this).find(".time").text() || null,
        name: $(this).find(".film-name").text() || null,
        jname: $(this).find(".film-name").attr("data-jname") || null,
        episode: $(this).find(".btn-play").text().trim() || null,
      })
    })

    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
}