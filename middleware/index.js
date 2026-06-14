export function initMw(app, middleware = []) {
  return middleware.reduceRight((next, Mw) => {
    const instance = typeof Mw === 'function' && Mw.prototype?.handle ? new Mw(next) : Mw(next);
    return (req) => instance.handle(req);
  }, app);
}
