import axios from "axios";
import * as cheerio from "cheerio";
import { Request, Response } from "express";

type TrendingTypes = {
  id: string | undefined;
  img: string | undefined;
  rank: number;
  name: string;
  jname: string | undefined;
};

export const trending = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${process.env.BASE_URL}/home`);
    const html = response.data;
    const $ = cheerio.load(html);

    const data: TrendingTypes[] = [];

    $("#trending-home .swiper-slide .item").each(function () {
      data.push({
        id: $(this).find("a").attr("href")?.replace("/", ""),
        img: $(this).find("img").attr("data-src"),
        rank: Number($(this).find(".number span").text()),
        name: $(this).find(".number .film-title.dynamic-name").text(),
        jname: $(this)
          .find(".number .film-title.dynamic-name")
          .attr("data-jname"),
      });
    });

    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};
