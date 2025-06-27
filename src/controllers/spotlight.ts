import { Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

type spotlightTypes = {
  id: string | undefined;
  img: string | undefined;
  rank: string;
  name: string;
  jname: string | undefined;
  srcDetail: string[];
  sub: number;
  dub: number;
  eps: number;
  description: string;
};

export const spotlight = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${process.env.BASE_URL}/home`);
    const html = response.data;
    const $ = cheerio.load(html);

    const data: spotlightTypes[] = [];

    $("#slider .deslide-item").each(function () {
      const srcDetail: string[] = [];
      $(this)
        .find(".sc-detail .scd-item")
        .each(function () {
          srcDetail.push($(this).text().trim());
        });

      data.push({
        id: $(this).find("a").attr("href")?.replace("/watch/", ""),
        img: $(this).find(".deslide-cover img").attr("data-src"),
        rank: $(this).find(".deslide-item-content .desi-sub-text").text(),
        name: $(this).find(".desi-head-title.dynamic-name").text(),
        jname: $(this).find(".desi-head-title.dynamic-name").attr("data-jname"),
        srcDetail: srcDetail.slice(0, 4),
        sub: Number($(this).find(".scd-item .tick .tick-item.tick-sub").text()),
        dub: Number($(this).find(".scd-item .tick .tick-item.tick-dub").text()),
        eps: Number($(this).find(".scd-item .tick .tick-item.tick-eps").text()),
        description: $(this).find(".desi-description").text().trim(),
      });
    });

    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error);
    return res.status(500).send(error.message);
  }
};
