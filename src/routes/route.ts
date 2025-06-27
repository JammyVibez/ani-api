import { Router } from "express";
import {
  spotlight,
  trending,
  top10,
  category,
  search,
  azList,
  info,
  recommended,
  episodes,
  seasons,
  related,
  genre,
  producer,
  episodeServer,
  episodeSrcs,
  genres,
  estimatedSchedule
} from '../controllers/index';
import { vttProxy, m3u8Proxy } from '../proxy/index';

export const router = Router();

// proxy endpoints ---->
router.get('/m3u8-proxy', m3u8Proxy);

router.get('/vtt-proxy', vttProxy);


// anime endpoints ---->
router.get("/spotlight", spotlight);

router.get("/trending", trending);

router.get("/top-10", top10);

router.get("/genres", genres);

router.get("/genre/:genre", genre);

router.get("/estimated-schedule", estimatedSchedule);

router.get("/producer/:producer", producer);

// ex: /episode-servers?episodeId=dandadan-19319&ep=128656
router.get("/episode-servers", episodeServer);

// ex: /episode-srcs?id=dandadan-19319&ep=128549&category=sub&server=vidstreaming
router.get("/episode-srcs", episodeSrcs);

// ex: /search?keyword=one%20piece
router.get("/search", search);

router.get("/:category", category);

router.get("/az-list/:letter", azList);

router.get("/info/:infoId", info);

router.get("/related/:infoId", related);

router.get("/recommended/:infoId", recommended);

router.get("/episodes/:infoId", episodes);

router.get("/seasons/:infoId", seasons);
