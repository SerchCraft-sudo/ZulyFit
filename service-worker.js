const CACHE="zulyfit-v4";
const ASSETS=["./","./index.html","./style.css","./app.js","./trainer3d.js","./manifest.json","./icon.svg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("zulyfit-")&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})()));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return response}).catch(()=>caches.match("./index.html"))))});
