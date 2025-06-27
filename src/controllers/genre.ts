import axios from "axios";
import { Request, Response } from "express";
import * as cheerio from 'cheerio';

type GenreTypes = {
  id: string | undefined;
  img: string | undefined;
  name: string;
  jname: string | undefined;
  type: string;
  duration: string;
  sub: number | null;
  dub: number | null;
  eps: number | null;
  rate: string | null
}

export const genre = async (req: Request, res: Response) => {
  try {
    const { genre } = req.params
    const { page } = req.query
    const response = await axios.get(`${process.env.BASE_URL}/genre/${genre}?page=${page}`);
    const html = response.data;
    const $ = cheerio.load(html);

    const data: GenreTypes[] = [];

    $(".film_list-wrap .flw-item").each(function() {
      data.push({
        id: $(this).find("a").attr("href")?.replace("/", ""),
        img: $(this).find("img").attr("data-src"),
        name: $(this).find(".film-detail .film-name a").text(),
        jname: $(this).find(".film-detail .film-name a").attr("data-jname"),
        type: $(this).find(".fd-infor .fdi-item:nth-child(1)").text(),
        duration: $(this).find(".fd-infor .fdi-item.fdi-duration").text(),
        sub: Number($(this).find(".film-poster .tick.ltr .tick-sub").text()) || null,
        dub: Number($(this).find(".film-poster .tick.ltr .tick-dub").text()) || null,
        eps: Number($(this).find(".film-poster .tick.ltr .tick-eps").text()) || null,
        rate: $(this).find(".tick.tick-rate").text() || null
      })
    })

    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error.message)
    return res.status(500).json(error.message);
  }
}