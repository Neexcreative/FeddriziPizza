import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';

const root=process.cwd();
const port=Number(process.env.PORT||3000);
const types={
  '.html':'text/html; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.webp':'image/webp',
  '.svg':'image/svg+xml'
};

createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const relative=normalize(pathname).replace(/^([/\\])+/, '')||'index.html';
    const filePath=join(root,relative);
    if(!filePath.startsWith(root)){response.writeHead(403).end('Forbidden');return}
    const info=await stat(filePath);
    const resolved=info.isDirectory()?join(filePath,'index.html'):filePath;
    const content=await readFile(resolved);
    response.writeHead(200,{'Content-Type':types[extname(resolved)]||'application/octet-stream','Cache-Control':'no-cache'});
    response.end(content);
  }catch{
    response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
    response.end('Not found');
  }
}).listen(port,'127.0.0.1',()=>console.log(`Forno available at http://127.0.0.1:${port}`));
