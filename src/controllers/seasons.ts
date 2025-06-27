import axios from "axios";
import { Request, Response } from "express";
import * as cheerio from "cheerio";

type SeasonsTypes = {
  id: string | null;
  img: string | null;
  title: string | null;
  otherTitle: string | null;
}

export const seasons = async (req: Request, res: Response) => {
  try {
    const { infoId } = req.params;
    const response = await axios.get(`${process.env.BASE_URL}/${infoId}`);
    const html = response.data;
    const $ = cheerio.load(html);
    
    const data: SeasonsTypes[] = [];

    $("#main-content .os-list a").each(function() {
      data.push({
        id: $(this).attr("href")?.replace("/", "") || null,
        img: $(this).find(".season-poster").attr("style")?.split("(")[1].replace(");", "").replace("100x200", '500x500') || null,
        title: $(this).find(".title").text() || null,
        otherTitle: $(this).attr("title") || null
      })
    })

    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
}