// Dependency-free local preview server, used in browser tests and by contributors.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
createServer(async(req,res)=>{
  try{
    const url=new URL(req.url||'/', 'http://localhost');
    const file=resolve(root,'.'+decodeURIComponent(url.pathname==='/ '?'/index.html':url.pathname==='/'?'/index.html':url.pathname));
    if(!(file===root||file.startsWith(root+sep)))throw Error('Outside root');
    const info=await stat(file);
    if(!info.isFile())throw Error('Not a file');
    res.writeHead(200,{'Content-Type':types[extname(file)]||'text/plain; charset=utf-8','Cache-Control':'no-store'});
    res.end(await readFile(file));
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log('Notebook preview at http://127.0.0.1:'+port));
