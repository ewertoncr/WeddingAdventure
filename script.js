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
    const W = 960, H = 500, WORLD = 2600, gravity = .62;
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
      const x=player.x,y=player.y, moving=Math.abs(player.vx)>.35;
      const run=moving&&player.ground?Math.sin(tick*.28):0;
      const bob=player.ground?(moving?Math.abs(Math.sin(tick*.28))*1.8:Math.sin(tick*.07)*1.2):0;
      ctx.save();ctx.translate(x+17,y+bob);
      if(player.face<0){ctx.scale(-1,1);}
      // shadow
      ctx.globalAlpha=player.ground?.22:.12;ellipse(0,61,18,5,"#24392e");ctx.globalAlpha=1;
      // legs and shoes
      ctx.save();ctx.translate(0,39);
      ctx.rotate(run*.24);rounded(-10,0,8,17,4,"#405246");rounded(-12,13,14,7,4,"#795b49");
      ctx.restore();
      ctx.save();ctx.translate(7,39);ctx.rotate(-run*.24);
      rounded(0,0,8,17,4,"#405246");rounded(-2,13,14,7,4,"#795b49");ctx.restore();
      // body coat
      ctx.fillStyle="#f1e7d5";ctx.beginPath();ctx.moveTo(-10,22);ctx.quadraticCurveTo(-13,30,-15,48);
      ctx.quadraticCurveTo(0,53,15,48);ctx.quadraticCurveTo(13,30,10,22);ctx.closePath();ctx.fill();
      ctx.fillStyle="#c4877e";ctx.beginPath();ctx.moveTo(-2,22);ctx.lineTo(3,22);ctx.lineTo(5,47);ctx.lineTo(-4,47);ctx.closePath();ctx.fill();
      ctx.fillStyle="#d9b97e";ellipse(0,31,2,2,"#d9b97e");ellipse(0,38,2,2,"#d9b97e");
      // arms
      ctx.save();ctx.translate(-10,27);ctx.rotate(moving?Math.sin(tick*.28)*.28:-.08);
      rounded(-3,0,7,19,4,"#f1e7d5");ellipse(0,18,4,4,"#d9a681");ctx.restore();
      ctx.save();ctx.translate(10,27);ctx.rotate(moving?-Math.sin(tick*.28)*.28:.08);
      rounded(-3,0,7,19,4,"#f1e7d5");ellipse(0,18,4,4,"#d9a681");ctx.restore();
      // neck and head
      rounded(-4,17,8,8,3,"#d9a681");
      ellipse(0,10,12,14,"#e2b18d");
      // hair silhouette and fringe
      ctx.fillStyle="#49372f";ctx.beginPath();ctx.moveTo(-12,10);
      ctx.quadraticCurveTo(-15,-8,-2,-7);ctx.quadraticCurveTo(10,-12,13,1);
      ctx.quadraticCurveTo(14,8,10,13);ctx.quadraticCurveTo(8,4,5,3);
      ctx.quadraticCurveTo(-1,7,-8,4);ctx.lineTo(-10,16);ctx.closePath();ctx.fill();
      // ear, eye, smile, highlights
      ellipse(-11,11,2.4,3.3,"#d9a681");ellipse(10,11,2.4,3.3,"#d9a681");
      ellipse(5,10,1.4,1.8,"#342f2a");
      ctx.strokeStyle="#9a5d51";ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(3,16,3,.2,1.7);ctx.stroke();
      ctx.fillStyle="#fff0d9";ctx.beginPath();ctx.arc(-4,0,3,0,7);ctx.fill();
      // tiny hair curl
      ctx.strokeStyle="#715044";ctx.lineWidth=2;ctx.beginPath();ctx.arc(-3,-5,5,3.3,5.8);ctx.stroke();
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