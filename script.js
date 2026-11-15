(() => {
"use strict";
const $=s=>document.querySelector(s);
const menu=$(".menu-toggle"),nav=$(".nav");
menu?.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.textContent=open?"×":"☰";});
nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu?.setAttribute("aria-expanded","false");if(menu)menu.textContent="☰";}));
const year=$("#year");if(year)year.textContent=new Date().getFullYear();

const COLORS={ink:"#17264b",cream:"#fff3dc",gold:"#f8d77c",rose:"#ec5680",grass:"#5b9d55",soil:"#795044"};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));};
const poly=(c,pts,color)=>{c.fillStyle=color;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();c.fill();};
const atlas=new Image();atlas.src="/WeddingAdventure/assets/sprites/wedding-couple-16bit.svg?v=2";
const scenery=new Image();scenery.src="/WeddingAdventure/assets/scenes/meadow-world.svg?v=1";
const W=960,H=500,WORLD=4100,GROUND=420;
const platforms=[
{x:0,y:420,w:490},{x:560,y:368,w:176},{x:800,y:316,w:176},{x:1050,y:380,w:210},
{x:1340,y:326,w:180},{x:1600,y:376,w:190},{x:1880,y:314,w:200},{x:2170,y:370,w:224},
{x:2490,y:310,w:184},{x:2750,y:370,w:220},{x:3060,y:316,w:210},{x:3380,y:410,w:720}
];
const memories=[{x:216,y:360},{x:638,y:320},{x:880,y:267},{x:1110,y:330},{x:1430,y:276},{x:1690,y:327},{x:1980,y:265},{x:2280,y:320},{x:2580,y:260},{x:2860,y:320},{x:3160,y:265},{x:3720,y:360}];
function heart(c,x,y,s=1){rect(c,x+6*s,y,8*s,6*s,"#ffb4c7");rect(c,x+22*s,y,8*s,6*s,"#ffb4c7");rect(c,x+2*s,y+6*s,32*s,16*s,"#eb4e7c");rect(c,x+7*s,y+22*s,22*s,8*s,"#eb4e7c");rect(c,x+13*s,y+30*s,10*s,7*s,"#eb4e7c");rect(c,x+7*s,y+8*s,7*s,6*s,"#ffe8ee");}
function sprite(c,kind,x,y,frame=0,flip=false,scale=2){
 if(!atlas.complete||!atlas.naturalWidth){fallbackPerson(c,kind,x,y,frame,scale);return;}
 const col=frame===3?3:frame===4?4:frame===1?1:frame===2?2:0,row=kind==="bride"?1:0;
 c.save();if(flip){c.translate(x+48*scale,y);c.scale(-1,1);x=0;y=0;} 
 c.drawImage(atlas,col*48,row*64,48,64,Math.round(x),Math.round(y),48*scale,64*scale);c.restore();
}
function fallbackPerson(c,kind,x,y,frame,s=2){
 const bride=kind==="bride",skin="#e9b18e";rect(c,x+14*s,y+4*s,20*s,17*s,skin);rect(c,x+12*s,y+2*s,24*s,7*s,bride?"#5b382f":"#49312d");
 rect(c,x+18*s,y+11*s,3*s,3*s,"#302a35");rect(c,x+29*s,y+11*s,3*s,3*s,"#302a35");
 rect(c,x+12*s,y+22*s,24*s,22*s,bride?"#fff5ec":"#263f78");rect(c,x+7*s,y+42*s,34*s,12*s,bride?"#ead8dc":"#24345b");
 rect(c,x+9*s,y+54*s,13*s,7*s,"#26334e");rect(c,x+27*s,y+54*s,13*s,7*s,"#26334e");
}
function drawScene(c,camera,t,preview=false){
 // Hand-painted vector pixel-art panorama, repeated as two connected regions.
 c.fillStyle="#91cce8";c.fillRect(0,0,W,H);
 if(scenery.complete&&scenery.naturalWidth){
   for(let i=0;i<3;i++){const x=i*2048-camera*.18;c.drawImage(scenery,x,0,2048,500);}
 }else{
   const g=c.createLinearGradient(0,0,0,GROUND);g.addColorStop(0,"#83c8ed");g.addColorStop(1,"#e5d8d1");c.fillStyle=g;c.fillRect(0,0,W,GROUND);
   for(let i=0;i<8;i++){const x=i*150-(camera*.12%150);poly(c,[[x,340],[x+70,130+(i%3)*25],[x+150,340]],i%2?"#91b5cb":"#a5c5d4");}
 }
 // Foreground forest with layered trunks, canopy clusters and leaf highlights.
 for(let i=-2;i<23;i++){
   const wx=i*92+25,x=wx-camera*.66;if(x< -100||x>W+100)continue;
   const base=GROUND-4+(i%3)*4,scale=.78+(i%4)*.12;
   rect(c,x+24*scale,base-78*scale,18*scale,82*scale,"#65463d");
   rect(c,x+18*scale,base-10*scale,30*scale,8*scale,"#4b3b35");
   const shades=["#286b50","#347d5b","#438e63"];const leaf=shades[(i+3)%3];
   const clusters=[[-4,-80,58,42],[8,-106,52,46],[22,-125,34,34],[-13,-58,73,36],[30,-75,44,35]];
   clusters.forEach(([dx,dy,w,h],j)=>rect(c,x+(dx)*scale,base+dy*scale,w*scale,h*scale,j===2?"#64a96e":leaf));
   rect(c,x+17*scale,base-112*scale,14*scale,9*scale,"#79bd79");
   rect(c,x+2*scale,base-71*scale,11*scale,8*scale,"#8bc986");
   rect(c,x+47*scale,base-83*scale,9*scale,7*scale,"#6eb475");
 }
 // Wildflowers, grass blades and little stones in foreground.
 for(let i=0;i<70;i++){
   const wx=i*61+((i*19)%31),x=wx-camera*.92;if(x<0||x>W)continue;
   const y=GROUND-8+(i%4)*3;
   rect(c,x,y-13-(i%3)*3,3,15,"#387e4b");rect(c,x-3,y-15-(i%3)*3,5,5,i%3?"#f3a6bf":"#f6d47e");
   rect(c,x+3,y-17-(i%3)*3,5,5,i%2?"#fff0dc":"#dca6d3");
   if(i%3===0)rect(c,x+12,y-3,9,3,"#b8c9a0");
 }
 // Ground is a proper layered tile field, not a flat strip.
 rect(c,0,GROUND,W,H-GROUND,"#6f493c");rect(c,0,GROUND,W,10,"#397b49");rect(c,0,GROUND+10,W,8,"#8ecb69");
 for(let x=0;x<W;x+=48){
   const seed=Math.floor((x+camera)/48);
   rect(c,x+4,GROUND+24,24,5,seed%2?"#946249":"#a16a4e");
   rect(c,x+27,GROUND+49,15,5,"#563d37");
   rect(c,x+12,GROUND+67,27,4,"#865640");
   rect(c,x+((seed*13)%37),GROUND+14,5,4,"#c18a62");
   if(seed%3===0){rect(c,x+8,GROUND-3,4,8,"#5aa456");rect(c,x+14,GROUND-7,4,10,"#82c568");}
 }
 // Floating platforms use layered grass, soil strata, roots and edge highlights.
 platforms.forEach((p,i)=>{
   const x=Math.round(p.x-camera);if(x>W+30||x+p.w< -30)return;
   rect(c,x,p.y+7,p.w,57,"#70483c");rect(c,x,p.y+13,p.w,4,"#a66e4e");
   rect(c,x,p.y,p.w,9,"#438b4f");rect(c,x,p.y,p.w,4,"#a6d66f");
   rect(c,x+5,p.y+10,p.w-10,3,"#c08a5f");
   for(let q=12;q<p.w-8;q+=31){rect(c,x+q,p.y-5,4,8,"#39844d");rect(c,x+q+4,p.y-3,5,6,"#79bd62");}
   for(let q=16;q<p.w-12;q+=39){rect(c,x+q,p.y+27,17,4,"#a06b50");rect(c,x+q+20,p.y+45,9,4,"#594039");}
   if(i%2===0){rect(c,x+18,p.y+64,4,12,"#55774b");rect(c,x+22,p.y+68,3,8,"#55774b");}
 });
 // Foreground castle gate follows the playable world camera.
 const gateX=3780-camera;
 if(gateX<W+360&&gateX>-360){
   rect(c,gateX+28,GROUND-188,252,188,"#d7c2a4");
   rect(c,gateX+38,GROUND-178,232,178,"#f0dfc3");
   rect(c,gateX+4,GROUND-230,78,230,"#e4cfad");rect(c,gateX+226,GROUND-248,78,248,"#e4cfad");
   rect(c,gateX-2,GROUND-238,90,15,"#9a526e");rect(c,gateX+218,GROUND-256,94,15,"#9a526e");
   for(let k=0;k<5;k++){rect(c,gateX+7+k*15,GROUND-253,8,18,"#c37b83");rect(c,gateX+232+k*14,GROUND-270,8,18,"#c37b83");}
   rect(c,gateX+100,GROUND-172,112,172,"#fff0d8");rect(c,gateX+122,GROUND-102,70,102,"#73516b");
   rect(c,gateX+137,GROUND-146,18,27,"#84c2d0");rect(c,gateX+168,GROUND-146,18,27,"#84c2d0");
   rect(c,gateX+149,GROUND-78,18,78,"#d3a46e");
   for(let k=0;k<22;k++){const fx=gateX+12+k*13,fy=GROUND-36-Math.round(Math.sin(k/21*Math.PI)*27);rect(c,fx,fy,7,7,k%3?"#ed91ad":"#f5d47e");rect(c,fx+2,fy+7,4,8,"#4d8d5c");}
   rect(c,gateX+69,GROUND-287,5,51,"#58465d");rect(c,gateX+74,GROUND-284,34,19,"#e54e7a");
 }
 // Floating motes and warm fireflies.
 for(let i=0;i<22;i++){const x=(i*53-t*(.18+i%3*.04))%(W+30),y=90+(i*37)%260+Math.sin(t*.03+i)*4;rect(c,x,y,4,4,i%3?"#fff0cb":"#ffd7e2");}
}
function drawCharacter(c,player,t){
 const x=player.x-player.camera,y=player.y;
 const frame=!player.ground?3:Math.abs(player.vx)>.25?(Math.floor(t/8)%2?1:2):Math.floor(t/35)%4===0?0:0;
 sprite(c,"groom",x,y,frame,player.face<0);
}
const preview=$("#hero-game-preview"),pc=preview?.getContext("2d");
if(pc){preview.width=960;preview.height=500;pc.imageSmoothingEnabled=false;let t=0;const animate=()=>{t++;drawScene(pc,0,t,true);sprite(pc,"groom",330,260,Math.floor(t/18)%2?1:0);sprite(pc,"bride",430,260,Math.floor(t/22)%2?0:4);for(let i=0;i<5;i++)heart(pc,515+i*35,210+Math.sin(t*.07+i)*10,.65);requestAnimationFrame(animate);};animate();}

const canvas=$("#game"),ctx=canvas?.getContext("2d");
if(ctx){
 canvas.width=960;canvas.height=500;ctx.imageSmoothingEnabled=false;
 const keys={left:false,right:false};
 const player={x:90,y:GROUND-128,vx:0,vy:0,w:72,h:112,ground:false,face:1,coyote:0,buffer:0,camera:0};
 const pickups=memories.map(p=>({...p,got:false}));
 const enemies=[{x:1160,min:1080,max:1250,v:.85,alive:true},{x:2250,min:2180,max:2350,v:1,alive:true},{x:3020,min:2950,max:3110,v:1.1,alive:true}];
 let camera=0,tick=0,score=0,lives=3,playing=false,ending=false,endingAt=0,won=false,checkpoint=90,particles=[],last=0;
 const scoreEl=$("#score"),overlay=$("#game-overlay"),message=$("#game-message"),level=$("#level-name"),lifeEl=$(".game-lives");
 function hud(){if(scoreEl)scoreEl.textContent=score+" / 12";if(lifeEl)lifeEl.textContent="♥ ".repeat(lives).trim()||"♡";}
 function reset(){
   Object.assign(player,{x:90,y:GROUND-128,vx:0,vy:0,ground:false,face:1,coyote:0,buffer:0,camera:0});
   camera=0;tick=0;score=0;lives=3;checkpoint=90;playing=false;ending=false;won=false;particles=[];
   pickups.forEach(p=>p.got=false);enemies.forEach(e=>e.alive=true);keys.left=keys.right=false;hud();
   if(message)message.textContent="Recolham as 12 memórias, evitem os guardiões e cheguem ao castelo.";
   const h=overlay?.querySelector("h3"),p=overlay?.querySelector("p"),b=$("#start-game");
   if(h)h.innerHTML="A vossa história<br>começa aqui.";if(p)p.textContent="Uma aventura a dois, à procura de todas as memórias.";
   if(b)b.innerHTML="Começar a jogar <span>▶</span>";overlay?.classList.remove("hidden");if(level)level.textContent="THE MEADOW";
 }
 function burst(x,y,color="#f8d77c"){for(let i=0;i<16;i++){const a=i*Math.PI/8;particles.push({x,y,vx:Math.cos(a)*2.1,vy:Math.sin(a)*2.1-1.2,life:34,color});}}
 function respawn(){lives--;hud();if(lives<=0){playing=false;const h=overlay?.querySelector("h3"),p=overlay?.querySelector("p"),b=$("#start-game");if(h)h.textContent="O amor merece outra tentativa.";if(p)p.textContent="As memórias continuam à vossa espera.";if(b)b.textContent="Jogar novamente ▶";overlay?.classList.remove("hidden");return;}
   player.x=checkpoint;player.y=GROUND-128;player.vx=player.vy=0;message.textContent="Continuem! Ainda têm "+lives+" vidas ♥";}
 function drawEnemy(e){
   const x=e.x-camera,y=GROUND-106+Math.sin(tick*.09+e.x)*4;if(x< -60||x>W+60||!e.alive)return;
   // Clockwork rose guardian: brass shell, enamel face and animated pendulum feet.
   rect(ctx,x+12,y+67,44,8,"#26334d55");rect(ctx,x+14,y+13,40,48,"#8d5d58");
   rect(ctx,x+8,y+7,52,50,"#d6b98d");rect(ctx,x+14,y+1,40,9,"#f2d8a9");
   rect(ctx,x+16,y+14,36,34,"#f6e9cb");rect(ctx,x+22,y+24,6,6,"#4a4050");rect(ctx,x+40,y+24,6,6,"#4a4050");
   rect(ctx,x+28,y+36,14,4,"#b84d68");rect(ctx,x+3,y+26,8,7,"#b88a55");rect(ctx,x+57,y+26,8,7,"#b88a55");
   const f=Math.floor(tick/9)%2;rect(ctx,x+18-f*3,y+55,13,12,"#4e4351");rect(ctx,x+39+f*3,y+55,13,12,"#4e4351");
   rect(ctx,x+29,y-8,7,9,"#f2d17a");
 }
 function draw(){
   drawScene(ctx,camera,tick);
   pickups.forEach(p=>{if(!p.got){const x=p.x-camera,y=p.y+Math.sin(tick*.08+p.x)*5;if(x> -45&&x<W+45){heart(ctx,x,y,.9);rect(ctx,x+15,y-12,4,10,"#ffe18a");rect(ctx,x+11,y-8,12,3,"#ffe18a");}}});
   enemies.forEach(drawEnemy);
   if(ending){
     const elapsed=tick-endingAt,gx=player.x-camera;
     if(elapsed<120){
       const approach=clamp(elapsed/90,0,1),walking=Math.floor(tick/8)%2?1:2;
       sprite(ctx,"groom",gx+Math.round(18*approach),player.y,walking);
       sprite(ctx,"bride",gx+112-Math.round(20*approach),GROUND-128-Math.round(Math.max(0,elapsed-65)*.25),elapsed<70?walking:3);
     }else{
       const bob=Math.sin(elapsed*.12)*4;
       sprite(ctx,"groom",gx+26,player.y-bob,4);sprite(ctx,"bride",gx+78,player.y-bob,4);
       for(let i=0;i<8;i++){const hx=gx+30+i*23,hy=player.y-80+Math.sin(tick*.1+i)*18;heart(ctx,hx,hy,.62);}
       if(elapsed%42<21){rect(ctx,gx+70,player.y-26,18,5,"#fff2e2");}
     }
   }else drawCharacter(ctx,{...player,camera},tick);
   // Refined in-game HUD panels.
   rect(ctx,18,16,242,42,"#17264be8");heart(ctx,29,25,.8);ctx.fillStyle="#fff5e7";ctx.font="bold 16px monospace";ctx.fillText(score+" / 12 MEMÓRIAS",68,43);
   rect(ctx,748,16,194,42,"#17264be8");ctx.fillStyle="#f7dc8c";ctx.font="bold 14px monospace";ctx.fillText("WORLD 01 · LOVE",765,43);
   particles.forEach(p=>rect(ctx,p.x-camera,p.y,5,5,p.color));
   if(won){rect(ctx,0,0,W,H,"#17264be0");rect(ctx,155,145,650,220,"#fff4df");rect(ctx,162,152,636,206,"#f4dfbd");ctx.fillStyle=COLORS.ink;ctx.textAlign="center";ctx.font="bold 34px monospace";ctx.fillText("AVENTURA COMPLETA!",W/2,220);ctx.font="20px monospace";ctx.fillText("12 MEMÓRIAS REUNIDAS",W/2,265);ctx.fillText("E O VOSSO AMOR É O TESOURO.",W/2,302);ctx.font="32px monospace";ctx.fillText("♥  ♥  ♥",W/2,340);ctx.textAlign="left";}
 }
 function update(dt){
   tick+=dt;
   if(playing&&!ending&&!won){
     const prevBottom=player.y+player.h;
     if(keys.left){player.vx-=.72*dt;player.face=-1;}if(keys.right){player.vx+=.72*dt;player.face=1;}
     if(!keys.left&&!keys.right)player.vx*=Math.pow(.80,dt);
     player.vx=clamp(player.vx,-5.4,5.4);player.x=clamp(player.x+player.vx*dt,0,WORLD-player.w);
     player.vy+=.86*dt;player.y+=player.vy*dt;player.ground=false;
     platforms.forEach(p=>{if(player.x+player.w>p.x&&player.x<p.x+p.w&&player.vy>=0&&prevBottom<=p.y+8&&player.y+player.h>=p.y&&player.y+player.h<=p.y+30){player.y=p.y-player.h;player.vy=0;player.ground=true;}});
     if(player.ground)player.coyote=9;else player.coyote=Math.max(0,player.coyote-dt);
     if(player.buffer>0){player.buffer=Math.max(0,player.buffer-dt);if(player.ground||player.coyote>0){player.vy=-16.6;player.ground=false;player.coyote=0;player.buffer=0;}}
     if(player.y>H+90)respawn();
     pickups.forEach(p=>{if(!p.got&&Math.abs(player.x+player.w/2-p.x)<32&&Math.abs(player.y+player.h/2-p.y)<38){p.got=true;score++;hud();burst(p.x,p.y,"#f3a1ba");message.textContent="Memória encontrada! "+score+" de 12 ♥";}});
     enemies.forEach(e=>{if(!e.alive)return;e.x+=e.v*dt;if(e.x<e.min||e.x>e.max)e.v*=-1;
       if(player.x+player.w>e.x+8&&player.x<e.x+62&&player.y+player.h>GROUND-104&&player.y<GROUND-28){
         if(player.vy>2&&player.y+player.h<GROUND-68){e.alive=false;player.vy=-10;burst(e.x,GROUND-90,"#f0a0b8");}
         else{player.x=Math.max(checkpoint,player.x-110);player.vx=0;player.vy=-8;respawn();}
       }});
     if(player.x>1920&&checkpoint<2000){checkpoint=2020;message.textContent="Ponto de controlo ativado! ✦";}
     const finish=3840;
     if(player.x>finish&&score===12){ending=true;endingAt=tick;playing=false;player.x=3780;player.vx=player.vy=0;camera=clamp(player.x-260,0,WORLD-W);message.textContent="A noiva corre ao encontro do noivo! ♥";}
     else if(player.x>finish&&score<12){player.x=finish-12;message.textContent="Faltam "+(12-score)+" memórias para abrir o castelo.";}
   }
   if(ending&&tick-endingAt>250){ending=false;won=true;message.textContent="O amor venceu! Um abraço, muitos beijinhos e uma vida inteira juntos. ♥";}
   particles=particles.filter(p=>p.life-->0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.05*dt;});
   camera=clamp(player.x-270,0,WORLD-W);draw();
 }
 let last=0;
 function frame(ts){const dt=Math.min((ts-last)/16.667||1,1.8);last=ts;update(dt);requestAnimationFrame(frame);}
 function jump(){if(playing&&!ending&&!won)player.buffer=10;}
 $("#start-game")?.addEventListener("click",()=>{if(lives<=0)reset();playing=true;overlay?.classList.add("hidden");message.textContent="A aventura começou! Recolham as 12 memórias.";last=performance.now();});
 $("#reset-game")?.addEventListener("click",reset);
 function down(e){const k=e.key.toLowerCase();if(["arrowleft","arrowright","arrowup"," ","a","w","d"].includes(k))e.preventDefault();if(k==="arrowleft")keys.left=true;if(k==="arrowright"||k==="d")keys.right=true;if(k==="arrowup"||k===" "||k==="w"||k==="a")jump();}
 function up(e){const k=e.key.toLowerCase();if(k==="arrowleft")keys.left=false;if(k==="arrowright"||k==="d")keys.right=false;}
 window.addEventListener("keydown",down);window.addEventListener("keyup",up);window.addEventListener("blur",()=>{keys.left=keys.right=false;});
 document.querySelectorAll(".mobile-controls button").forEach(btn=>{const key=btn.dataset.key;const press=e=>{e.preventDefault();if(key==="jump")jump();else keys[key]=true;};const release=e=>{e.preventDefault();if(key!=="jump")keys[key]=false;};btn.addEventListener("pointerdown",press);["pointerup","pointerleave","pointercancel"].forEach(v=>btn.addEventListener(v,release));});
 reset();last=performance.now();requestAnimationFrame(frame);
}

// Lead form: local-only summary, no data leaves the browser.
const form=$("#couple-form"),result=$("#form-result");
form?.addEventListener("submit",e=>{e.preventDefault();if(!form.reportValidity())return;const labels={names:"Nomes",date:"Data",email:"E-mail",meet:"Como se conheceram",memories:"Memórias",style:"Estilo visual",places:"Lugares",characters:"Personagens",challenges:"Desafios",music:"Música e mensagem"};const data=new FormData(form),lines=["WEDDING ADVENTURE — RESUMO",""];Object.entries(labels).forEach(([k,l])=>{const v=String(data.get(k)||"").trim();if(v)lines.push(l+": "+v);});const summary=lines.join("\n");result.hidden=false;result.replaceChildren();const h=document.createElement("strong");h.textContent="O vosso resumo está pronto!";const p=document.createElement("p");p.textContent="Copiem o texto para guardar ou partilhar.";const pre=document.createElement("pre");pre.textContent=summary;pre.style.cssText="white-space:pre-wrap;font:12px/1.6 DM Sans,sans-serif;background:#fff;padding:12px;max-height:220px;overflow:auto";const b=document.createElement("button");b.type="button";b.textContent="Copiar respostas";b.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(summary);b.textContent="Copiado ✓";}catch(_){const a=document.createElement("textarea");a.value=summary;result.append(a);a.select();document.execCommand("copy");a.remove();b.textContent="Copiado ✓";}});result.append(h,p,pre,b);result.scrollIntoView({behavior:"smooth",block:"nearest"});});
})();