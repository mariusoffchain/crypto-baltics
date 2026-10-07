export default { fetch(request, env) {
 const url = new URL(request.url);
 if (url.hostname === 'www.cryptobaltics.org' || (url.hostname === 'cryptobaltics.org' && url.protocol === 'http:')) {url.hostname='cryptobaltics.org';url.protocol='https:';return Response.redirect(url.href,301);}
 return env.ASSETS.fetch(request);
}};
