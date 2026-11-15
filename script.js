(() => {
  const $ = (s) => document.querySelector(s);
  const menuButton = $(".menu-toggle"), nav = $(".nav");
  menuButton?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.textContent = open ? "×" : "☰";
  });
  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open"); menuButton?.setAttribute("aria-expanded", "false");
    if (menuButton) menuButton.textContent = "☰";
  }));
  const year = $("#year"); if (year) year.textContent = new Date().getFullYear();

  const canvas = $("#game"), ctx = canvas?.getContext("2d");
  if (ctx) {
    const W = 960, H = 500, WORLD = 2600, gravity = .62;\n    ctx.imageSmoothingEnabled = false;
    let camera = 0, tick = 0, score = 0, started = false, won = false;
    let particles = [], lastTime = 0;
    const keys = { left:false, right:false };
    const player = { x:70, y:350, vx:0, vy:0, w:34, h:58, ground:false, face:1, inv:0 };
    const platforms = [
      {x:0,y:422,w:570},{x:650,y:370,w:170},{x:900,y:320,w:170},
      {x:1150,y:385,w:190},{x:1440,y:335,w:180},{x:1710,y:390,w:180},
      {x:1980,y:330,w:190},{x:2260,y:420,w:340}
    ];
    const memoryXs = [260,490,710,980,1240,1510,1780,2070];
    const memoryYs = [365,320,315,270,330,285,335,370];
    let memories = [];
    const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
    const rounded = (x,y,w,h,r,fill) => {
      ctx.fillStyle=fill; ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill();
    };
    const ellipse = (x,y,rx,ry,fill) => {
      ctx.fillStyle=fill; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill();
    };
    function heart(x,y,size,color) {
      ctx.save(); ctx.translate(x,y); ctx.scale(size/24,size/24); ctx.fillStyle=color;
      ctx.beginPath(); ctx.moveTo(0,10); ctx.bezierCurveTo(-30,-9,-16,-25,0,-12);
      ctx.bezierCurveTo(16,-25,30,-9,0,10); ctx.fill(); ctx.restore();
    }
    function cloud(x,y,s=1) {
      ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
      ctx.fillStyle="#fff8e9d9"; ctx.beginPath();
      ctx.arc(0,8,17,0,7); ctx.arc(23,0,24,0,7); ctx.arc(49,9,17,0,7);
      ctx.fill(); ctx.fillRect(-5,7,60,18); ctx.restore();
    }
    function hillLayer(offset, base, color, amp, step, phase) {
      ctx.save(); ctx.translate(-offset,0); ctx.fillStyle=color; ctx.beginPath();
      ctx.moveTo(-100,H);
      for(let x=-100;x<WORLD+500;x+=step) {
        const y=base+Math.sin(x*.004+phase)*amp+Math.sin(x*.011+phase)*amp*.28;
        ctx.quadraticCurveTo(x+step*.5,y-amp*.48,x+step,y);
      }
      ctx.lineTo(WORLD+600,H); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    function drawBackground() {
      const sky=ctx.createLinearGradient(0,0,0,H);
      sky.addColorStop(0,"#9dbfbd"); sky.addColorStop(.48,"#c9d7c6"); sky.addColorStop(1,"#f0d4ad");
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
      const sun=ctx.createRadialGradient(780,92,8,780,92,105);
      sun.addColorStop(0,"#fff0c9dd"); sun.addColorStop(1,"#fff0c900");
      ctx.fillStyle=sun; ctx.fillRect(670,0,220,210); ellipse(780,92,38,38,"#f7e6bd");
      for(let i=0;i<8;i++){
        let x=((i*190-tick*.18)%(W+180)+W+180)%(W+180)-70;
        cloud(x,65+(i%3)*48,.65+(i%2)*.18);
      }
      hillLayer(camera*.16,330,"#a7bda7",65,190,.4);
      hillLayer(camera*.34,372,"#829f89",53,210,2.1);
      ctx.save(); ctx.translate(-camera*.48,0);
      for(let x=90;x<WORLD+250;x+=175) drawFarTree(x,390,.62+(x%3)*.035);
      ctx.restore();
      hillLayer(camera*.62,415,"#63866f",24,230,1.1);
    }
    function drawFarTree(x,y,s) {
      ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
      rounded(-4,-8,8,40,3,"#80664e");
      for(let i=0;i<3;i++){ctx.fillStyle=["#668b70","#789b7b","#8ca886"][i];
        ctx.beginPath();ctx.moveTo(0,-88+i*24);ctx.quadraticCurveTo(-36,-58+i*22,-29,-27+i*20);
        ctx.quadraticCurveTo(0,-17+i*20,29,-27+i*20);ctx.quadraticCurveTo(36,-58+i*22,0,-88+i*24);ctx.fill();}
      ctx.restore();
    }
    function drawFlowers() {
      ctx.save(); ctx.translate(-camera*.82,0);
      for(let x=18;x<WORLD+200;x+=53){
        const y=418+Math.sin(x*.13)*2;
        ctx.strokeStyle="#55775d";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y+7);ctx.lineTo(x+1,y-2);ctx.stroke();
        for(let j=0;j<5;j++){const a=j*Math.PI*2/5;ellipse(x+Math.cos(a)*3,y-3+Math.sin(a)*3,2.2,2.2,j%2?"#f6e8d4":"#d98e87");}
        ellipse(x,y-3,1.6,1.6,"#d9b66f");
      }
      ctx.restore();
    }
    function drawCastle(x) {
      ctx.save(); ctx.translate(x,0);
      // soft castle shadow and stone base
      ellipse(74,425,125,13,"#354e3b35");
      rounded(12,286,125,137,8,"#d7c6a5");
      rounded(-18,247,49,176,5,"#ead9b9");
      rounded(119,230,49,193,5,"#e6d3b0");
      rounded(45,270,58,153,5,"#f0dfbd");
      const roof=(x,y,w,h)=>{ctx.fillStyle="#a96f6b";ctx.beginPath();ctx.moveTo(x-7,y);ctx.quadraticCurveTo(x+w/2,y-h-9,x+w+7,y);ctx.closePath();ctx.fill();};
      roof(-22,250,57,43);roof(115,234,57,49);roof(39,275,70,43);
      rounded(57,352,32,71,15,"#765d4c");
      rounded(21,315,18,29,8,"#8ba69a");rounded(112,315,18,29,8,"#8ba69a");
      rounded(69,291,13,24,6,"#91aa9b");
      ctx.strokeStyle="#c7b18c";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(74,235);ctx.lineTo(74,190);ctx.stroke();
      ctx.fillStyle="#c77f78";ctx.beginPath();ctx.moveTo(75,191);ctx.lineTo(111,201);ctx.lineTo(75,211);ctx.fill();
      heart(74,262,15,"#b77b70");
      ctx.restore();
    }
    function drawPlatforms() {
      platforms.forEach((p,i)=>{
        // warm soil with rounded grassy lip
        rounded(p.x,p.y+8,p.w,75,13,i===0?"#806d54":"#90785c");
        rounded(p.x,p.y+4,p.w,16,8,i===0?"#78936c":"#91a477");
        rounded(p.x,p.y,p.w,10,6,i===0?"#b2bd83":"#c1c391");
        ctx.save();ctx.beginPath();ctx.roundRect(p.x,p.y,p.w,15,7);ctx.clip();
        for(let x=p.x+12;x<p.x+p.w-5;x+=25){
          ctx.strokeStyle="#68845e";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,p.y+7);ctx.quadraticCurveTo(x-4,p.y-1,x-7,p.y-3);ctx.moveTo(x,p.y+7);ctx.quadraticCurveTo(x+3,p.y-2,x+6,p.y-4);ctx.stroke();
        }
        ctx.restore();
        // little stone flecks
        for(let x=p.x+22;x<p.x+p.w-12;x+=61) ellipse(x,p.y+35,2,1.5,"#c3a17b");
      });
    }
    function drawMemory(m) {
      if(m.got)return;
      const bob=Math.sin(tick*.055+m.phase)*6, y=m.y+bob;
      ctx.save();ctx.translate(m.x,y);
      const glow=ctx.createRadialGradient(0,0,2,0,0,34);
      glow.addColorStop(0,"#fff7d9cc");glow.addColorStop(1,"#fff7d900");
      ctx.fillStyle=glow;ctx.fillRect(-36,-36,72,72);
      ctx.rotate(Math.sin(tick*.035+m.phase)*.12);
      rounded(-17,-20,34,40,13,"#fff8e8");rounded(-13,-16,26,32,10,"#e9c98f");
      heart(0,-1,24,"#c77f7b");
      ctx.strokeStyle="#fff8e8";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,24,0,7);ctx.stroke();
      ctx.restore();
    }
    function drawPlayer() {
      const x=Math.round(player.x), y=Math.round(player.y), moving=Math.abs(player.vx)>.35;
      const step=moving&&player.ground?(Math.floor(tick/5)%2):0;
      const px=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(a),Math.round(b),w,h);};
      ctx.save();ctx.translate(x+17,y);
      if(player.face<0)ctx.scale(-1,1);
      // pixel-art shadow
      px(-12,59,25,4,"#304b4560");
      // shoes and legs
      px(-10,44,8,10,"#293b67");px(2,44,8,10,"#293b67");
      px(-12+(step?2:0),53,12,6,"#60483e");px(0-(step?2:0),53,13,6,"#60483e");
      // trousers and jacket
      px(-11,27,22,20,"#29457f");px(-7,27,14,19,"#f4e9df");
      px(-2,28,5,18,"#e94b78");px(-1,33,3,3,"#ffd36e");px(-1,40,3,3,"#ffd36e");
      // arms with tiny hand pixels
      px(-16,29,6,15,"#e94b78");px(10,29,6,15,"#e94b78");
      px(-16,42,6,5,"#e6ad88");px(10,42,6,5,"#e6ad88");
      // neck and face
      px(-5,21,10,8,"#d99a76");px(-11,5,22,20,"#e9b18c");
      // hair cap, fringe and side locks
      px(-12,3,24,8,"#56372f");px(-10,0,17,5,"#56372f");
      px(-13,8,5,12,"#56372f");px(8,8,5,10,"#56372f");
      px(-7,10,3,4,"#fff3dc");px(5,10,3,4,"#fff3dc");
      px(-6,11,2,3,"#27324d");px(6,11,2,3,"#27324d");
      px(1,17,5,2,"#a95d55");
      // small heart badge
      px(1,31,3,3,"#fff1c7");
      ctx.restore();
    }
    function draw() {
      drawBackground();
      ctx.save();ctx.translate(-camera,0);
      drawPlatforms();drawCastle(2380);memories.forEach(drawMemory);drawPlayer();ctx.restore();
      drawFlowers();
      particles.forEach(p=>{ctx.globalAlpha=clamp(p.life/34,0,1);ctx.fillStyle=p.color;ellipse(p.x-camera,p.y,p.r,p.r,p.color);ctx.globalAlpha=1;});
      // elegant in-game counter
      rounded(18,16,151,38,13,"#fff9ebdf");
      ctx.fillStyle="#425c4b";ctx.font="600 13px 'DM Sans',sans-serif";ctx.fillText("♡  "+score+" / 8",34,40);
      if(won){
        ctx.fillStyle="#18352c99";ctx.fillRect(0,0,W,H);
        ctx.textAlign="center";ctx.fillStyle="#fff7e9";ctx.font="500 37px 'Playfair Display',serif";
        ctx.fillText("E viveram uma grande aventura.",W/2,225);
        ctx.font="14px 'DM Sans',sans-serif";ctx.fillText("Todas as memórias encontradas. ♥",W/2,258);ctx.textAlign="left";
      }
    }
    function burst(x,y,color="#e8c27e"){
      for(let i=0;i<17;i++){const a=Math.PI*2*i/17,s=1+Math.random()*3;
        particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:34,r:2+Math.random()*2,color});}
    }
    function reset(){
      player.x=70;player.y=350;player.vx=player.vy=0;player.ground=false;player.face=1;
      camera=0;score=0;tick=0;won=false;started=false;particles=[];
      memories=memoryXs.map((x,i)=>({x,y:memoryYs[i],got:false,phase:i*.8}));
      $("#score").textContent="0 / 8";$("#game-message").textContent="Preparados para a aventura?";
      $("#game-overlay").classList.remove("hidden");
    }
    function jump(){if(started&&player.ground&&!won){player.vy=-13.2;player.ground=false;burst(player.x+17,player.y+58,"#f4e4c5");}}
    function update(time){
      const dt=Math.min((time-lastTime)/16.67||1,2);lastTime=time;tick+=dt;
      if(started&&!won){
        const accel=.72*dt, max=4.6;
        if(keys.left){player.vx-=accel;player.face=-1;}
        if(keys.right){player.vx+=accel;player.face=1;}
        if(!keys.left&&!keys.right)player.vx*=Math.pow(.78,dt);
        player.vx=clamp(player.vx,-max,max);
        const oldBottom=player.y+player.h;
        player.x=clamp(player.x+player.vx*dt,0,WORLD-player.w);
        player.vy+=gravity*dt;player.y+=player.vy*dt;player.ground=false;
        for(const p of platforms){
          const overlap=player.x+player.w>p.x&&player.x<p.x+p.w;
          const bottom=player.y+player.h;
          if(overlap&&player.vy>=0&&oldBottom<=p.y+8&&bottom>=p.y&&bottom<=p.y+22){
            player.y=p.y-player.h;player.vy=0;player.ground=true;
          }
        }
        if(player.y>H+100){player.x=Math.max(30,player.x-110);player.y=250;player.vy=0;player.inv=60;}
        if(player.inv>0)player.inv-=dt;
        memories.forEach(m=>{
          if(!m.got&&Math.abs((player.x+17)-m.x)<29&&Math.abs((player.y+25)-m.y)<38){
            m.got=true;score++;$("#score").textContent=score+" / 8";burst(m.x,m.y);
            $("#game-message").textContent="Memória encontrada! "+score+" de 8.";
          }
        });
        if(player.x>2320&&score===8){won=true;$("#game-message").textContent="Conseguiram! Todas as memórias reunidas. ♥";}
        camera=clamp(player.x-W*.36,0,WORLD-W);
      }
      particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.08*dt;p.life-=dt;});
      particles=particles.filter(p=>p.life>0);
      draw();requestAnimationFrame(update);
    }
    $("#start-game").addEventListener("click",()=>{
      started=true;$("#game-overlay").classList.add("hidden");
      $("#game-message").textContent="Recolham as 8 memórias e cheguem ao castelo!";
    });
    window.addEventListener("keydown",e=>{
      if(["ArrowLeft","ArrowRight","ArrowUp"," ","a","d","A","D","w","W"].includes(e.key))e.preventDefault();
      if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.left=true;
      if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.right=true;
      if(e.key==="ArrowUp"||e.key===" "||e.key.toLowerCase()==="w")jump();
    });
    window.addEventListener("keyup",e=>{
      if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.left=false;
      if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.right=false;
    });
    document.querySelectorAll(".mobile-controls button").forEach(btn=>{
      const k=btn.dataset.key;
      const down=e=>{e.preventDefault();if(k==="jump")jump();else keys[k]=true;};
      const up=e=>{e.preventDefault();if(k!=="jump")keys[k]=false;};
      btn.addEventListener("pointerdown",down);btn.addEventListener("pointerup",up);
      btn.addEventListener("pointerleave",up);btn.addEventListener("pointercancel",up);
    });
    $("#reset-game").addEventListener("click",reset);
    reset();requestAnimationFrame(update);
  }


  // Autonomous SNES-inspired pixel-art animation in the hero cover.
  const preview = $("#hero-game-preview"), pctx = preview?.getContext("2d");
  if (pctx) {
    pctx.imageSmoothingEnabled=false; const pw=480,ph=270; let frame=0;
    const r=(x,y,w,h,c)=>{pctx.fillStyle=c;pctx.fillRect(Math.round(x),Math.round(y),w,h);};
    function heroSprite(x,y,bride,step){
      pctx.save();pctx.translate(Math.round(x),Math.round(y));
      r(-9,29,19,3,"#24365b55");
      r(-7,22,5,7,bride?"#f4e9e5":"#273d75");r(2+(step?1:0),22,5,7,bride?"#f4e9e5":"#273d75");
      r(-9+(step?2:0),28,8,4,"#5b4038");r(1-(step?2:0),28,8,4,"#5b4038");
      if(bride){r(-8,13,16,11,"#fff0e8");r(-10,17,20,8,"#f5d9dc");r(-5,12,10,13,"#fffaf0");r(-2,14,4,3,"#e94d79");}
      else{r(-8,13,16,12,"#31549b");r(-3,13,6,13,"#e94778");r(-11,14,4,10,"#31549b");r(7,14,4,10,"#31549b");r(-12,22,5,4,"#e9b18c");r(8,22,5,4,"#e9b18c");}
      r(-3,9,6,6,"#e5a47e");r(-7,0,14,12,"#efb58f");
      if(bride){r(-8,-3,16,6,"#59362e");r(-9,0,4,10,"#59362e");r(5,0,4,10,"#59362e");r(-6,-5,12,3,"#59362e");r(-4,-7,3,3,"#f5e6a8");r(1,-7,3,3,"#f5e6a8");}
      else{r(-8,-3,16,5,"#56352e");r(-7,-6,12,4,"#56352e");r(-9,0,4,8,"#56352e");r(5,0,4,7,"#56352e");}
      r(-5,4,2,2,"#293451");r(3,4,2,2,"#293451");r(-2,8,4,1,"#a95d55");pctx.restore();
    }
    function drawPreview(){
      frame++;
      const sky=pctx.createLinearGradient(0,0,0,ph);sky.addColorStop(0,"#5e9be8");sky.addColorStop(.58,"#f4a8a9");sky.addColorStop(1,"#ffd28d");pctx.fillStyle=sky;pctx.fillRect(0,0,pw,ph);
      r(0,137,pw,133,"#547aa7");
      for(let i=0;i<8;i++){const x=i*70-20;r(x,95+(i%3)*15,46,100,"#7896bd");r(x+9,85+(i%3)*15,28,14,"#a8c0d3");}
      r(350,35,38,38,"#ffe9b0");r(342,43,54,22,"#ffe9b0");
      for(let i=0;i<4;i++){const x=((i*143-frame*.22)%(pw+90)+pw+90)%(pw+90)-40;r(x,48+i%2*22,30,7,"#fff0e7");r(x+7,41+i%2*22,20,7,"#fff0e7");r(x+3,55+i%2*22,34,5,"#fff0e7");}
      // Fairy-tale castle, layered forest and tiled platforms.
      r(307,91,105,82,"#e9c6a7");r(319,72,25,101,"#f7dfbf");r(372,66,27,107,"#f7dfbf");r(342,55,28,118,"#f3d7b8");
      r(315,65,33,12,"#9d557c");r(368,58,35,12,"#9d557c");r(337,45,38,13,"#9d557c");r(328,103,10,18,"#6b91bb");r(379,99,10,18,"#6b91bb");r(350,121,18,52,"#79516c");r(353,35,6,12,"#e9b45f");r(356,30,14,5,"#e94b78");
      for(let i=0;i<13;i++){const x=i*43-15,h=35+(i%4)*9;r(x,172-h,23,h+40,"#315d55");r(x-6,158-h,34,23,"#3f8062");r(x,150-h,20,18,"#65a86c");}
      r(0,209,pw,61,"#80543f");r(0,204,pw,10,"#4a8b4c");r(0,200,pw,7,"#80c75c");
      for(let x=0;x<pw;x+=24){r(x,216,22,4,"#a96e4d");r(x+2,226,20,4,"#654637");r(x+12,239,4,4,"#c58a59");r(x+4,201,4,3,"#c2e77b");}
      r(52,174,92,10,"#c78b64");r(52,184,92,5,"#80543f");r(67,166,24,9,"#e0b17b");
      for(let i=0;i<5;i++){const x=90+i*65,y=139+Math.sin(frame*.055+i)*6;r(x+3,y,7,5,"#ef4779");r(x,y+4,13,6,"#ef4779");r(x+3,y+10,7,4,"#ef4779");r(x+3,y+2,3,3,"#ffd2df");}
      for(let i=0;i<18;i++){const x=(i*31+frame*.12)%pw;r(x,195,3,8,"#367c49");r(x-2,192,4,4,"#f5d56d");r(x+2,191,4,4,"#f58ab0");}
      const walk=(frame*.42)%125,base=174+Math.sin(frame*.07)*2;
      heroSprite(170+walk,base,false,Math.floor(frame/7)%2);heroSprite(198+walk,base-1,true,Math.floor(frame/7+1)%2);
      for(let i=0;i<4;i++){const x=150+((frame*.8+i*31)%130),y=147+Math.sin(frame*.08+i)*15;r(x,y,3,3,"#fff2bd");}
      requestAnimationFrame(drawPreview);
    }
    drawPreview();
  }

  const form=$("#couple-form"),result=$("#form-result");
  form?.addEventListener("submit",e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const labels={names:"Nomes",date:"Data do casamento",email:"E-mail",meet:"Como se conheceram",memories:"Memórias especiais",style:"Estilo visual",places:"Lugares e cenários",characters:"Personagens",challenges:"Desafios e referências",music:"Música e mensagem"};
    const data=new FormData(form),lines=["WEDDING ADVENTURE — RESUMO INICIAL",""];
    Object.entries(labels).forEach(([k,l])=>{const v=String(data.get(k)||"").trim();if(v)lines.push(l+": "+v);});
    const summary=lines.join("\n");result.hidden=false;
    result.innerHTML="<strong>O vosso resumo está pronto!</strong><br>Copiem o texto para o guardar ou partilhar connosco.";
    const pre=document.createElement("pre");pre.textContent=summary;
    pre.style.cssText="white-space:pre-wrap;font:10px/1.7 DM Sans,sans-serif;background:#fff;padding:12px;max-height:220px;overflow:auto";
    const copy=document.createElement("button");copy.type="button";copy.textContent="Copiar respostas";
    copy.addEventListener("click",async()=>{
      try{await navigator.clipboard.writeText(summary);copy.textContent="Copiado ✓";}
      catch(_){const a=document.createElement("textarea");a.value=summary;result.appendChild(a);a.select();document.execCommand("copy");a.remove();copy.textContent="Copiado ✓";}
    });
    result.append(pre,copy);result.scrollIntoView({behavior:"smooth",block:"nearest"});
  });
})();