(()=>{"use strict";
const $=s=>document.querySelector(s), clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const nav=$(".nav"),menu=$(".menu-toggle");
if(menu&&nav)menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));});
if($("#year"))$("#year").textContent=new Date().getFullYear();

const canvas=$("#game"),ctx=canvas?.getContext("2d"),preview=$("#hero-game-preview"),pctx=preview?.getContext("2d");
if(!canvas||!ctx)return;
const W=1280,H=720,GROUND=590,LEVEL=8200;
canvas.width=W;canvas.height=H;if(preview){preview.width=W;preview.height=H;}
ctx.imageSmoothingEnabled=false;if(pctx)pctx.imageSmoothingEnabled=false;

const atlas=new Image();atlas.src="assets/sprites/wedding-couple-16bit.svg";
const state={x:150,y:GROUND-138,vx:0,vy:0,face:1,onGround:false,inv:0,score:0,lives:3,playing:false,finished:false,checkpoint:150,camera:0,time:0,shake:0};
const keys={left:false,right:false};
const memories=[
 {x:720,y:450},{x:1220,y:360},{x:1780,y:480},{x:2320,y:335},{x:2920,y:430},{x:3510,y:320},
 {x:4180,y:455},{x:4860,y:360},{x:5480,y:455},{x:6120,y:330},{x:6760,y:430},{x:7440,y:360}
].map((m,i)=>({...m,taken:false,phase:i*1.7}));

const platforms=[
{x:0,y:GROUND,w:620,h:130},{x:700,y:515,w:230,h:205},{x:1010,y:440,w:250,h:280},
{x:1340,y:540,w:360,h:180},{x:1780,y:470,w:250,h:250},{x:2110,y:390,w:220,h:330},
{x:2420,y:530,w:420,h:190},{x:2960,y:455,w:230,h:265},{x:3300,y:350,w:250,h:370},
{x:3660,y:520,w:420,h:200},{x:4190,y:450,w:230,h:270},{x:4520,y:545,w:450,h:175},
{x:5070,y:400,w:260,h:320},{x:5450,y:500,w:360,h:220},{x:5920,y:360,w:230,h:360},
{x:6260,y:520,w:420,h:200},{x:6810,y:440,w:280,h:280},{x:7200,y:540,w:330,h:180},
{x:7630,y:460,w:300,h:260},{x:8010,y:GROUND,w:190,h:130}
];

const hazards=[{x:930,y:492,w:46},{x:1690,y:517,w:50},{x:2840,y:507,w:55},{x:3670,y:497,w:48},{x:4680,y:522,w:55},{x:6270,y:497,w:45}];
const enemies=[
 {x:1570,y:500,vx:1.2,type:"knight",alive:true,min:1390,max:1660},
 {x:3220,y:310,vx:-1,type:"bat",alive:true,min:2990,max:3500},
 {x:4460,y:505,vx:1.1,type:"knight",alive:true,min:4200,max:4850},
 {x:5780,y:455,vx:-1.25,type:"bat",alive:true,min:5480,max:6150},
 {x:7130,y:485,vx:1.3,type:"knight",alive:true,min:6860,max:7520}
];
const particles=[];const magic=[];
const overlay=$("#game-overlay"),scoreNode=$("#score"),levelNode=$("#level-name"),lifeNode=$(".game-lives"),message=$("#game-message");
function say(t){if(message)message.textContent=t;}
function round(c,x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function text(c,t,x,y,size,fill,font="700"){c.fillStyle=fill;c.font=font+" "+size+"px 'DM Sans',sans-serif";c.fillText(t,x,y);}
function sprite(c,kind,frame,x,bottom,flip=false,scale=2.15){
 if(!atlas.complete)return;
 const sx=(frame%5)*48,sy=kind==="bride"?64:0;
 c.save();if(flip){c.translate(x+48*scale,bottom-64*scale);c.scale(-1,1);c.drawImage(atlas,sx,sy,48,64,0,0,48*scale,64*scale);}
 else c.drawImage(atlas,sx,sy,48,64,x,bottom-64*scale,48*scale,64*scale);c.restore();
}
function burst(x,y,count=12,type="spark"){
 for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*4;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:30+Math.random()*35,type});}
}
function updateParticles(){
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life--;if(p.life<=0)particles.splice(i,1);}
}
function sky(c,tm,cam){
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,"#4c78bd");g.addColorStop(.52,"#9ed3df");g.addColorStop(1,"#f2c996");c.fillStyle=g;c.fillRect(0,0,W,H);
 const moonX=1030-cam*.035,moonY=105;const mg=c.createRadialGradient(moonX,moonY,5,moonX,moonY,100);mg.addColorStop(0,"rgba(255,246,206,.95)");mg.addColorStop(1,"rgba(255,246,206,0)");c.fillStyle=mg;c.fillRect(moonX-110,moonY-110,220,220);c.fillStyle="#fff0c7";c.beginPath();c.arc(moonX,moonY,38,0,Math.PI*2);c.fill();
 for(let i=0;i<28;i++){const x=(i*271-cam*.12+tm*.3)%(W+80)-40,y=50+(i*71)%310;c.fillStyle="rgba(255,245,204,"+(.28+.25*(i%3)/2)+")";c.fillRect(x,y,2+(i%2),2+(i%2));}
 function cloud(x,y,s){c.fillStyle="rgba(255,247,225,.62)";c.beginPath();c.ellipse(x,y,65*s,18*s,0,0,Math.PI*2);c.ellipse(x-35*s,y+2,35*s,15*s,0,0,Math.PI*2);c.ellipse(x+30*s,y-5,40*s,20*s,0,0,Math.PI*2);c.fill();}
 cloud(180-cam*.08,170,.9);cloud(820-cam*.1,210,.65);cloud(1130-cam*.06,300,.8);
}
function mountains(c,cam){
 const layers=[{y:400,color:"#527b83",speed:.10},{y:455,color:"#3d6870",speed:.18},{y:510,color:"#315b4d",speed:.28}];
 layers.forEach((l,j)=>{c.fillStyle=l.color;c.beginPath();c.moveTo(0,H);for(let x=-80;x<W+120;x+=80){const wx=x+cam*l.speed;c.lineTo(x,l.y-70*Math.sin(wx*.006+j)-45*Math.cos(wx*.002));}c.lineTo(W,H);c.fill();});
}
function castle(c,x,y,scale=1){
 c.save();c.translate(x,y);c.scale(scale,scale);
 c.fillStyle="#f5e3c0";c.fillRect(20,65,210,105);c.fillRect(0,85,48,85);c.fillRect(202,75,55,95);
 c.fillStyle="#c8a879";c.fillRect(105,112,38,58);c.fillStyle="#3a4c70";c.beginPath();c.moveTo(5,85);c.lineTo(24,40);c.lineTo(44,85);c.fill();c.beginPath();c.moveTo(205,75);c.lineTo(230,25);c.lineTo(255,75);c.fill();c.beginPath();c.moveTo(72,65);c.lineTo(125,0);c.lineTo(178,65);c.fill();
 c.fillStyle="#d6b477";for(let i=0;i<8;i++){c.fillRect(34+i*24,96,9,12);}c.fillStyle="#f7d98d";c.fillRect(119,30,12,15);c.restore();
}
function waterfall(c,x,y){
 c.fillStyle="#263f4c";c.fillRect(x,y,120,H-y);const g=c.createLinearGradient(x,0,x+120,0);g.addColorStop(0,"#8de0ec");g.addColorStop(.5,"#e5ffff");g.addColorStop(1,"#6fc5dc");c.fillStyle=g;c.fillRect(x+12,y,96,H-y);
 for(let i=0;i<7;i++){c.fillStyle="rgba(255,255,255,.6)";c.fillRect(x+20+i*13,y+20,3,H-y-30);}
}
function background(c,cam,tm){
 c.clearRect(0,0,W,H);sky(c,tm,cam);mountains(c,cam);
 // magical forest
 for(let i=0;i<38;i++){const wx=i*250+80,x=wx-cam*.45;if(x<-100||x>W+100)continue;const h=100+(i%5)*22;c.fillStyle=i%2?"#244e3e":"#2c6248";c.fillRect(x-7,GROUND-h,14,h);c.beginPath();c.arc(x,GROUND-h,42+(i%3)*10,0,Math.PI*2);c.fill();}
 waterfall(c,1780-cam*.38,260);castle(c,7300-cam*.9,300,.95);
 // floating islands
 for(let i=0;i<5;i++){const x=850+i*1250-cam*.22,y=230+(i%2)*55;c.fillStyle="#496f5b";c.beginPath();c.moveTo(x-70,y);c.lineTo(x+70,y);c.lineTo(x+35,y+35);c.lineTo(x-25,y+55);c.closePath();c.fill();c.fillStyle="#89ad79";c.fillRect(x-60,y-6,120,10);}
 // foreground vines
 c.fillStyle="rgba(20,45,35,.3)";for(let x=-20;x<W+20;x+=80){const y=120+((x+cam*.3)%160);c.fillRect(x,y,4,90);}
}
function terrain(c,cam){
 platforms.forEach((q,i)=>{const x=q.x-cam;if(x+q.w<0||x>W)return;
   const g=c.createLinearGradient(0,q.y,0,q.y+q.h);g.addColorStop(0,"#8c6848");g.addColorStop(1,"#4e3b36");round(c,x,q.y,q.w,q.h,5,g);
   c.fillStyle="#6fa35d";c.fillRect(x,q.y-10,q.w,12);c.fillStyle="#b4d477";c.fillRect(x,q.y-10,q.w,4);
   for(let n=16;n<q.w-8;n+=48){c.fillStyle=i%2?"#725443":"#805e45";c.fillRect(x+n,q.y+30,24,5);c.fillRect(x+n+10,q.y+58,16,5);}
 });
 // wooden bridge
 const bx=360-cam;if(bx<W&&bx+310>0){c.fillStyle="#5d392a";c.fillRect(bx,525,310,24);for(let i=0;i<7;i++){c.fillStyle="#a16b42";c.fillRect(bx+i*48,520,38,18);}}
}
function drawHeart(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle="#ff667f";c.beginPath();c.moveTo(0,18);c.bezierCurveTo(-36,-8,-28,-30,-11,-27);c.bezierCurveTo(-2,-25,2,-18,4,-12);c.bezierCurveTo(16,-36,42,-16,27,8);c.lineTo(4,31);c.closePath();c.fill();c.restore();}
function collectibles(c,cam,tm,preview=false){
 memories.forEach((m,i)=>{if(m.taken&&!preview)return;const x=m.x-cam,y=m.y+Math.sin(tm*.06+m.phase)*10;if(x<-50||x>W+50)return;
   c.fillStyle="rgba(255,235,148,.18)";c.beginPath();c.arc(x,y,38,0,Math.PI*2);c.fill();drawHeart(c,x,y,.43);text(c,"♥",x-6,y+7,9,"#fff5d5");
 });
}
function enemiesDraw(c,cam,tm){
 enemies.forEach((e,i)=>{if(!e.alive)return;const x=e.x-cam,y=e.y+Math.sin(tm*.06+i)*7;if(x<-80||x>W+80)return;
   if(e.type==="bat"){c.fillStyle="#493b65";c.beginPath();c.moveTo(x,y+15);c.lineTo(x-32,y-8);c.lineTo(x-10,y+20);c.lineTo(x,y+8);c.lineTo(x+10,y+20);c.lineTo(x+32,y-8);c.closePath();c.fill();c.fillStyle="#ffb4c6";c.fillRect(x-6,y+3,4,4);c.fillRect(x+4,y+3,4,4);}
   else {c.fillStyle="#6c7082";c.fillRect(x-20,y-42,40,50);c.fillStyle="#b5bfd0";c.fillRect(x-27,y-58,54,20);c.fillStyle="#5a3d45";c.fillRect(x-10,y-52,20,6);c.fillStyle="#d8b15d";c.fillRect(x-30,y-6,60,7);}
 });
}
function drawGoal(c,cam,tm){
 const x=8100-cam;if(x<-250||x>W+250)return;
 castle(c,x-110,315,.95);for(let i=0;i<8;i++){drawHeart(c,x-100+i*28,235+Math.sin(tm*.05+i)*13,.32);}
 text(c,"O GRANDE REENCONTRO",x-120,560,18,"#fff2cc","700");
}
function drawPlayer(c,cam,tm){
 const run=state.playing&&Math.abs(state.vx)>.5,frame=run?1+Math.floor(tm/7)%3:(state.onGround?0:4);
 if(state.inv<=0||Math.floor(tm/5)%2===0)sprite(c,"groom",frame,state.x-cam-52,state.y+138,state.face<0,2.15);
}
function drawParticles(c,cam){
 particles.forEach(p=>{const x=p.x-cam;if(x<-20||x>W+20)return;c.fillStyle=p.type==="magic"?"#ffcf73":"#fff2b0";c.fillRect(x,p.y,3,3);});
}
function scene(c,cam,tm,preview=false){
 background(c,cam,tm);terrain(c,cam);collectibles(c,cam,tm,preview);enemiesDraw(c,cam,tm);drawGoal(c,cam,tm);
 if(preview){sprite(c,"groom",Math.floor(tm/10)%3,430,570,false,2.15);sprite(c,"bride",Math.floor(tm/10+1)%3,555,570,false,2.15);for(let i=0;i<5;i++)drawHeart(c,730+i*38,320+Math.sin(tm*.05+i)*18,.32);}
 else {drawPlayer(c,cam,tm);drawParticles(c,cam);}
 // cinematic frame
 c.fillStyle="rgba(11,22,32,.18)";c.fillRect(0,0,W,46);c.fillRect(0,H-28,W,28);
 text(c,"THE KINGDOM OF LOVE",26,31,13,"#fff1cf","700");text(c,"CAPÍTULO ÚNICO  ·  A PRIMEIRA AVENTURA",W-315,31,10,"#f4dfb0","600");
}
function hud(){
 if(scoreNode)scoreNode.textContent=state.score+" / 12";
 if(levelNode)levelNode.textContent="THE KINGDOM OF LOVE";
 if(lifeNode)lifeNode.textContent="♥ ".repeat(state.lives);
}
function reset(){
 Object.assign(state,{x:150,y:GROUND-138,vx:0,vy:0,face:1,onGround:false,inv:0,score:0,lives:3,playing:false,finished:false,checkpoint:150,camera:0,time:0,shake:0});
 memories.forEach(m=>m.taken=false);enemies.forEach(e=>e.alive=true);particles.length=0;magic.length=0;hud();
 const h=overlay?.querySelector("h3"),p=overlay?.querySelector("p"),b=$("#start-game");
 if(h)h.innerHTML="A vossa história<br>começa aqui.";
 if(p)p.textContent="Uma única fase. Um reino mágico. Recolham as 12 memórias e cheguem ao castelo.";
 if(b)b.innerHTML="Começar a aventura <span>▶</span>";
 overlay?.classList.remove("hidden");
}
function hurt(){
 if(state.inv>0)return;state.lives--;state.inv=100;state.shake=12;burst(state.x,state.y+50,18);hud();
 if(state.lives<=0){state.playing=false;overlay?.classList.remove("hidden");const h=overlay.querySelector("h3"),p=overlay.querySelector("p"),b=$("#start-game");if(h)h.textContent="O amor ainda espera por vocês.";if(p)p.textContent="Tentem novamente e atravessem o reino juntos.";if(b)b.textContent="Tentar novamente ▶";return;}
 state.x=state.checkpoint;state.y=GROUND-138;state.vx=state.vy=0;
}
function jump(){if(!state.playing||state.finished)return;if(state.onGround){state.vy=-16;state.onGround=false;burst(state.x+45,state.y+130,8,"magic");}}
function start(){if(state.lives<=0)reset();state.playing=true;state.finished=false;overlay?.classList.add("hidden");say("Atravessem o reino, recolham as 12 memórias e cheguem juntos ao castelo.");}
$("#start-game")?.addEventListener("click",start);$("#reset-game")?.addEventListener("click",reset);
window.addEventListener("keydown",e=>{const k=e.key.toLowerCase();if(["arrowleft","arrowright","arrowup"," ","a","d","w"].includes(k))e.preventDefault();if(k==="arrowleft"||k==="a")keys.left=true;if(k==="arrowright"||k==="d")keys.right=true;if(k==="arrowup"||k==="w"||k===" ")jump();});
window.addEventListener("keyup",e=>{const k=e.key.toLowerCase();if(k==="arrowleft"||k==="a")keys.left=false;if(k==="arrowright"||k==="d")keys.right=false;});
window.addEventListener("blur",()=>{keys.left=keys.right=false;});
document.querySelectorAll(".mobile-controls button").forEach(b=>{const k=b.dataset.key,down=e=>{e.preventDefault();if(k==="jump")jump();else keys[k]=true},up=e=>{e.preventDefault();if(k!=="jump")keys[k]=false};b.addEventListener("pointerdown",down);["pointerup","pointerleave","pointercancel"].forEach(v=>b.addEventListener(v,up));});
const form=$("#couple-form"),result=$("#form-result");
if(form&&result)form.addEventListener("submit",e=>{e.preventDefault();if(!form.reportValidity())return;const labels={names:"Nomes",date:"Data",email:"E-mail",meet:"Como se conheceram",memories:"Memórias",style:"Estilo visual",places:"Lugares",characters:"Personagens",challenges:"Desafios",music:"Música e mensagem"},data=new FormData(form),lines=["WEDDING ADVENTURE — RESUMO",""];Object.keys(labels).forEach(k=>{const v=String(data.get(k)||"").trim();if(v)lines.push(labels[k]+": "+v)});const summary=lines.join("\n");result.hidden=false;result.replaceChildren();const pre=document.createElement("pre");pre.textContent=summary;pre.style.cssText="white-space:pre-wrap;background:#fff;padding:14px;max-height:220px;overflow:auto";const btn=document.createElement("button");btn.type="button";btn.textContent="Copiar respostas";btn.addEventListener("click",()=>navigator.clipboard?.writeText(summary).then(()=>btn.textContent="Copiado ✓"));result.append(pre,btn);});

let last=performance.now();
function loop(ts){
 const dt=Math.min((ts-last)/16.667||1,1.6);last=ts;state.time+=dt;updateParticles();
 if(state.playing&&!state.finished){
   if(keys.left){state.vx-=.72*dt;state.face=-1}if(keys.right){state.vx+=.72*dt;state.face=1}if(!keys.left&&!keys.right)state.vx*=Math.pow(.82,dt);
   state.vx=clamp(state.vx,-6.5,6.5);const oldBottom=state.y+138;state.x=clamp(state.x+state.vx*dt,0,LEVEL-90);state.vy+=.78*dt;state.y+=state.vy*dt;state.onGround=false;
   platforms.forEach(q=>{const bottom=state.y+138;if(state.x+72>q.x&&state.x+12<q.x+q.w&&state.vy>=0&&oldBottom<=q.y+16&&bottom>=q.y&&bottom<=q.y+35){state.y=q.y-138;state.vy=0;state.onGround=true;}});
   if(state.y>H+120)hurt();
   if(state.inv>0)state.inv-=dt;if(state.shake>0)state.shake-=dt;
   memories.forEach(m=>{if(!m.taken&&Math.abs(state.x+45-m.x)<55&&Math.abs(state.y+75-m.y)<70){m.taken=true;state.score++;burst(m.x,m.y,18,"magic");say("Memória encontrada! "+state.score+" de 12.");hud();}});
   enemies.forEach(e=>{if(!e.alive)return;e.x+=e.vx*dt;if(e.x<e.min||e.x>e.max)e.vx*=-1;if(Math.abs(state.x+45-e.x)<62&&Math.abs(state.y+80-e.y)<72){if(state.vy>2&&state.y<e.y-35){e.alive=false;state.vy=-10;burst(e.x,e.y,20,"magic");say("Desafio superado!");}else hurt();}});
   hazards.forEach(h=>{if(state.x+70>h.x&&state.x+10<h.x+h.w&&state.y+138>h.y&&state.y+100<h.y+35)hurt();});
   if(state.x>1900)state.checkpoint=1950;if(state.x>4000)state.checkpoint=4100;if(state.x>5900)state.checkpoint=6000;
   if(state.x>7900){if(state.score>=9){state.finished=true;state.playing=false;burst(state.x,380,70,"magic");say("O reencontro dos noivos! Conseguiram! ♥");}else{state.x=7750;say("Ainda faltam "+(9-state.score)+" memórias para abrir os portões do castelo.");}}}
 state.camera=clamp(state.x-390,0,LEVEL-W);let shakeX=state.shake?Math.sin(state.time*.8)*state.shake:0;
 ctx.save();ctx.translate(shakeX,0);scene(ctx,state.camera,state.time,false);ctx.restore();hud();
 if(pctx){previewTime++;scene(pctx,0,previewTime,true);}
 requestAnimationFrame(loop);
}
let previewTime=0;reset();requestAnimationFrame(loop);
})();