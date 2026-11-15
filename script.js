(() => {
const menuButton=document.querySelector(".menu-toggle"),nav=document.querySelector(".nav");
menuButton?.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));menuButton.textContent=open?"×":"☰";});
nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menuButton?.setAttribute("aria-expanded","false");if(menuButton)menuButton.textContent="☰";}));
document.getElementById("year").textContent=new Date().getFullYear();

const canvas=document.getElementById("game"),ctx=canvas?.getContext("2d");
if(ctx){
const W=960,H=500,worldW=2500,gravity=.58;
let camera=0,frame=0,score=0,started=false,won=false,particles=[],last=0;
const keys={left:false,right:false};
const player={x:70,y:350,vx:0,vy:0,w:34,h:58,ground:false,face:1};
const platforms=[{x:0,y:422,w:570},{x:650,y:370,w:170},{x:900,y:320,w:170},{x:1150,y:385,w:190},{x:1440,y:335,w:180},{x:1710,y:390,w:180},{x:1980,y:330,w:190},{x:2260,y:420,w:240}];
const memoryXs=[260,490,710,980,1240,1510,1780,2070];
let memories=[];
const reset=()=>{player.x=70;player.y=350;player.vx=player.vy=0;camera=0;score=0;frame=0;won=false;started=false;particles=[];memories=memoryXs.map((x,i)=>({x,y:[365,320,315,270,330,285,335,370][i],got:false,phase:i*.8}));document.getElementById("score").textContent="0 / 8";document.getElementById("game-message").textContent="Preparados para a aventura?";document.getElementById("game-overlay").classList.remove("hidden");};
const round=(x,y,w,h,r,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
const heart=(x,y,s,color)=>{ctx.save();ctx.translate(x,y);ctx.scale(s/20,s/20);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,8);ctx.bezierCurveTo(-23,-8,-13,-21,0,-10);ctx.bezierCurveTo(13,-21,23,-8,0,8);ctx.fill();ctx.restore();};
function cloud(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle="#fff8e9d9";ctx.beginPath();ctx.arc(0,7,17,0,Math.PI*2);ctx.arc(22,-2,23,0,Math.PI*2);ctx.arc(48,8,16,0,Math.PI*2);ctx.fill();ctx.fillRect(-5,5,58,18);ctx.restore();}
function tree(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle="#715e49";ctx.fillRect(-5,-5,10,45);for(let i=0;i<3;i++){ctx.fillStyle=["#557a62","#668a6d","#789777"][i];ctx.beginPath();ctx.moveTo(0,-90+i*24);ctx.lineTo(-31,-27+i*24);ctx.lineTo(31,-27+i*24);ctx.closePath();ctx.fill();}ctx.restore();}
function drawBackground(){const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#9fc1bd");sky.addColorStop(.58,"#d5d8bd");sky.addColorStop(1,"#e9cda7");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
ctx.fillStyle="#f5dfad";ctx.beginPath();ctx.arc(790,88,42,0,7);ctx.fill();ctx.fillStyle="#f5dfad33";ctx.beginPath();ctx.arc(790,88,62,0,7);ctx.fill();
for(let i=0;i<7;i++)cloud((i*190-frame*.22)%(W+150)-70,65+(i%3)*42,.7+(i%2)*.2);
ctx.save();ctx.translate(-camera*.22,0);ctx.fillStyle="#91ad9d";ctx.beginPath();ctx.moveTo(0,340);for(let x=0;x<=worldW+400;x+=180)ctx.quadraticCurveTo(x+90,180+Math.sin(x)*20,x+180,340);ctx.lineTo(worldW+400,H);ctx.lineTo(0,H);ctx.fill();ctx.restore();
ctx.save();ctx.translate(-camera*.48,0);ctx.fillStyle="#75977e";ctx.beginPath();ctx.moveTo(0,385);for(let x=0;x<=worldW+400;x+=220)ctx.quadraticCurveTo(x+110,270+Math.sin(x*.02)*25,x+220,385);ctx.lineTo(worldW+400,H);ctx.lineTo(0,H);ctx.fill();for(let x=110;x<worldW+200;x+=235)tree(x,394,.65+(x%3)*.08);ctx.restore();}
function drawCastle(x){ctx.save();ctx.translate(x,0);ctx.fillStyle="#e9d7b8";ctx.fillRect(0,278,145,145);ctx.fillRect(-20,245,48,178);ctx.fillRect(117,230,48,193);ctx.fillStyle="#a96f68";for(const [tx,ty] of [[-24,245],[113,230],[35,278]]){ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+28,ty-42);ctx.lineTo(tx+56,ty);ctx.fill();}ctx.fillStyle="#b78966";ctx.fillRect(57,355,32,68);ctx.fillStyle="#78958a";for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(17+i*55,320,10,Math.PI,0);ctx.fill();ctx.fillRect(7+i*55,320,20,19);}ctx.fillStyle="#f4e8d1";ctx.fillRect(67,285,10,26);ctx.fillStyle="#c88a79";ctx.beginPath();ctx.moveTo(75,260);ctx.lineTo(115,271);ctx.lineTo(75,281);ctx.fill();ctx.restore();}
function drawPlatforms(){platforms.forEach((p,i)=>{round(p.x,p.y,p.w,80,8,i===0?"#547b61":"#a6a978");round(p.x,p.y,p.w,12,5,i===0?"#9db17e":"#c8c797");ctx.fillStyle="#68875e";for(let x=p.x+15;x<p.x+p.w-8;x+=27){ctx.beginPath();ctx.moveTo(x,p.y+3);ctx.lineTo(x-4,p.y-5);ctx.lineTo(x+3,p.y+2);ctx.fill();}});}
function drawMemory(m){if(m.got)return;const bob=Math.sin(frame*.07+m.phase)*5;ctx.save();ctx.translate(m.x,m.y+bob);ctx.fillStyle="#fff5d766";ctx.beginPath();ctx.arc(0,0,23,0,7);ctx.fill();heart(0,0,23,"#c77f7b");ctx.restore();}
function drawPlayer(){const x=player.x,y=player.y,run=Math.abs(player.vx)>.2&&!player.ground?frame*.4:Math.sin(frame*.22)*2;ctx.save();ctx.translate(x+17,y);if(player.face<0){ctx.translate(34,0);ctx.scale(-1,1);} // shadow
ctx.fillStyle="#344c3c44";ctx.beginPath();ctx.ellipse(17,60,17,4,0,0,7);ctx.fill();
ctx.fillStyle="#3b4a3c";ctx.fillRect(7,39,8,18+Math.max(0,run));ctx.fillRect(20,39,8,18-Math.max(0,run));ctx.fillStyle="#493b31";ctx.fillRect(5,54,12,5);ctx.fillRect(19,54,12,5);
// body / outfit
ctx.fillStyle="#f1e6d2";ctx.beginPath();ctx.moveTo(8,22);ctx.lineTo(26,22);ctx.lineTo(32,47);ctx.lineTo(2,47);ctx.closePath();ctx.fill();ctx.fillStyle="#b47b72";ctx.fillRect(15,24,5,20);ctx.fillStyle="#d5b77f";ctx.fillRect(16,29,3,3);
// head and hair
ctx.fillStyle="#dca982";ctx.beginPath();ctx.arc(17,13,12,0,7);ctx.fill();ctx.fillStyle="#49372f";ctx.beginPath();ctx.arc(17,9,12,Math.PI,Math.PI*2);ctx.lineTo(28,16);ctx.quadraticCurveTo(20,11,10,17);ctx.fill();ctx.fillStyle="#293b31";ctx.fillRect(21,13,2,2);
ctx.fillStyle="#f3e6ce";ctx.fillRect(5,26,5,14);ctx.fillRect(26,26,5,14);ctx.restore();}
function draw(){drawBackground();ctx.save();ctx.translate(-camera,0);drawPlatforms();drawCastle(2320);memories.forEach(drawMemory);drawPlayer();ctx.restore();
// foreground tiny blossoms
ctx.save();ctx.translate(-camera*.8,0);for(let x=25;x<worldW;x+=75){ctx.fillStyle="#f5e9d3";ctx.beginPath();ctx.arc(x,420,3,0,7);ctx.fill();ctx.fillStyle="#d28e83";ctx.beginPath();ctx.arc(x+5,426,2,0,7);ctx.fill();}ctx.restore();
particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/35);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-camera,p.y,p.r,0,7);ctx.fill();ctx.globalAlpha=1;});
round(17,15,140,34,8,"#fff9ebdf");ctx.fillStyle="#3b5848";ctx.font="bold 12px DM Sans";ctx.fillText("♡  "+score+" / 8",31,37);
if(won){ctx.fillStyle="#18352c99";ctx.fillRect(0,0,W,H);ctx.textAlign="center";ctx.fillStyle="#fff7e9";ctx.font="500 37px Playfair Display";ctx.fillText("E viveram uma grande aventura.",W/2,225);ctx.font="14px DM Sans";ctx.fillText("Todas as memórias encontradas. ♥",W/2,258);ctx.textAlign="left";}}
function burst(x,y){for(let i=0;i<14;i++)particles.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.7)*5,life:35,r:2+Math.random()*3,color:["#f2d69c","#c77f7b","#fff2d5"][i%3]});}
function update(){frame++;if(started&&!won){player.vx=(keys.left?-3.7:0)+(keys.right?3.7:0);if(player.vx)player.face=Math.sign(player.vx);player.x=Math.max(0,Math.min(worldW-player.w,player.x+player.vx));const old=player.y+player.h;player.vy=Math.min(12,player.vy+gravity);player.y+=player.vy;player.ground=false;platforms.forEach(p=>{if(player.x+player.w>p.x&&player.x<p.x+p.w&&old<=p.y+7&&player.y+player.h>=p.y&&player.vy>=0){player.y=p.y-player.h;player.vy=0;player.ground=true;}});if(player.y>H+100){player.x=Math.max(35,player.x-110);player.y=270;player.vy=0;}
memories.forEach(m=>{if(!m.got&&Math.abs(player.x+17-m.x)<25&&Math.abs(player.y+25-m.y)<34){m.got=true;score++;burst(m.x,m.y);document.getElementById("score").textContent=score+" / 8";document.getElementById("game-message").textContent=score===8?"Todas as memórias reunidas! Encontrem o castelo.":"Uma memória preciosa encontrada!";}});
if(player.x>2260&&score===8){won=true;document.getElementById("game-message").textContent="Conseguiram! O vosso final feliz.";}}
camera=Math.max(0,Math.min(worldW-W,player.x-W*.35));particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.life--;});particles=particles.filter(p=>p.life>0);draw();requestAnimationFrame(update);}
function jump(){if(started&&player.ground&&!won){player.vy=-12.5;player.ground=false;}}
document.getElementById("start-game").addEventListener("click",()=>{started=true;document.getElementById("game-overlay").classList.add("hidden");document.getElementById("game-message").textContent="Recolham as 8 memórias e cheguem ao castelo!";});
window.addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight","ArrowUp"," ","a","d","A","D","w","W"].includes(e.key))e.preventDefault();if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.left=true;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.right=true;if(e.key==="ArrowUp"||e.key===" "||e.key.toLowerCase()==="w")jump();});
window.addEventListener("keyup",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.left=false;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.right=false;});
document.querySelectorAll(".mobile-controls button").forEach(btn=>{const k=btn.dataset.key;const down=e=>{e.preventDefault();if(k==="jump")jump();else keys[k]=true;};const up=e=>{e.preventDefault();if(k!=="jump")keys[k]=false;};btn.addEventListener("pointerdown",down);btn.addEventListener("pointerup",up);btn.addEventListener("pointerleave",up);btn.addEventListener("pointercancel",up);});
document.getElementById("reset-game").addEventListener("click",reset);reset();requestAnimationFrame(update);
}
const form=document.getElementById("couple-form"),result=document.getElementById("form-result");
form?.addEventListener("submit",async e=>{e.preventDefault();if(!form.reportValidity())return;const labels={names:"Nomes",date:"Data do casamento",email:"E-mail",meet:"Como se conheceram",memories:"Memórias especiais",style:"Estilo visual",places:"Lugares e cenários",characters:"Personagens",challenges:"Desafios e referências",music:"Música e mensagem"};const data=new FormData(form),lines=["WEDDING ADVENTURE — RESUMO INICIAL",""];Object.entries(labels).forEach(([k,l])=>{const v=String(data.get(k)||"").trim();if(v)lines.push(l+": "+v);});const summary=lines.join("\n");result.hidden=false;result.innerHTML="<strong>O vosso resumo está pronto!</strong><br>Copiem o texto para o guardar ou partilhar connosco.";const pre=document.createElement("pre");pre.textContent=summary;pre.style.cssText="white-space:pre-wrap;font:10px/1.7 DM Sans,sans-serif;background:#fff;padding:12px;max-height:220px;overflow:auto";const copy=document.createElement("button");copy.type="button";copy.textContent="Copiar respostas";copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(summary);copy.textContent="Copiado ✓";}catch(_){const a=document.createElement("textarea");a.value=summary;result.appendChild(a);a.select();document.execCommand("copy");a.remove();copy.textContent="Copiado ✓";}});result.append(pre,copy);result.scrollIntoView({behavior:"smooth",block:"nearest"});});
})();