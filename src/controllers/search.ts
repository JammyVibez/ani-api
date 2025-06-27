import axios from "axios";
import { Request, Response } from "express";
import * as cheerio from 'cheerio';

type SearchTypes = {
  currentPage: number;
  lastPage: number;
  results: {
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
  }[]
}

export const search = async (req: Request, res:Response) => {
  try {
    const query = req.query;
    const url = new URL(`${process.env.BASE_URL}/search`);
    const queries = Object.entries(query);
    queries.map(([key, value]) => url.searchParams.set(key, value as string));

    const response = await axios.get(url.href);
    const html = response.data;
    const $ = cheerio.load(html);
    
    const data: SearchTypes = {
      currentPage: Number(query.page) || 1,
      lastPage: 1,
      results: []
    };

    data.lastPage = parseInt($("[aria-label='Page navigation'] ul a")?.last()?.text()) || 
    parseInt($("[aria-label='Page navigation'] ul a")?.last().attr("href")?.split("&page=")?.[1] as string) || 1

    $(".film_list-wrap .flw-item").each(function() {
      data.results.push({
        id: $(this).find("a").attr("href")?.replace("/watch/", ""),
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

    return res.status(200).json(data)
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
}