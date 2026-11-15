(() => {
  const $ = s => document.querySelector(s);
  const menuButton=$(".menu-toggle"),nav=$(".nav");
  menuButton?.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));menuButton.textContent=open?"×":"☰";});
  nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menuButton?.setAttribute("aria-expanded","false");if(menuButton)menuButton.textContent="☰";}));
  const year=$("#year");if(year)year.textContent=new Date().getFullYear();

  // 16-bit pixel-art renderer shared by the cover preview and playable demo.
  const palette={sky1:"#5796df",sky2:"#b9c9ee",sun:"#fff0bd",far:"#8197bd",mount:"#506d91",leaf1:"#245c55",leaf2:"#347c60",leaf3:"#5ba46b",soil:"#85533f",soil2:"#ad704b",grass:"#4c984d",grass2:"#83cf62",stone:"#d9c19b",pink:"#ef4779",cream:"#fff1dc",ink:"#27385e"};
  const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};
  function cloud(c,x,y){rect(c,x+4,y,19,5,"#fff7e8");rect(c,x,y+4,29,5,"#fff7e8");rect(c,x+9,y-4,12,6,"#fff7e8");}
  function tree(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);rect(c,-2,-2,5,19,"#694b42");rect(c,-10,-20,21,17,palette.leaf1);rect(c,-7,-27,15,13,palette.leaf2);rect(c,-3,-31,8,8,palette.leaf3);rect(c,-8,-16,5,4,"#78b86b");c.restore();}
  function castle(c,x){rect(c,x+7,145,62,48,"#ead8b9");rect(c,x,126,18,67,"#f6e5c7");rect(c,x+58,119,18,74,"#f6e5c7");rect(c,x+26,113,26,80,"#fff0d3");
    rect(c,x-2,119,22,5,"#a95678");rect(c,x+56,112,22,5,"#a95678");rect(c,x+24,106,30,6,"#a95678");
    rect(c,x+4,111,10,9,"#c87983");rect(c,x+62,104,10,9,"#c87983");rect(c,x+33,96,12,12,"#c87983");
    rect(c,x+31,164,17,29,"#79516a");rect(c,x+35,155,9,10,"#ffcf80");rect(c,x+38,87,3,10,"#f5d27e");rect(c,x+41,89,10,4,palette.pink);
    rect(c,x+12,139,6,10,"#6d9bb7");rect(c,x+60,133,6,10,"#6d9bb7");rect(c,x+34,125,7,10,"#6d9bb7");
  }
  function heart(c,x,y,scale=1){const p=scale;rect(c,x+2*p,y,3*p,2*p,"#ff9ab6");rect(c,x+8*p,y,3*p,2*p,"#ff9ab6");rect(c,x,y+2*p,13*p,5*p,palette.pink);rect(c,x+2*p,y+7*p,9*p,3*p,palette.pink);rect(c,x+4*p,y+10*p,5*p,2*p,palette.pink);rect(c,x+3*p,y+2*p,3*p,2*p,"#ffd5e1");}
  function sprite(c,x,y,bride,step=0,scale=1){c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
    rect(c,-7,22,15,3,"#25375a66");
    // shoes, legs and outfit with stepped 16-bit silhouette
    rect(c,-5,16,4,7,bride?"#fff0e8":"#263e78");rect(c,2+(step?1:0),16,4,7,bride?"#fff0e8":"#263e78");
    rect(c,-7+(step?1:0),22,7,3,"#67483d");rect(c,1-(step?1:0),22,7,3,"#67483d");
    if(bride){rect(c,-7,9,14,9,"#fff7e9");rect(c,-9,14,18,8,"#f1d4d9");rect(c,-5,9,10,13,"#fffaf0");rect(c,-2,12,4,3,palette.pink);rect(c,-9,10,3,8,"#e8c3c9");}
    else{rect(c,-7,9,14,10,"#31549b");rect(c,-2,9,5,12,palette.pink);rect(c,-9,10,3,8,"#31549b");rect(c,7,10,3,8,"#31549b");rect(c,-10,17,3,4,"#e9b18c");rect(c,8,17,3,4,"#e9b18c");}
    rect(c,-3,6,6,5,"#d99b79");rect(c,-6,-3,12,11,"#efb58e");
    if(bride){rect(c,-7,-5,14,5,"#59372f");rect(c,-8,-2,4,10,"#59372f");rect(c,4,-2,4,10,"#59372f");rect(c,-5,-7,10,3,"#59372f");rect(c,-4,-8,3,2,"#f6d66f");rect(c,1,-8,3,2,"#f6d66f");rect(c,5,-5,4,3,"#fff1dc");}
    else{rect(c,-7,-5,14,5,"#56352e");rect(c,-6,-8,11,4,"#56352e");rect(c,-8,-2,4,8,"#56352e");rect(c,4,-2,4,7,"#56352e");}
    rect(c,-4,1,2,2,palette.ink);rect(c,2,1,2,2,palette.ink);rect(c,-1,5,3,1,"#a95d55");c.restore();}
  function drawScene(c,w,h,camera,t,heroX,heroY,gameMode){
    const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,palette.sky1);sky.addColorStop(.62,palette.sky2);sky.addColorStop(1,"#f6c5a2");c.fillStyle=sky;c.fillRect(0,0,w,h);
    rect(c,0,0,w,2,"#ffffff66");
    // sunset glow
    rect(c,365,35,30,30,palette.sun);rect(c,359,41,42,18,palette.sun);rect(c,370,29,20,42,"#fff0bd55");
    for(let i=0;i<6;i++){const x=((i*103-t*.18)%(w+50)+w+50)%(w+50)-30;cloud(c,x,35+(i%3)*17);}
    // distant mountains, layered pixel ridges
    for(let i=0;i<8;i++){const x=i*75-(camera*.16%75);rect(c,x,103+(i%3)*9,49,85,palette.far);rect(c,x+9,93+(i%3)*9,31,13,"#b6c9df");rect(c,x+20,86+(i%3)*9,12,8,"#d7e2e9");}
    for(let i=0;i<13;i++){const x=i*52-(camera*.32%52);tree(c,x,178+(i%2)*3,.72+(i%3)*.12);}
    // castle visible in the distance and destination at right
    if(!gameMode) castle(c,385);
    // platform field
    const plats=[{x:0,y:211,w:210},{x:246,y:181,w:80},{x:354,y:157,w:78},{x:465,y:188,w:92},{x:600,y:163,w:82},{x:716,y:181,w:92},{x:855,y:153,w:85},{x:1000,y:185,w:105},{x:1160,y:164,w:95},{x:1320,y:205,w:180}];
    for(const p of plats){const sx=p.x-camera;if(sx<-130||sx>w+50)continue;
      rect(c,sx,p.y+6,p.w,43,palette.soil);rect(c,sx,p.y+3,p.w,8,palette.grass);rect(c,sx,p.y,p.w,5,palette.grass2);
      for(let tx=sx+7;tx<sx+p.w-4;tx+=16){rect(c,tx,p.y+13,8,3,"#a96d4b");rect(c,tx+4,p.y+28,3,3,"#68483d");rect(c,tx+1,p.y+1,3,3,"#b4e77b");}
    }
    // foreground flowers and tiny grass
    for(let i=0;i<45;i++){const x=((i*37-camera*.9)%(w+30)+w+30)%(w+30);rect(c,x,205,2,7,"#33734d");rect(c,x-2,202,3,3,i%2?"#ff9bb4":"#ffe18a");}
    // floating heart pickups
    if(!gameMode) for(let i=0;i<8;i++){const hx=[90,285,393,510,650,765,900,1085][i]-camera,hy=[183,154,130,160,137,155,127,158][i]+Math.sin(t*.07+i)*2;if(hx>-20&&hx<w+20)heart(c,hx,hy,1);}
    // animated couple
    const walk=Math.sin(t*.16)*1.3, bob=Math.sin(t*.11)*1.4;
    sprite(c,heroX-camera,heroY+bob,false,Math.floor(t/7)%2,1);
    sprite(c,heroX-camera-18,heroY+bob,true,Math.floor(t/7+1)%2,1);
    if(!gameMode){heart(c,heroX-camera-5,heroY-22+Math.sin(t*.1)*2,1);}
    // foreground border highlights
    rect(c,0,h-3,w,3,"#ffffff55");
  }

  // Hero cover preview loops a little playable-looking vignette.
  const preview=$("#hero-game-preview"),pctx=preview?.getContext("2d");
  if(pctx){pctx.imageSmoothingEnabled=false;let frame=0;function previewLoop(){frame++;drawScene(pctx,480,270,0,frame,175+(frame*.24)%95,178,false);requestAnimationFrame(previewLoop);}previewLoop();}

  // Playable side-scrolling platform game.
  const canvas=$("#game"),ctx=canvas?.getContext("2d");
  if(ctx){
    const W=480,H=250,WORLD=1500,GRAVITY=.42;
    ctx.imageSmoothingEnabled=false;
    const platforms=[{x:0,y:211,w:210},{x:246,y:181,w:80},{x:354,y:157,w:78},{x:465,y:188,w:92},{x:600,y:163,w:82},{x:716,y:181,w:92},{x:855,y:153,w:85},{x:1000,y:185,w:105},{x:1160,y:164,w:95},{x:1320,y:205,w:180}];
    const pickups=[90,285,393,510,650,765,900,1085].map((x,i)=>({x,y:[183,154,130,160,137,155,127,158][i],got:false}));
    const keys={left:false,right:false};
    let player={x:28,y:187,vx:0,vy:0,w:13,h:24,ground:false,face:1};
    let camera=0,frame=0,score=0,playing=false,won=false,raf=0,last=0,particles=[];
    const scoreEl=$("#score"),overlay=$("#game-overlay"),message=$("#game-message"),level=$("#level-name");
    const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
    function reset(){player={x:28,y:187,vx:0,vy:0,w:13,h:24,ground:false,face:1};camera=0;frame=0;score=0;playing=false;won=false;particles=[];pickups.forEach(p=>p.got=false);keys.left=keys.right=false;scoreEl.textContent="0 / 8";message.textContent="Recolham 8 corações e cheguem ao castelo.";overlay.classList.remove("hidden");if(level)level.textContent="THE MEADOW";}
    function jump(){if(playing&&!won&&player.ground){player.vy=-7.9;player.ground=false;}}
    function burst(x,y){for(let i=0;i<10;i++){const a=i*Math.PI/5;particles.push({x,y,vx:Math.cos(a)*1.2,vy:Math.sin(a)*1.2-1,life:24});}}
    function draw(){
      drawScene(ctx,W,H,camera,frame,player.x+player.w/2,player.y,false);
      // cover the scene with a camera-translated world layer for moving pickups/platforms/castle
      // redraw pickups in camera space; the background is intentionally parallax.
      pickups.forEach(p=>{if(p.got)return;const x=p.x-camera,y=p.y+Math.sin(frame*.08+p.x)*2;if(x>-12&&x<W+12)heart(ctx,x,y,1);});
      // draw the controlled hero over the background couple
      sprite(ctx,player.x-camera,player.y,false,Math.floor(frame/7)%2,1);
      sprite(ctx,player.x-camera-18,player.y+1,true,Math.floor(frame/7+1)%2,1);
      // HUD in-game
      rect(ctx,7,7,90,20,"#18294dcc");rect(ctx,11,10,82,14,"#fff4df");heart(ctx,15,12,.65);ctx.fillStyle="#29395e";ctx.font="bold 8px monospace";ctx.fillText(score+" / 8",29,21);
      rect(ctx,365,7,108,20,"#18294dcc");ctx.fillStyle="#fff4df";ctx.font="bold 7px monospace";ctx.fillText("WORLD 1 - LOVE",372,20);
      if(won){rect(ctx,0,0,W,H,"#17254dcc");rect(ctx,77,74,326,105,"#fff1dc");rect(ctx,80,77,320,99,"#f7dfb9");ctx.fillStyle="#25365d";ctx.textAlign="center";ctx.font="bold 15px monospace";ctx.fillText("LEVEL COMPLETE!",W/2,105);ctx.font="9px monospace";ctx.fillText("A VOSSA AVENTURA COMECou!",W/2,125);ctx.fillText("♥ 8/8 MEMORIAS ♥",W/2,145);ctx.textAlign="left";}
      particles.forEach(p=>{rect(ctx,p.x-camera,p.y,2,2,"#ffe18a");});
    }
    function update(ts){
      const dt=Math.min((ts-last)/16.67||1,1.7);last=ts;frame+=dt;
      if(playing&&!won){
        const prevBottom=player.y+player.h;
        if(keys.left){player.vx-=.42*dt;player.face=-1;}if(keys.right){player.vx+=.42*dt;player.face=1;}
        if(!keys.left&&!keys.right)player.vx*=Math.pow(.78,dt);
        player.vx=clamp(player.vx,-2.5,2.5);player.x=clamp(player.x+player.vx*dt,0,WORLD-player.w);
        player.vy+=GRAVITY*dt;player.y+=player.vy*dt;player.ground=false;
        for(const p of platforms){const overlap=player.x+player.w>p.x&&player.x<p.x+p.w;const bottom=player.y+player.h;if(overlap&&player.vy>=0&&prevBottom<=p.y+4&&bottom>=p.y&&bottom<=p.y+16){player.y=p.y-player.h;player.vy=0;player.ground=true;}}
        if(player.y>H+40){player.x=Math.max(8,player.x-90);player.y=120;player.vy=0;player.vx=0;message.textContent="Ops! Tentem novamente. ♥";}
        pickups.forEach(p=>{if(!p.got&&Math.abs(player.x+6-p.x)<13&&Math.abs(player.y+11-p.y)<16){p.got=true;score++;scoreEl.textContent=score+" / 8";burst(p.x,p.y);message.textContent="Coração encontrado! "+score+" de 8."; }});
        camera=clamp(player.x-150,0,WORLD-W);
        if(player.x>1390&&score===8){won=true;message.textContent="Conseguiram! O castelo é vosso. ♥";}
      }
      particles=particles.filter(p=>p.life-->0);draw();raf=requestAnimationFrame(update);
    }
    $("#start-game")?.addEventListener("click",()=>{playing=true;overlay.classList.add("hidden");message.textContent="Recolham os 8 corações e cheguem ao castelo!";});
    $("#reset-game")?.addEventListener("click",reset);
    function keyDown(e){const k=e.key.toLowerCase();if(["arrowleft","arrowright","arrowup"," ","a","d","w"].includes(k))e.preventDefault();if(k==="arrowleft"||k==="a")keys.left=true;if(k==="arrowright"||k==="d")keys.right=true;if((k==="arrowup"||k===" "||k==="w")&&playing)jump();}
    function keyUp(e){const k=e.key.toLowerCase();if(k==="arrowleft"||k==="a")keys.left=false;if(k==="arrowright"||k==="d")keys.right=false;}
    window.addEventListener("keydown",keyDown);window.addEventListener("keyup",keyUp);
    document.querySelectorAll(".mobile-controls button").forEach(btn=>{const key=btn.dataset.key;const down=e=>{e.preventDefault();if(key==="jump")jump();else keys[key]=true;};const up=e=>{e.preventDefault();if(key!=="jump")keys[key]=false;};btn.addEventListener("pointerdown",down);["pointerup","pointerleave","pointercancel"].forEach(ev=>btn.addEventListener(ev,up));});
    reset();last=performance.now();requestAnimationFrame(update);
  }

  // The inquiry form builds a copyable local brief; it does not submit to a server.
  const form=$("#couple-form"),result=$("#form-result");
  form?.addEventListener("submit",e=>{e.preventDefault();if(!form.reportValidity())return;
    const labels={names:"Nomes",date:"Data do casamento",email:"E-mail",meet:"Como se conheceram",memories:"Memórias especiais",style:"Estilo visual",places:"Lugares e cenários",characters:"Personagens",challenges:"Desafios e referências",music:"Música e mensagem"};
    const data=new FormData(form),lines=["WEDDING ADVENTURE — RESUMO INICIAL",""];
    Object.entries(labels).forEach(([k,l])=>{const v=String(data.get(k)||"").trim();if(v)lines.push(l+": "+v);});
    const summary=lines.join("\n");result.hidden=false;result.innerHTML="<strong>O vosso resumo está pronto!</strong><br>Copiem o texto para o guardar ou partilhar connosco.";
    const pre=document.createElement("pre");pre.textContent=summary;pre.style.cssText="white-space:pre-wrap;font:10px/1.7 DM Sans,sans-serif;background:#fff;padding:12px;max-height:220px;overflow:auto";
    const copy=document.createElement("button");copy.type="button";copy.textContent="Copiar respostas";
    copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(summary);copy.textContent="Copiado ✓";}catch(_){const a=document.createElement("textarea");a.value=summary;result.appendChild(a);a.select();document.execCommand("copy");a.remove();copy.textContent="Copiado ✓";}});
    result.append(pre,copy);result.scrollIntoView({behavior:"smooth",block:"nearest"});
  });
})();