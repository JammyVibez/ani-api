import axios from "axios";
import { Request, Response } from "express";
import * as cheerio from "cheerio";

type InfoType = {
  info: {
    img: string | null,
    name: string | null,
    jname: string | null,
    pg: string | null,
    quality: string | null,
    sub: number | null,
    dub: number | null,
    eps: number | null,
    type: string | null,
    duration: string | null
    description: string | null,
    anilistID: number | null
    malID: number | null
  }
  otherInfo: {
    japanese: string | null;
    synonyms: string | null;
    aired: string | null;
    premiered: string | null
    duration: string | null;
    status: string | null;
    malScore: string | null;
    genres: string[];
    studios: string | null;
    producers: string[]
  },
  charactersAndVoiceActors: {
    character: {
      id: string | null;
      img: string | null;
      name: string | null;
      cast: string | null;
    }[],
    voiceActor: {
      id: string | null;
      img: string | null;
      name: string | null;
      cast: string | null;
    }[]
  }[]
}

export const info = async (req: Request, res: Response) => {
  try {
    const { infoId } = req.params
    const response = await axios.get(`${process.env.BASE_URL}/${infoId}`);
    const html = response.data;
    const $ = cheerio.load(html);

    const data: InfoType = {
      info: {
        img: null,
        name: null,
        jname: null,
        pg: null,
        quality: null,
        sub: null,
        dub: null,
        eps: null,
        type: null,
        duration: null,
        description: null,
        anilistID: null,
        malID: null
      },
      otherInfo: {
        japanese: null,
        synonyms: null,
        aired: null,
        premiered: null,
        duration: null,
        status: null,
        malScore: null,
        genres: [],
        studios: null,
        producers: [],
      },
      charactersAndVoiceActors: [] 
    }

    const selector = $(".anis-content")

    // info data
     const stats: string[] = [];
    $(selector).find(".tick .item").each(function() {
      stats.push($(this).text())
    })

    data.info.img = $(selector).find(".anisc-poster .film-poster img").attr("src") || null;
    data.info.name = $(selector).find(".anisc-detail .film-name.dynamic-name").text() || null;
    data.info.jname = $(selector).find(".anisc-detail .film-name.dynamic-name").attr("data-jname") || null;
    data.info.pg = $(selector).find(".tick .tick-pg").text() || null;
    data.info.quality = $(selector).find(".tick .tick-quality").text() || null;
    data.info.sub = Number($(selector).find(".tick .tick-sub").text()) || null;
    data.info.dub = Number($(selector).find(".tick .tick-dub").text()) || null;
    data.info.eps = Number($(selector).find(".tick .tick-eps").text()) || null;
    data.info.type = stats[0] as string | null;
    data.info.duration = stats[1] as string | null;
    data.info.description = $(selector).find(".film-description .text").text().trim()
    data.info.anilistID = Number(JSON.parse($("body")?.find("#syncData")?.text())?.anilist_id);
    data.info.malID = Number(JSON.parse($("body")?.find("#syncData")?.text())?.mal_id);

    // other info data
    const selector2 = $(`${selector} .anisc-info-wrap`);
    $(selector2).find(".item-list a").each(function() {
      data.otherInfo.genres.push($(this).text().trim() || "?")
    })

    $(selector2).find(".item-title").each(function() {
      const label = $(this).find('.item-head').text().trim();

      if(label === "Japanese:") {
        data.otherInfo.japanese = $(this).find('.name').text().trim();
      }

      if(label === "Synonyms:") {
        data.otherInfo.synonyms = $(this).find('.name').text().trim() || "?";
      }

      if(label === 'Aired:') {
        data.otherInfo.aired = $(this).find('.name').text().trim() || "?";
      }

      if(label === "Premiered:") {
        data.otherInfo.premiered = $(this).find(".name").text().trim() || "?"; 
      }

      if(label === "Duration:") {
        data.otherInfo.duration = $(this).find(".name").text().trim() || "?";
      }

      if(label === 'Status:') {
        data.otherInfo.status = $(this).find(".name").text().trim() || "?";
      }

      if(label === "MAL Score:") {
        data.otherInfo.malScore = $(this).find(".name").text().trim() || "?";
      }

      if(label === "Studios:") {
        data.otherInfo.studios = $(this).find(".name").text().trim() || "?"
      }

      if(label === "Producers:") {
        $(this).find(".name").each(function() {
          data.otherInfo.producers .push($(this).text().trim())
        });
      }
    })

    // Characters and Voice Actors
    $("#main-content .block-actors-content div:nth-child(1) .bac-item").each(
      function () {
        data.charactersAndVoiceActors.push({
          character: [
            {
              id: $(this).find(".ltr a").attr("href")?.split("/")[2] || null,
              img: $(this).find(".ltr img").attr("data-src") || null,
              name: $(this).find(".ltr .pi-detail h4").text() || null,
              cast: $(this).find(".ltr .pi-detail span").text() || null,
            },
          ],
          voiceActor: [
            {
              id: $(this).find(".rtl a").attr("href")?.split("/")[2] || null,
              img: $(this).find(".rtl img").attr("data-src") || null,
              name: $(this).find(".rtl .pi-detail h4").text() || null,
              cast: $(this).find(".rtl .pi-detail span").text() || null,
            },
          ],
        });
      }
    );
  
    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
}