import axios from "axios";
import { Request, Response } from "express";
import * as cheerio from 'cheerio';

export const genres = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${process.env.BASE_URL}/home`);
    const html = response.data;
    const $ = cheerio.load(html);

    const data: { id: string | null, genre: string | null }[] = [];

    $("#main-sidebar .cbox-genres ul li").each(function() {
      data.push({
        id: $(this).find("a").attr("href")?.replace("/genre/", '') || null,
        genre: $(this).find("a").text() || null,
      })
    })

    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
}