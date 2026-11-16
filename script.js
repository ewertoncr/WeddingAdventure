(()=>{
"use strict";
const $=s=>document.querySelector(s);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const canvas=$("#game"),ctx=canvas&&canvas.getContext("2d"),preview=$("#hero-game-preview"),pctx=preview&&preview.getContext("2d");
if(!canvas||!ctx)return;
const W=1280,H=720,G=610,LEVEL=9600,GRAV=.82;
canvas.width=W;canvas.height=H;
if(preview){preview.width=W;preview.height=H;}
ctx.imageSmoothingEnabled=true;
if(pctx)pctx.imageSmoothingEnabled=true;
if($("#year"))$("#year").textContent=new Date().getFullYear();

const nav=$(".nav"),menu=$(".menu-toggle");
if(menu&&nav)menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));});

const platforms=[
{x:0,y:610,w:700},{x:790,y:565,w:520},{x:1400,y:610,w:620},{x:2140,y:525,w:250},
{x:2530,y:470,w:270},{x:3030,y:610,w:390},{x:3610,y:560,w:430},{x:4210,y:610,w:610},
{x:4930,y:530,w:270},{x:5350,y:610,w:650},{x:6100,y:520,w:300},{x:6500,y:610,w:620},
{x:7250,y:560,w:350},{x:7770,y:610,w:680},{x:8500,y:530,w:310},{x:8910,y:610,w:690}
];
const memories=[
{x:460,y:535},{x:930,y:495},{x:1650,y:555},{x:2250,y:460},{x:2630,y:405},{x:3150,y:555},
{x:3820,y:505},{x:4450,y:555},{x:5050,y:465},{x:6220,y:455},{x:7390,y:495},{x:8050,y:555}
];
const crystals=[{x:2200,active:false},{x:3100,active:false}];
const enemies=[
{x:1120,y:525,w:48,h:55,v:0,dir:1,alive:true},
{x:1700,y:555,w:48,h:55,v:0,dir:-1,alive:true},
{x:3790,y:505,w:48,h:55,v:0,dir:1,alive:true},
{x:5200,y:555,w:48,h:55,v:0,dir:-1,alive:true},
{x:6880,y:555,w:48,h:55,v:0,dir:1,alive:true},
{x:8020,y:555,w:48,h:55,v:0,dir:-1,alive:true}
];
const p={x:110,y:540,vx:0,vy:0,face:1,onGround:false,coyote:0,buffer:0,inv:0,attack:0};
const bride={x:55,y:540,vx:0,vy:0,face:1,onGround:false};
let camera=0,time=0,playing=false,finished=false,score=0,lives=3,checkpoint=110,bridgeOpen=false,interact=false,last=0,previewTime=0;
const keys={left:false,right:false,interact:false};
const overlay=$("#game-overlay"),scoreNode=$("#score"),levelNode=$("#level-name"),lifeNode=$(".game-lives"),message=$("#game-message");

function say(t){if(message)message.textContent=t;}
function rounded(c,x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,"rgba(255,255,255,0)");c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
function heart(c,x,y,s=1,fill="#ef4779"){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=fill;c.beginPath();c.moveTo(0,16);c.bezierCurveTo(-34,-10,-25,-30,-8,-27);c.bezierCurveTo(-1,-26,3,-19,5,-13);c.bezierCurveTo(17,-36,41,-16,27,6);c.lineTo(5,31);c.closePath();c.fill();c.restore();}
function cloud(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle="rgba(255,255,255,.72)";c.beginPath();c.arc(0,12,25,0,Math.PI*2);c.arc(27,4,33,0,Math.PI*2);c.arc(60,13,23,0,Math.PI*2);c.roundRect(-18,12,100,27,15);c.fill();c.restore();}
function tree(c,x,y,s=1,front=false){
 c.save();c.translate(x,y);c.scale(s,s);
 c.fillStyle=front?"#5b3d34":"#67473a";c.fillRect(-9,0,18,88);
 c.fillStyle=front?"#274d43":"#3f6d58";c.beginPath();c.arc(0,-8,43,0,Math.PI*2);c.arc(-25,16,31,0,Math.PI*2);c.arc(26,18,32,0,Math.PI*2);c.fill();
 c.fillStyle=front?"#3d755d":"#6b9671";c.beginPath();c.arc(-14,-18,19,0,Math.PI*2);c.arc(18,-8,18,0,Math.PI*2);c.fill();
 c.restore();
}
function castle(c,x,y,s=1){
 c.save();c.translate(x,y);c.scale(s,s);
 c.fillStyle="#f3dfc2";c.strokeStyle="#b98f78";c.lineWidth=4;
 c.fillRect(-110,0,220,125);c.strokeRect(-110,0,220,125);
 const towers=[-112,-52,54,112];
 towers.forEach((tx,i)=>{const h=i%2?145:185;c.fillRect(tx-22,125-h,44,h);c.strokeRect(tx-22,125-h,44,h);c.fillStyle="#8d526c";c.beginPath();c.moveTo(tx-29,125-h);c.lineTo(tx,125-h-45);c.lineTo(tx+29,125-h);c.closePath();c.fill();c.fillStyle="#f3dfc2";});
 c.fillStyle="#7a5660";c.beginPath();c.roundRect(-25,65,50,60,24);c.fill();
 c.fillStyle="#ffe08a";c.fillRect(-8,88,16,22);
 c.restore();
}
function drawBackground(c,cam,tm){
 const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#69b8f4");sky.addColorStop(.52,"#bfe7f4");sky.addColorStop(1,"#ffd9b1");c.fillStyle=sky;c.fillRect(0,0,W,H);
 glow(c,W*.78,105,75,"rgba(255,239,173,.55)");
 for(let i=0;i<7;i++)cloud(c,(i*250-(cam*.10)%250)-80,95+(i%3)*72,.72+(i%2)*.18);
 c.fillStyle="#7898b5";c.beginPath();c.moveTo(0,370);for(let x=0;x<=W;x+=90)c.lineTo(x,310+Math.sin((x+cam*.05)*.008)*55);c.lineTo(W,H);c.lineTo(0,H);c.closePath();c.fill();
 c.fillStyle="#5d8b83";c.beginPath();c.moveTo(0,455);for(let x=0;x<=W;x+=110)c.lineTo(x,400+Math.sin((x+cam*.09)*.006)*65);c.lineTo(W,H);c.lineTo(0,H);c.closePath();c.fill();
 const cx=9700-cam;if(cx>-400&&cx<W+400)castle(c,cx,445,1.2);
 for(let i=0;i<26;i++){const x=(i*187-(cam*.28)%187)-80,y=405+(i*71)%170;tree(c,x,y,0.55+(i%4)*.08,false);}
 const mist=c.createLinearGradient(0,360,0,H);mist.addColorStop(0,"rgba(255,255,255,0)");mist.addColorStop(1,"rgba(255,245,224,.22)");c.fillStyle=mist;c.fillRect(0,360,W,H-360);
}
function drawPlatforms(c,cam,tm){
 platforms.forEach((q,i)=>{
  const x=q.x-cam;if(x+q.w<0||x>W)return;
  const depth=q.y<600?65:92;
  rounded(c,x,q.y,q.w,depth,7,"#5f5149");
  c.fillStyle="#9c7c5e";c.fillRect(x,q.y+11,q.w,depth-11);
  c.fillStyle="#416d55";c.fillRect(x,q.y,q.w,15);
  c.fillStyle="#78a16c";c.fillRect(x,q.y,q.w,6);
  for(let n=24;n<q.w-20;n+=52){c.fillStyle=i%2?"#8b6e55":"#ad8b68";c.fillRect(x+n,q.y+33,24,5);c.fillRect(x+n+12,q.y+58,15,4);}
  for(let n=15;n<q.w;n+=65){c.fillStyle="#d7e09a";c.fillRect(x+n,q.y-5,3,8);c.fillRect(x+n+5,q.y-2,2,5);}
 });
 if(bridgeOpen){
  const x=3290-cam,y=605,w=330;
  c.fillStyle="#7a543e";c.fillRect(x,y,w,18);c.fillStyle="#c18c5b";c.fillRect(x,y-7,w,8);
  for(let n=20;n<w;n+=45){c.fillStyle="#4f3a35";c.fillRect(x+n,y-5,8,30);}
  glow(c,x+w/2,y+10,80,"rgba(255,220,129,.18)");
 }
}
function drawCrystal(c,cam,cr,tm){
 const x=cr.x-cam;if(x<-80||x>W+80)return;
 const active=cr.active;glow(c,x,cr.active?430:445,active?75:45,active?"rgba(255,110,172,.45)":"rgba(119,214,255,.32)");
 c.save();c.translate(x,445);
 c.rotate(Math.sin(tm*.03)*.08);c.fillStyle=active?"#ff6fba":"#79d9ff";c.strokeStyle="#fff";c.lineWidth=3;
 c.beginPath();c.moveTo(0,-42);c.lineTo(24,-8);c.lineTo(10,35);c.lineTo(-16,24);c.lineTo(-24,-10);c.closePath();c.fill();c.stroke();
 c.fillStyle="rgba(255,255,255,.6)";c.beginPath();c.moveTo(0,-30);c.lineTo(8,-8);c.lineTo(0,5);c.closePath();c.fill();c.restore();
 c.fillStyle="#fff";c.font="700 11px DM Sans,sans-serif";c.textAlign="center";c.fillText(active?"ATIVADO":"E  ATIVAR",x,485);c.textAlign="left";
}
function drawMemory(c,cam,m,tm){
 const x=m.x-cam,y=m.y+Math.sin(tm*.045+m.x)*9;if(x<-40||x>W+40)return;
 glow(c,x,y,38,"rgba(255,228,151,.42)");heart(c,x,y,.43,"#ff7a9e");
 c.fillStyle="#fff4b2";c.beginPath();c.arc(x,y-4,3,0,Math.PI*2);c.fill();
}
function drawEnemy(c,cam,e,tm){
 if(!e.alive)return;const x=e.x-cam;if(x<-80||x>W+80)return;
 c.save();c.translate(x,e.y+8);c.scale(e.dir,1);
 c.fillStyle="#4a3952";c.beginPath();c.ellipse(0,27,24,29,0,0,Math.PI*2);c.fill();
 c.fillStyle="#7d557f";c.beginPath();c.arc(0,3,20,0,Math.PI*2);c.fill();
 c.fillStyle="#f4dcae";c.beginPath();c.arc(-7,2,4,0,Math.PI*2);c.arc(7,2,4,0,Math.PI*2);c.fill();
 c.fillStyle="#2b2535";c.fillRect(-11,18,22,5);c.fillStyle="#ffb3cc";c.fillRect(-4,19,8,2);
 c.strokeStyle="#3b2d45";c.lineWidth=6;c.beginPath();c.moveTo(-12,47);c.lineTo(-19,61);c.moveTo(12,47);c.lineTo(19,61);c.stroke();c.restore();
}
function drawHero(c,x,y,face,tm,brideMode=false){
 c.save();c.translate(x,y);c.scale(face,1);
 const run=playing&&Math.abs(brideMode?bride.vx:p.vx)>.6;
 const bob=run?Math.sin(tm*.22)*3:Math.sin(tm*.07)*1.5;
 c.translate(0,bob);
 if(brideMode){
  c.strokeStyle="#5b3a31";c.lineWidth=7;c.beginPath();c.moveTo(-10,45);c.lineTo(-14,66);c.moveTo(9,45);c.lineTo(14,66);c.stroke();
  c.fillStyle="#fff9ef";c.beginPath();c.moveTo(0,10);c.lineTo(-30,67);c.lineTo(30,67);c.closePath();c.fill();
  c.fillStyle="#ef6d91";c.beginPath();c.moveTo(-25,63);c.quadraticCurveTo(0,52,25,63);c.lineTo(30,68);c.lineTo(-30,68);c.closePath();c.fill();
  c.fillStyle="#fff";c.beginPath();c.arc(0,-3,20,0,Math.PI*2);c.fill();c.fillStyle="#9c5b43";c.beginPath();c.arc(0,-11,22,Math.PI,Math.PI*2);c.fill();
  c.fillStyle="#4c332e";c.fillRect(-18,-20,36,5);c.fillRect(-8,-27,16,8);
  c.fillStyle="#fff";c.beginPath();c.moveTo(18,-27);c.lineTo(29,-14);c.lineTo(17,-14);c.closePath();c.fill();
  c.fillStyle="#3a2730";c.fillRect(-8,-2,3,3);c.fillRect(7,-2,3,3);
  c.strokeStyle="#f2c8d0";c.lineWidth=2;c.beginPath();c.arc(-25,12,12,0,Math.PI*2);c.stroke();
 }else{
  c.strokeStyle="#242c43";c.lineWidth=7;c.beginPath();c.moveTo(-10,48);c.lineTo(-15,67);c.moveTo(9,48);c.lineTo(14,67);c.stroke();
  c.fillStyle="#243b70";c.beginPath();c.roundRect(-24,8,48,48,10);c.fill();
  c.fillStyle="#f7efe0";c.beginPath();c.moveTo(-17,10);c.lineTo(0,55);c.lineTo(17,10);c.closePath();c.fill();
  c.fillStyle="#e8b084";c.beginPath();c.arc(0,-6,20,0,Math.PI*2);c.fill();
  c.fillStyle="#51372f";c.beginPath();c.arc(0,-12,21,Math.PI,Math.PI*2);c.fill();c.fillRect(-20,-13,40,7);
  c.fillStyle="#222b40";c.fillRect(-9,-7,3,3);c.fillRect(6,-7,3,3);
  c.fillStyle="#e7bd70";c.fillRect(-4,17,8,4);
 }
 c.restore();
}
function drawParticles(c,cam,tm){
 for(let i=0;i<36;i++){const x=(i*311-(cam*.42)%311)-20,y=120+(i*97)%470+Math.sin(tm*.03+i)*12;c.fillStyle=i%4?"rgba(255,255,255,.42)":"rgba(255,218,126,.62)";c.beginPath();c.arc(x,y,i%5===0?2.5:1.2,0,Math.PI*2);c.fill();}
}
function drawWorld(c,cam,tm,previewMode=false){
 c.clearRect(0,0,W,H);drawBackground(c,cam,tm);drawPlatforms(c,cam,tm);
 crystals.forEach(cr=>drawCrystal(c,cam,cr,tm));
 memories.forEach(m=>{if(!m.taken||previewMode)drawMemory(c,cam,m,tm);});
 enemies.forEach(e=>drawEnemy(c,cam,e,tm));
 if(!previewMode){
  drawHero(c,p.x-cam,p.y, p.face,tm,false);
  const targetX=p.x-95;const dx=targetX-bride.x;bride.vx=clamp(dx*.035,-3.2,3.2);bride.x+=bride.vx;bride.y=p.y;
  drawHero(c,bride.x-cam,bride.y,dx<0?-1:1,tm,true);
 }else{
  drawHero(c,470,545,1,tm,true);drawHero(c,365,545,1,tm,false);
  for(let i=0;i<5;i++)heart(c,680+i*38,330+Math.sin(tm*.04+i)*18,.28);
 }
 drawParticles(c,cam,tm);
 if(!previewMode){
  rounded(c,20,18,300,58,14,"rgba(20,39,63,.78)");
  c.fillStyle="#fff";c.font="700 17px DM Sans,sans-serif";c.fillText("MEMÓRIAS  "+score+" / 12",68,53);heart(c,48,45,.34);
  rounded(c,W-300,18,280,58,14,"rgba(20,39,63,.78)");
  c.fillStyle="#ffe4a3";c.font="700 12px DM Sans,sans-serif";c.fillText(bridgeOpen?"A PONTE ESTÁ ATIVA":"CRISTAIS  "+crystals.filter(x=>x.active).length+" / 2",W-278,43);
  c.fillStyle="#fff";c.font="600 10px DM Sans,sans-serif";c.fillText("O REINO DO AMOR",W-278,61);
 }
}
function solidAt(x,y){
 let best=null;
 for(const q of platforms){if(x+35>q.x&&x-5<q.x+q.w&&y+68>=q.y&&y+68<=q.y+30)best=q;}
 if(bridgeOpen&&x+35>3290&&x-5<3620&&y+68>=598)best={x:3290,y:598,w:330};
 return best;
}
function damage(){
 if(p.inv>0)return;
 lives--;p.inv=100;hud();
 if(lives<=0){playing=false;if(overlay){overlay.classList.remove("hidden");const h=overlay.querySelector("h3"),pa=overlay.querySelector("p"),b=$("#start-game");h.innerHTML="A magia ainda vos espera.";pa.textContent="Recomece a aventura e atravesse o reino juntos.";b.textContent="Tentar novamente ▶";}return;}
 p.x=checkpoint;p.y=540;p.vx=p.vy=0;say("Não desistam. O último ponto de controlo está logo atrás.");
}
function hud(){if(scoreNode)scoreNode.textContent=score+" / 12";if(levelNode)levelNode.textContent="O REINO DO AMOR";if(lifeNode)lifeNode.textContent="♥ ".repeat(lives).trim();}
function reset(){
 Object.assign(p,{x:110,y:540,vx:0,vy:0,face:1,onGround:false,coyote:0,buffer:0,inv:0,attack:0});
 bride.x=55;bride.y=540;bride.vx=0;
 memories.forEach(m=>m.taken=false);crystals.forEach(x=>x.active=false);enemies.forEach(e=>e.alive=true);
 score=0;lives=3;checkpoint=110;bridgeOpen=false;playing=false;finished=false;camera=0;
 hud();say("A ponte só aparece quando o casal ativa os dois cristais.");
 const h=overlay?.querySelector("h3"),pa=overlay?.querySelector("p"),b=$("#start-game");
 if(h)h.innerHTML="O reino do amor<br>espera por vocês.";
 if(pa)pa.textContent="Atravessem a floresta encantada, ativem a ponte mágica, descubram as memórias e cheguem ao castelo.";
 if(b)b.innerHTML="Começar a aventura <span>▶</span>";
 overlay?.classList.remove("hidden");
}
function start(){if(lives<=0)reset();playing=true;finished=false;overlay?.classList.add("hidden");say("Encontrem os dois cristais. Depois, a ponte mágica vai abrir.");last=performance.now();}
function jump(){if(playing)p.buffer=9;}
function interactAction(){
 if(!playing)return;
 let nearest=null,dist=999;
 crystals.forEach(cr=>{const d=Math.abs(p.x-cr.x);if(d<dist){dist=d;nearest=cr;}});
 if(nearest&&dist<120&&!nearest.active){nearest.active=true;bridgeOpen=crystals.every(x=>x.active);say(bridgeOpen?"Os dois cristais responderam. A ponte mágica abriu!":"Um cristal despertou. Encontrem o segundo.");if(bridgeOpen)checkpoint=3650;}
}
$("#start-game")?.addEventListener("click",start);
$("#reset-game")?.addEventListener("click",reset);

window.addEventListener("keydown",e=>{
 const k=e.key.toLowerCase();
 if(["arrowleft","arrowright","arrowup"," ","a","d","w","e"].includes(k))e.preventDefault();
 if(k==="arrowleft"||k==="a")keys.left=true;
 if(k==="arrowright"||k==="d")keys.right=true;
 if(k==="arrowup"||k===" "||k==="w")jump();
 if(k==="e"&&!keys.interact){keys.interact=true;interactAction();}
});
window.addEventListener("keyup",e=>{const k=e.key.toLowerCase();if(k==="arrowleft"||k==="a")keys.left=false;if(k==="arrowright"||k==="d")keys.right=false;if(k==="e")keys.interact=false;});
window.addEventListener("blur",()=>{keys.left=keys.right=false;keys.interact=false;});

document.querySelectorAll(".mobile-controls button").forEach(b=>{
 const k=b.dataset.key;
 const down=e=>{e.preventDefault();if(k==="jump")jump();else if(k==="interact")interactAction();else keys[k]=true;};
 const up=e=>{e.preventDefault();if(k!=="jump"&&k!=="interact")keys[k]=false;};
 b.addEventListener("pointerdown",down);["pointerup","pointerleave","pointercancel"].forEach(v=>b.addEventListener(v,up));
});

const form=$("#couple-form"),result=$("#form-result");
if(form&&result)form.addEventListener("submit",e=>{
 e.preventDefault();if(!form.reportValidity())return;
 const labels={names:"Nomes",date:"Data",email:"E-mail",meet:"Como se conheceram",memories:"Memórias",style:"Estilo visual",places:"Lugares",characters:"Personagens",challenges:"Desafios",music:"Música e mensagem"};
 const data=new FormData(form),lines=["WEDDING ADVENTURE — RESUMO",""];
 Object.keys(labels).forEach(k=>{const v=String(data.get(k)||"").trim();if(v)lines.push(labels[k]+": "+v);});
 const summary=lines.join("\n");result.hidden=false;result.replaceChildren();
 const pre=document.createElement("pre");pre.textContent=summary;pre.style.cssText="white-space:pre-wrap;background:#fff;padding:14px;max-height:220px;overflow:auto";
 const btn=document.createElement("button");btn.type="button";btn.textContent="Copiar respostas";btn.addEventListener("click",()=>navigator.clipboard?.writeText(summary).then(()=>btn.textContent="Copiado ✓"));
 result.append(pre,btn);
});

reset();
let lastFrame=performance.now();
function update(dt){
 if(!playing||finished)return;
 if(keys.left){p.vx-=.72*dt;p.face=-1;}
 if(keys.right){p.vx+=.72*dt;p.face=1;}
 if(!keys.left&&!keys.right)p.vx*=Math.pow(.80,dt);
 p.vx=clamp(p.vx,-6.8,6.8);
 const oldBottom=p.y+68;
 p.vy+=GRAV*dt;p.x=clamp(p.x+p.vx*dt,0,LEVEL-55);p.y+=p.vy*dt;p.onGround=false;
 const ground=solidAt(p.x,p.y);
 if(ground&&p.vy>=0&&oldBottom<=ground.y+14&&p.y+68>=ground.y){p.y=ground.y-68;p.vy=0;p.onGround=true;}
 if(p.onGround)p.coyote=8;else p.coyote=Math.max(0,p.coyote-dt);
 if(p.buffer>0){p.buffer-=dt;if(p.onGround||p.coyote>0){p.vy=-16.5;p.onGround=false;p.coyote=0;p.buffer=0;}}
 if(p.inv>0)p.inv-=dt;
 memories.forEach(m=>{if(!m.taken&&Math.hypot(p.x+4-m.x,p.y+34-m.y)<55){m.taken=true;score++;hud();if(score===8)say("Já têm oito memórias. O portão final começa a despertar.");}});
 enemies.forEach(e=>{
  if(!e.alive)return;
  e.x+=e.dir*(1.15*dt);if(e.x<e.x-100)e.dir*=-1;
  if(Math.abs(p.x-e.x)<58&&Math.abs(p.y-e.y)<58){if(p.vy>3&&p.y<e.y-20){e.alive=false;p.vy=-9;say("Boa! O caminho está livre.");}else damage();}
 });
 if(p.x>1900&&checkpoint<2050)checkpoint=2050;
 if(bridgeOpen&&p.x>3650&&checkpoint<4210)checkpoint=4210;
 if(p.x>6100&&checkpoint<6500)checkpoint=6500;
 if(p.x>8500&&checkpoint<8500)checkpoint=8500;
 if(p.y>H+80)damage();
 if(p.x>9100){
   if(score>=8){playing=false;finished=true;say("Chegaram ao castelo. A vossa história está completa. ♥");}
   else{p.x=9000;say("O portão pede mais memórias. Recolham pelo menos 8.");}
 }
 camera=clamp(p.x-390,0,LEVEL-W);
}
function loop(ts){
 const dt=Math.min((ts-lastFrame)/16.667||1,1.6);lastFrame=ts;time+=dt;
 update(dt);drawWorld(ctx,camera,time,false);hud();
 if(pctx){previewTime+=dt*.9;drawWorld(pctx,0,previewTime,true);}
 requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();