import { Request, Response } from "express";
import * as cheerio from 'cheerio';
import axios from "axios";

type RelatedTypes = {
  id: string | null;
  img: string | null;
  name: string | null;
  jname: string | null;
  sub: number | null;
  dub: number | null;
  eps: number | null;
  type: string | null;
}

export const related = async (req: Request, res: Response) => {
  try {
    const { infoId } = req.params;
    const response = await axios.get(`${process.env.BASE_URL}/${infoId}`);
    const html = response.data;
    const $ = cheerio.load(html);
    
    const data: RelatedTypes[] = [];

    $("#main-sidebar section").each(function() {
      const title = $(this).find(".block_area-header .cat-heading").text();
      if(title === 'Related Anime') {
        $(this).find(".ulclear li").each(function() {
          data.push({
            id: $(this).find("a").attr("href")?.replace("/", "") || null,
            img: $(this).find("img").attr("data-src") || null,
            name: $(this).find(".film-detail .film-name a").text() || null,
            jname: $(this).find(".film-detail .film-name a").attr("data-jname") || null,
            sub: Number($(this).find(".tick-item.tick-sub").text()) || null,
            dub: Number($(this).find(".tick-item.tick-dub").text()) || null,
            eps: Number($(this).find(".tick-item.tick-eps").text()) || null,
            type: $(this).find(".tick").contents().filter(function() {
            return this.type === 'text'}).text().trim() || null,
          })
        })
      }
    })

    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
}