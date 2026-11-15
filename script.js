(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const menuButton=$(".menu-toggle"),nav=$(".nav");
  menuButton?.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));menuButton.textContent=open?"×":"☰";});
  nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menuButton?.setAttribute("aria-expanded","false");if(menuButton)menuButton.textContent="☰";}));
  const year=$("#year");if(year)year.textContent=new Date().getFullYear();

  // Original pixel-art engine: crisp tile rendering, layered scenery and an animated couple atlas.
  const C={sky:"#76a9e5",sky2:"#d9d9e8",sun:"#fff0b9",cloud:"#fff8e8",far:"#9bafd0",far2:"#728fb2",hill:"#507c72",hill2:"#396653",leaf:"#2c694f",leaf2:"#43865a",leaf3:"#78ad61",trunk:"#775044",soil:"#89553e",soil2:"#a96b49",grass:"#4b984f",grass2:"#83ce68",stone:"#e8d4ad",gold:"#ffe18a",pink:"#ed4d80",dark:"#24345b",white:"#fff5e6",shadow:"#263b5c"};
  const couple=new Image();couple.src="/WeddingAdventure/assets/sprites/wedding-atlas-48.png?v=1";
  const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function drawCloud(c,x,y,s=1){rect(c,x+7*s,y,25*s,7*s,C.cloud);rect(c,x,y+6*s,42*s,8*s,C.cloud);rect(c,x+13*s,y-6*s,19*s,9*s,C.cloud);}
  function drawTree(c,x,y,s=1){c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);rect(c,-3,-3,7,22,C.trunk);rect(c,-13,-23,27,20,C.leaf);rect(c,-10,-32,21,15,C.leaf2);rect(c,-5,-38,12,10,C.leaf3);rect(c,-11,-17,7,5,"#8ac66b");rect(c,4,-25,8,5,"#65a85e");c.restore();}
  function drawCastle(c,x,ground){rect(c,x+15,ground-56,92,56,"#f0dfbd");rect(c,x,ground-94,27,94,"#f9e9ca");rect(c,x+95,ground-105,27,105,"#f9e9ca");rect(c,x+39,ground-83,48,83,"#fff0d5");
    rect(c,x-4,ground-103,35,9,"#a75c78");rect(c,x+91,ground-114,35,9,"#a75c78");rect(c,x+34,ground-92,58,10,"#a75c78");
    for(const [tx,ty] of [[x+7,ground-120],[x+102,ground-131],[x+55,ground-109]]){rect(c,tx,ty,18,17,"#c77a84");rect(c,tx+7,ty-7,4,7,C.gold);}
    rect(c,x+52,ground-43,20,43,"#745064");rect(c,x+57,ground-51,10,9,C.gold);
    rect(c,x+9,ground-78,9,14,"#76a7c5");rect(c,x+105,ground-88,9,14,"#76a7c5");rect(c,x+57,ground-68,11,15,"#76a7c5");
    rect(c,x+119,ground-136,3,28,C.dark);rect(c,x+122,ground-135,17,9,C.pink);
  }
  function drawHeart(c,x,y,s=1){rect(c,x+2*s,y,4*s,3*s,"#ffb4c9");rect(c,x+10*s,y,4*s,3*s,"#ffb4c9");rect(c,x,y+3*s,16*s,7*s,C.pink);rect(c,x+2*s,y+10*s,12*s,4*s,C.pink);rect(c,x+5*s,y+14*s,6*s,3*s,C.pink);rect(c,x+3*s,y+3*s,4*s,3*s,"#ffe1e8");}
  function drawSpark(c,x,y,t){const a=Math.sin(t*.12+x)*2;rect(c,x+2,y-3+a,2,9,C.gold);rect(c,x-1,y+a,8,2,C.gold);}
  const platforms=[
    {x:0,y:211,w:245},{x:280,y:184,w:86},{x:400,y:158,w:88},{x:525,y:190,w:105},
    {x:670,y:164,w:90},{x:800,y:188,w:95},{x:940,y:157,w:100},{x:1085,y:184,w:112},
    {x:1245,y:155,w:92},{x:1380,y:184,w:110},{x:1535,y:157,w:105},{x:1685,y:205,w:370}
  ];
  const worldWidth=2055;
  const hearts=[{x:108,y:181},{x:319,y:154},{x:443,y:128},{x:567,y:160},{x:714,y:134},{x:846,y:158},{x:988,y:128},{x:1140,y:155},{x:1290,y:127},{x:1435,y:155},{x:1585,y:127},{x:1785,y:177}];
  function drawWorld(c,w,h,camera,t,preview=false,player=null){
    const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,C.sky);sky.addColorStop(.67,C.sky2);sky.addColorStop(1,"#f5c6aa");c.fillStyle=sky;c.fillRect(0,0,w,h);
    rect(c,0,0,w,2,"#ffffff88");
    rect(c,367,35,31,31,C.sun);rect(c,361,41,43,19,C.sun);rect(c,376,27,13,45,"#fff3c466");
    for(let i=0;i<7;i++){const x=((i*111-t*.22)%(w+70)+w+70)%(w+70)-30;drawCloud(c,x,30+(i%3)*18,.72+(i%2)*.18);}
    // Distant mountains and rolling hills, all aligned to the pixel grid.
    for(let i=0;i<9;i++){const x=i*76-(camera*.13%76),y=112+(i%3)*9;rect(c,x,y+15,57,91,C.far);rect(c,x+10,y+2,39,18,"#c7d4e5");rect(c,x+22,y-7,18,12,"#e5e8e9");rect(c,x+5,y+34,49,5,C.far2);}
    for(let i=0;i<7;i++){const x=i*105-(camera*.25%105);rect(c,x,168+(i%2)*7,115,65,i%2?C.hill:C.hill2);rect(c,x+10,163+(i%2)*7,75,9,"#659174");}
    for(let i=0;i<13;i++){const x=i*59-(camera*.34%59);drawTree(c,x,195+(i%2)*3,.65+(i%3)*.1);}
    // Platforms with grass caps, soil strata, stones and flowers.
    platforms.forEach((p,i)=>{const x=p.x-camera;if(x> w+20||x+p.w< -20)return;
      rect(c,x,p.y+6,p.w,46,C.soil);rect(c,x,p.y+3,p.w,7,C.grass);rect(c,x,p.y,p.w,5,C.grass2);
      for(let q=8;q<p.w-4;q+=24){rect(c,x+q,p.y+14,9,4,"#b77a51");rect(c,x+q+9,p.y+30,5,4,"#69483c");rect(c,x+q+3,p.y+1,4,3,"#c1e77d");}
      if(i%2===0){rect(c,x+17,p.y+20,8,6,"#d2a078");rect(c,x+Math.max(30,p.w-32),p.y+38,6,5,"#6e473d");}
    });
    // Tiny foreground flowers and grass tufts.
    for(let i=0;i<52;i++){const x=((i*31-camera*.92)%(w+24)+w+24)%(w+24);rect(c,x,204,2,7,"#34724e");rect(c,x-2,201,4,3,i%3===0?"#fff0a8":i%2?"#ff9fbd":"#e9e5e0");}
    // Floating hearts for the cover and game world.
    if(preview)hearts.forEach((p,i)=>{const x=p.x-camera,y=p.y+Math.sin(t*.08+i)*2;if(x>-20&&x<w+20)drawHeart(c,x,y,1);});
    // Decorative castle appears at the destination only.
    const castleX=1900-camera;if(castleX>-150&&castleX<w+150)drawCastle(c,castleX,205);
    // Checkpoint flag.
    const flagX=1010-camera;if(flagX>-20&&flagX<w+20){rect(c,flagX,115,3,44,C.white);rect(c,flagX+3,117,22,13,C.pink);rect(c,flagX+3,130,15,4,C.gold);}
    if(player){
      const walk=Math.abs(player.vx)>.25,air=!player.ground,frame=player.celebrate?4:air?3:walk?Math.floor(t/7)%3:0;
      drawCouple(c,player.x-camera,player.y-27,frame,player.face||1);
    }else if(preview){
      const x=178+(Math.sin(t*.015)*14),y=145+Math.sin(t*.1)*2;drawCouple(c,x, y,Math.floor(t/8)%3,1);
      drawHeart(c,x+20,y-23+Math.sin(t*.1)*2,.7);
    }
    // Foreground frame.
    rect(c,0,h-3,w,3,"#fff7e8aa");
  }
  function drawGroom(c,x,y,frame=0,face=1){
    if(!couple.complete||!couple.naturalWidth){rect(c,x+10,y+20,28,38,"#263e78");rect(c,x+15,y+5,20,18,"#efb18c");return;}
    c.save();c.imageSmoothingEnabled=false;
    if(face<0){c.translate(Math.round(x+48),0);c.scale(-1,1);x=0;}
    c.drawImage(couple,(frame%6)*48,0,48,64,Math.round(x),Math.round(y),48,64);c.restore();
  }
  function drawBride(c,x,y,frame=0){
    if(!couple.complete||!couple.naturalWidth){rect(c,x+10,y+20,28,38,"#fff4e9");rect(c,x+15,y+5,20,18,"#efb18c");return;}
    c.save();c.imageSmoothingEnabled=false;
    c.drawImage(couple,(frame%6)*48,64,48,64,Math.round(x),Math.round(y),48,64);c.restore();
  }
  function drawHug(c,x,y,frame=0){
    if(!couple.complete||!couple.naturalWidth){drawGroom(c,x,y,0,1);drawBride(c,x+18,y,0);return;}
    c.save();c.imageSmoothingEnabled=false;
    c.drawImage(couple,(frame%6)*48,128,48,64,Math.round(x),Math.round(y),48,64);c.restore();
  }
  function drawCouple(c,x,y,frame,face=1){
    drawGroom(c,x,y,frame,face);drawBride(c,x+48,y,frame);
  }
  // Animated cover preview.
  const preview=$("#hero-game-preview"),pctx=preview?.getContext("2d");
  if(pctx){pctx.imageSmoothingEnabled=false;let tick=0;const loop=()=>{tick++;drawWorld(pctx,480,270,0,tick,true);requestAnimationFrame(loop);};loop();}

  // Playable platform adventure with 12 memories, enemies, checkpoint and finish sequence.
  const canvas=$("#game"),ctx=canvas?.getContext("2d");
  if(ctx){
    const W=480,H=250,GRAVITY=.43;
    ctx.imageSmoothingEnabled=false;
    const keys={left:false,right:false};
    const player={x:28,y:173,vx:0,vy:0,w:48,h:37,ground:false,face:1,celebrate:false};
    const pickups=hearts.map(p=>({...p,got:false}));
    const enemies=[{x:590,y:168,min:545,max:625,v:0.65,alive:true},{x:1190,y:162,min:1120,max:1215,v:0.72,alive:true},{x:1510,y:166,min:1460,max:1570,v:0.8,alive:true}];
    let camera=0,tick=0,score=0,lives=3,playing=false,won=false,ending=false,endingStarted=0,checkpoint=28,raf=0,last=0,particles=[];
    const scoreEl=$("#score"),overlay=$("#game-overlay"),message=$("#game-message"),level=$("#level-name"),lifeEl=$(".game-lives");
    function updateHud(){if(scoreEl)scoreEl.textContent=score+" / "+pickups.length;if(lifeEl)lifeEl.textContent="♥ ".repeat(lives).trim()||"♡";}
    function reset(){player.x=28;player.y=173;player.vx=player.vy=0;player.ground=false;player.face=1;player.celebrate=false;camera=0;tick=0;score=0;lives=3;checkpoint=28;won=false;ending=false;endingStarted=0;playing=false;particles=[];pickups.forEach(p=>p.got=false);enemies.forEach(e=>e.alive=true);keys.left=keys.right=false;updateHud();if(message)message.textContent="Recolham as 12 memórias, evitem os guardiões e cheguem ao castelo.";const title=overlay?.querySelector("h3"),copy=overlay?.querySelector("p"),start=$("#start-game");if(title)title.innerHTML="A vossa história<br>começa aqui.";if(copy)copy.textContent="Uma aventura a dois, à procura de todas as memórias.";if(start)start.innerHTML="Começar a jogar <span>▶</span>";overlay?.classList.remove("hidden");if(level)level.textContent="THE MEADOW";}
    function jump(){if(playing&&!won&&player.ground){player.vy=-8.3;player.ground=false;}}
    function sparkle(x,y,color=C.gold){for(let i=0;i<12;i++){const a=i*Math.PI/6;particles.push({x,y,vx:Math.cos(a)*1.4,vy:Math.sin(a)*1.4-1,life:28,color});}}
    function respawn(){lives--;updateHud();if(lives<=0){playing=false;overlay?.classList.remove("hidden");const h=overlay?.querySelector("h3"),p=overlay?.querySelector("p"),b=$("#start-game");if(h)h.textContent="A aventura continua.";if(p)p.textContent="As memórias continuam à vossa espera. Tentem novamente!";if(b)b.textContent="Jogar novamente ▶";return;}
      player.x=checkpoint;player.y=checkpoint>1000?120:173;player.vx=player.vy=0;message.textContent="Respirem fundo — ainda têm "+lives+" vidas!";}
    function drawEnemy(e){const x=e.x-camera;if(x< -30||x>W+30||!e.alive)return;rect(ctx,x+3,e.y+25,21,4,"#28385c66");rect(ctx,x+4,e.y+9,18,15,"#8b5a91");rect(ctx,x+1,e.y+13,24,10,"#a96a9d");rect(ctx,x+6,e.y+4,14,8,"#c68eb7");rect(ctx,x+7,e.y+10,3,4,C.white);rect(ctx,x+16,e.y+10,3,4,C.white);rect(ctx,x+8,e.y+11,2,2,C.dark);rect(ctx,x+17,e.y+11,2,2,C.dark);rect(ctx,x+9,e.y+20,3,3,C.gold);rect(ctx,x+16,e.y+20,3,3,C.gold);}
    function draw(){
      drawWorld(ctx,W,H,camera,tick,false,null);
      pickups.forEach(p=>{if(!p.got){const x=p.x-camera;if(x>-20&&x<W+20){drawHeart(ctx,x,p.y+Math.sin(tick*.09+p.x)*2,1);drawSpark(ctx,x+7,p.y-6,tick);}}});
      enemies.forEach(drawEnemy);
      // Player rendered in the foreground.
      if(ending){
        const elapsed=tick-endingStarted,gx=player.x-camera,bx=1900-camera;
        if(elapsed<105){
          drawGroom(ctx,gx,player.y-27,elapsed>55?2:1,1);
          const phase=Math.floor((elapsed%72)/24),brideFrame=phase===0?1:phase===1?3:phase===2?2:4;
          const brideY=phase===1?112:phase===0?141:phase===2?119:135;
          drawBride(ctx,bx,brideY,brideFrame);
          if(elapsed>42){drawHeart(ctx,bx+8,90+Math.sin(tick*.18)*4,.8);drawHeart(ctx,bx+35,75+Math.sin(tick*.15+1)*4,.65);}
        }else{
          const hugFrame=Math.floor((elapsed-105)/20)%6;
          drawHug(ctx,gx+4,player.y-27,hugFrame);
          for(let i=0;i<5;i++){const hx=gx+8+i*13,hy=94+Math.sin(tick*.12+i*1.4)*10-(i%2)*14;drawHeart(ctx,hx,hy,.65+(i%2)*.15);}
          if(Math.floor(elapsed/14)%2===0){drawSpark(ctx,gx+61,79,tick);drawSpark(ctx,gx+8,93,tick+3);}
        }
      }else{
        if(player.x>1500)drawBride(ctx,1900-camera,126,0);
        drawGroom(ctx,player.x-camera,player.y-27,!player.ground?3:Math.abs(player.vx)>.25?Math.floor(tick/7)%3:0,player.face);
      }
      // In-game status panel.
      rect(ctx,7,7,120,22,"#1d2b50dd");drawHeart(ctx,13,12,.7);ctx.fillStyle=C.white;ctx.font="bold 8px monospace";ctx.fillText(score+" / "+pickups.length+" MEMORIAS",28,22);
      rect(ctx,365,7,108,22,"#1d2b50dd");ctx.fillStyle=C.gold;ctx.font="bold 7px monospace";ctx.fillText("WORLD 01 · LOVE",373,21);
      particles.forEach(p=>rect(ctx,p.x-camera,p.y,3,3,p.color));
      if(won){rect(ctx,0,0,W,H,"#17254dcc");rect(ctx,62,63,356,125,"#fff2dc");rect(ctx,66,67,348,117,"#f4dfbd");ctx.fillStyle=C.dark;ctx.textAlign="center";ctx.font="bold 17px monospace";ctx.fillText("AVENTURA COMPLETA!",W/2,98);ctx.font="10px monospace";ctx.fillText("12 MEMORIAS REUNIDAS",W/2,121);ctx.fillText("E O VOSSO AMOR É O TESOURO.",W/2,139);ctx.font="18px monospace";ctx.fillText("♥  ♥  ♥",W/2,164);ctx.textAlign="left";}
    }
    function step(ts){
      const dt=Math.min((ts-last)/16.667||1,1.6);last=ts;tick+=dt;
      if(playing&&!won){
        const prevBottom=player.y+player.h;
        if(keys.left){player.vx-=.45*dt;player.face=-1;}if(keys.right){player.vx+=.45*dt;player.face=1;}
        if(!keys.left&&!keys.right)player.vx*=Math.pow(.78,dt);
        player.vx=clamp(player.vx,-2.65,2.65);player.x=clamp(player.x+player.vx*dt,0,worldWidth-player.w);
        player.vy+=GRAVITY*dt;player.y+=player.vy*dt;player.ground=false;
        platforms.forEach(p=>{const overlap=player.x+player.w>p.x&&player.x<p.x+p.w,bottom=player.y+player.h;if(overlap&&player.vy>=0&&prevBottom<=p.y+5&&bottom>=p.y&&bottom<=p.y+18){player.y=p.y-player.h;player.vy=0;player.ground=true;}});
        if(player.y>H+45)respawn();
        pickups.forEach(p=>{if(!p.got&&Math.abs(player.x+24-p.x)<17&&Math.abs(player.y+17-p.y)<22){p.got=true;score++;updateHud();sparkle(p.x,p.y);message.textContent="Memória encontrada! "+score+" de "+pickups.length+" ♥";}});
        enemies.forEach(e=>{if(!e.alive)return;e.x+=e.v*dt;if(e.x<e.min||e.x>e.max)e.v*=-1;
          if(player.x+player.w>e.x+3&&player.x<e.x+24&&player.y+player.h>e.y+5&&player.y<e.y+29){
            if(player.vy>1&&player.y+player.h<e.y+18){e.alive=false;player.vy=-5;sparkle(e.x,e.y,C.pink);message.textContent="Guardião ultrapassado!";}else{player.x=Math.max(checkpoint,player.x-55);player.vx=0;player.vy=-3;respawn();}
          }});
        if(player.x>970&&checkpoint<1000){checkpoint=1015;message.textContent="Ponto de controlo ativado! ✦";}
        camera=clamp(player.x-155,0,worldWidth-W);
        if(player.x>1880&&score===pickups.length&&!ending){ending=true;endingStarted=tick;playing=false;player.x=1820;player.vx=player.vy=0;player.face=1;camera=clamp(player.x-155,0,worldWidth-W);message.textContent="Ela viu o noivo chegar... e corre para os seus braços! ♥";}
        else if(player.x>1880&&score<pickups.length){player.x=1870;message.textContent="Faltam "+(pickups.length-score)+" memórias para abrir o castelo.";}
      }
      if(ending&&tick-endingStarted>225){ending=false;won=true;message.textContent="O amor venceu! Um abraço, muitos beijinhos e uma vida inteira juntos. ♥";}
      particles=particles.filter(p=>p.life-->0);draw();raf=requestAnimationFrame(step);
    }
    $("#start-game")?.addEventListener("click",()=>{if(lives<=0)reset();playing=true;overlay?.classList.add("hidden");message.textContent="A aventura começou! Recolham as 12 memórias." ;last=performance.now();});
    $("#reset-game")?.addEventListener("click",reset);
    function down(e){const k=e.key.toLowerCase();if(["arrowleft","arrowright","arrowup"," ","a","w"].includes(k))e.preventDefault();if(k==="arrowleft")keys.left=true;if(k==="arrowright")keys.right=true;if((k==="arrowup"||k===" "||k==="w"||k==="a")&&playing)jump();}
    function up(e){const k=e.key.toLowerCase();if(k==="arrowleft")keys.left=false;if(k==="arrowright")keys.right=false;}
    window.addEventListener("keydown",down);window.addEventListener("keyup",up);window.addEventListener("blur",()=>{keys.left=keys.right=false;});
    document.querySelectorAll(".mobile-controls button").forEach(btn=>{const k=btn.dataset.key;const press=e=>{e.preventDefault();if(k==="jump")jump();else keys[k]=true;};const release=e=>{e.preventDefault();if(k!=="jump")keys[k]=false;};btn.addEventListener("pointerdown",press);["pointerup","pointerleave","pointercancel"].forEach(ev=>btn.addEventListener(ev,release));});
    reset();last=performance.now();requestAnimationFrame(step);
  }

  // The inquiry form creates a private, copyable brief in this browser only.
  const form=$("#couple-form"),result=$("#form-result");
  form?.addEventListener("submit",e=>{e.preventDefault();if(!form.reportValidity())return;
    const labels={names:"Nomes",date:"Data do casamento",email:"E-mail",meet:"Como se conheceram",memories:"Memórias especiais",style:"Estilo visual",places:"Lugares e cenários",characters:"Personagens",challenges:"Desafios e referências",music:"Música e mensagem"};
    const data=new FormData(form),lines=["WEDDING ADVENTURE — RESUMO INICIAL",""];
    Object.entries(labels).forEach(([k,l])=>{const v=String(data.get(k)||"").trim();if(v)lines.push(l+": "+v);});
    const summary=lines.join("\n");result.hidden=false;result.replaceChildren();
    const heading=document.createElement("strong");heading.textContent="O vosso resumo está pronto!";
    const note=document.createElement("p");note.textContent="Copiem o texto para o guardar ou partilhar connosco.";
    const pre=document.createElement("pre");pre.textContent=summary;pre.style.cssText="white-space:pre-wrap;font:10px/1.7 DM Sans,sans-serif;background:#fff;padding:12px;max-height:220px;overflow:auto";
    const copy=document.createElement("button");copy.type="button";copy.textContent="Copiar respostas";
    copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(summary);copy.textContent="Copiado ✓";}catch(_){const a=document.createElement("textarea");a.value=summary;result.appendChild(a);a.select();document.execCommand("copy");a.remove();copy.textContent="Copiado ✓";}});
    result.append(heading,note,pre,copy);result.scrollIntoView({behavior:"smooth",block:"nearest"});
  });
})();