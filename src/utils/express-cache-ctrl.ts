import cache from 'express-cache-ctrl';

export const cacheCtrlConfig = cache.public(7200, {
  mustRevalidate: true
})