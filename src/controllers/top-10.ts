import axios from "axios";
import { Request, Response } from "express";
import * as cheerio from "cheerio";

type Top10Types = {
  today: {
    id: string | undefined;
    img: string | undefined;
    rank: number;
    name: string;
    jname: string | undefined
    sub: number | null;
    dub: number | null;
    eps: number | null
  }[]
  week: {
      id: string | undefined;
    img: string | undefined;
    rank: number;
    name: string;
    jname: string | undefined
    sub: number | null;
    dub: number | null;
    eps: number | null
  }[]
  month: {
    id: string | undefined;
    img: string | undefined;
    rank: number;
    name: string;
    jname: string | undefined
    sub: number | null;
    dub: number | null;
    eps: number | null
  }[]
}

export const top10 = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${process.env.BASE_URL}/home`);
    const html = response.data;
    const $ = cheerio.load(html);

    const data: Top10Types = {
      today: [] as any,
      week: [] as any,
      month: [] as any,
    };

    $("#top-viewed-day ul li").each(function () {
      data.today.push({
        id: $(this).find("a").attr("href")?.replace("/", ""),
        img: $(this).find("img").attr("data-src"),
        rank: Number($(this).find(".film-number span").text()),
        name: $(this).find(".film-detail .film-name a").text().trim(),
        jname: $(this).find(".film-detail .film-name a").attr("data-jname"),
        sub: Number($(this).find(".film-detail .tick-item.tick-sub").text()) || null,
        dub: Number($(this).find(".film-detail .tick-item.tick-dub").text()) || null,
        eps: Number($(this).find(".film-detail .tick-item.tick-eps").text()) || null,
      });
    });

    $("#top-viewed-week ul li").each(function () {
      data.week.push({
        id: $(this).find("a").attr("href")?.replace("/", ""),
        img: $(this).find("img").attr("data-src"),
        rank: Number($(this).find(".film-number span").text()),
        name: $(this).find(".film-detail .film-name a").text().trim(),
        jname: $(this).find(".film-detail .film-name a").attr("data-jname"),
        sub: Number($(this).find(".film-detail .tick-item.tick-sub").text()) || null,
        dub: Number($(this).find(".film-detail .tick-item.tick-dub").text()) || null,
        eps: Number($(this).find(".film-detail .tick-item.tick-eps").text()) || null,
      });
    });

    $("#top-viewed-month ul li").each(function () {
      data.month.push({
        id: $(this).find("a").attr("href")?.replace("/", ""),
        img: $(this).find("img").attr("data-src"),
        rank: Number($(this).find(".film-number span").text()),
        name: $(this).find(".film-detail .film-name a").text().trim(),
        jname: $(this).find(".film-detail .film-name a").attr("data-jname"),
        sub: Number($(this).find(".film-detail .tick-item.tick-sub").text()) || null,
        dub: Number($(this).find(".film-detail .tick-item.tick-dub").text()) || null,
        eps: Number($(this).find(".film-detail .tick-item.tick-eps").text()) || null,
      });
    });

    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};
