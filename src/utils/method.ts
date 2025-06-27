import { CheerioAPI } from "cheerio";

export function retrieveServerId($: CheerioAPI, serverId: number, category: string | undefined) {
  return (
    $(`.ps_-block.ps_-block-sub.servers-${category} > .ps__-list .server-item`)
      ?.map((_, el) =>
        $(el).attr("data-server-id") == `${serverId}` ? $(el) : null
      )
      ?.get()[0]
      ?.attr("data-id") || null
  );
}
