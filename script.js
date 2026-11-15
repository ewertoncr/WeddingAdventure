(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  menuButton?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.textContent = open ? "×" : "☰";
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    if (menuButton) menuButton.textContent = "☰";
  }));
  document.getElementById("year").textContent = new Date().getFullYear();

  // Small original platform-game prototype. All artwork is drawn on canvas.
  const canvas = document.getElementById("game");
  const ctx = canvas?.getContext("2d");
  if (ctx) {
    const W = 900, H = 390, floor = 326;
    const keys = {left:false,right:false};
    const player = {x:75,y:260,vx:0,vy:0,w:28,h:39,onGround:false};
    let hearts = [], score = 0, frame = 0, won = false;
    const platforms = [{x:0,y:floor,w:W,h:64},{x:220,y:270,w:120,h:14},{x:435,y:225,w:125,h:14},{x:665,y:270,w:115,h:14}];
    const reset = () => {
      player.x=75;player.y=260;player.vx=0;player.vy=0;score=0;frame=0;won=false;
      hearts=[{x:270,y:235,taken:false},{x:490,y:190,taken:false},{x:720,y:235,taken:false},{x:835,y:290,taken:false}];
      document.getElementById("game-message").textContent="Ajude o casal a encontrar os corações!";
    };
    reset();
    function roundedRect(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
    function drawHeart(x,y,size,color){
      ctx.save();ctx.translate(x,y);ctx.scale(size/20,size/20);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,7);ctx.bezierCurveTo(-22,-7,-12,-20,0,-9);ctx.bezierCurveTo(12,-20,22,-7,0,7);ctx.fill();ctx.restore();
    }
    function draw(){
      ctx.clearRect(0,0,W,H);
      const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#dce9dc");sky.addColorStop(1,"#f4e9d4");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#f0d49e";ctx.beginPath();ctx.arc(755,75,38,0,Math.PI*2);ctx.fill();
      // distant rolling hills
      ctx.fillStyle="#b8cbb2";ctx.beginPath();ctx.moveTo(0,260);ctx.quadraticCurveTo(170,120,350,250);ctx.quadraticCurveTo(550,100,740,240);ctx.quadraticCurveTo(830,190,900,230);ctx.lineTo(900,390);ctx.lineTo(0,390);ctx.fill();
      // little clouds
      [[110,72],[390,92],[610,50]].forEach(([x,y])=>{ctx.fillStyle="#fffaf0";ctx.beginPath();ctx.arc(x,y,13,0,7);ctx.arc(x+17,y-8,17,0,7);ctx.arc(x+36,y,12,0,7);ctx.fill()});
      // castle silhouette
      ctx.fillStyle="#d8c29d";ctx.fillRect(790,190,75,95);ctx.fillRect(805,160,18,35);ctx.fillRect(839,150,18,45);
      ctx.fillStyle="#b77e70";ctx.beginPath();ctx.moveTo(800,190);ctx.lineTo(827,160);ctx.lineTo(854,190);ctx.fill();ctx.beginPath();ctx.moveTo(802,162);ctx.lineTo(814,142);ctx.lineTo(826,162);ctx.fill();ctx.beginPath();ctx.moveTo(836,152);ctx.lineTo(848,132);ctx.lineTo(860,152);ctx.fill();
      // platforms / grass
      platforms.forEach((p,i)=>{roundedRect(p.x,p.y,p.w,p.h,5,i===0?"#527b5d":"#9aab79");ctx.fillStyle=i===0?"#76966b":"#c2c58d";ctx.fillRect(p.x,p.y,p.w,5);});
      // tiny flowers
      for(let i=20;i<900;i+=58){ctx.fillStyle="#f7e7ca";ctx.beginPath();ctx.arc(i,floor+19,3,0,7);ctx.fill();ctx.fillStyle="#d99e91";ctx.beginPath();ctx.arc(i+5,floor+27,2,0,7);ctx.fill();}
      hearts.forEach(h=>{if(!h.taken){drawHeart(h.x,h.y+Math.sin(frame/13+h.x)*3,19,"#bd7774");}});
      // player: a cute little adventurer
      ctx.fillStyle="#384f42";ctx.fillRect(player.x+4,player.y+17,20,21);
      ctx.fillStyle="#e8bd9b";ctx.beginPath();ctx.arc(player.x+14,player.y+11,11,0,7);ctx.fill();
      ctx.fillStyle="#6b4c3d";ctx.fillRect(player.x+4,player.y+1,20,7);
      ctx.fillStyle="#fff8ed";ctx.fillRect(player.x+8,player.y+10,3,3);ctx.fillRect(player.x+18,player.y+10,3,3);
      ctx.fillStyle="#b87970";ctx.fillRect(player.x+2,player.y+22,24,5);
      ctx.fillStyle="#34453a";ctx.fillRect(player.x+4,player.y+36,8,4);ctx.fillRect(player.x+17,player.y+36,8,4);
      // HUD
      roundedRect(17,15,112,31,8,"#fffaf0dd");ctx.fillStyle="#405647";ctx.font="bold 12px DM Sans, sans-serif";ctx.fillText("♡  "+score+" / 4",31,35);
      if(won){ctx.fillStyle="#24372fcc";ctx.fillRect(0,0,W,H);ctx.fillStyle="#fff8ed";ctx.textAlign="center";ctx.font="bold 34px Playfair Display,serif";ctx.fillText("Amor em todas as fases!",W/2,H/2-5);ctx.font="15px DM Sans,sans-serif";ctx.fillText("Conseguiste todos os corações. ♥",W/2,H/2+28);ctx.textAlign="left";}
    }
    function update(){
      frame++;
      if(!won){
        player.vx=keys.left?-3.2:keys.right?3.2:0;
        player.x=Math.max(0,Math.min(W-player.w,player.x+player.vx));
        player.vy=Math.min(10,player.vy+.48);
        const oldBottom=player.y+player.h;player.y+=player.vy;player.onGround=false;
        platforms.forEach(p=>{
          if(player.x+player.w>p.x&&player.x<p.x+p.w&&oldBottom<=p.y+5&&player.y+player.h>=p.y&&player.vy>=0){
            player.y=p.y-player.h;player.vy=0;player.onGround=true;
          }
        });
        hearts.forEach(h=>{
          if(!h.taken&&Math.abs((player.x+player.w/2)-h.x)<23&&Math.abs((player.y+player.h/2)-h.y)<27){
            h.taken=true;score++;
            document.getElementById("game-message").textContent=score===4?"Conseguiram! O amor venceu esta fase!":"Coração encontrado! Continuem a aventura.";
            if(score===4)won=true;
          }
        });
        if(player.y>H){player.x=75;player.y=220;player.vy=0;}
      }
      draw();requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
    function jump(){if(player.onGround&&!won){player.vy=-10.5;player.onGround=false;}}
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
    document.querySelectorAll(".touch-controls button").forEach(btn=>{
      const key=btn.dataset.key;
      const start=e=>{e.preventDefault();if(key==="jump")jump();else keys[key]=true;};
      const end=e=>{e.preventDefault();if(key!=="jump")keys[key]=false;};
      btn.addEventListener("pointerdown",start);btn.addEventListener("pointerup",end);
      btn.addEventListener("pointerleave",end);btn.addEventListener("pointercancel",end);
    });
    document.getElementById("reset-game").addEventListener("click",reset);
  }

  // This first prototype intentionally keeps form data on the visitor's device.
  const form=document.getElementById("couple-form");
  const result=document.getElementById("form-result");
  form?.addEventListener("submit",async event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const labels={
      names:"Nomes",date:"Data do casamento",email:"E-mail",meet:"Como se conheceram",
      memories:"Momentos marcantes",style:"Estilo visual",places:"Lugares e cenários",
      characters:"Personagens",challenges:"Desafios e referências",music:"Música e mensagem"
    };
    const data=new FormData(form);
    const summary=["WEDDING ADVENTURE — RESUMO INICIAL",""];
    Object.entries(labels).forEach(([key,label])=>{
      const value=String(data.get(key)||"").trim();
      if(value)summary.push(label+": "+value);
    });
    const text=summary.join("\n");
    result.hidden=false;
    result.innerHTML="<strong>O vosso resumo está pronto!</strong><br>Copiem o texto abaixo para o guardar ou partilhar connosco.";
    const pre=document.createElement("pre");pre.textContent=text;pre.style.cssText="white-space:pre-wrap;font:11px/1.6 DM Sans,sans-serif;background:#fffdf8;padding:12px;max-height:220px;overflow:auto";
    const copy=document.createElement("button");copy.type="button";copy.textContent="Copiar respostas";
    copy.addEventListener("click",async()=>{
      try{await navigator.clipboard.writeText(text);copy.textContent="Copiado ✓";}
      catch(_){const area=document.createElement("textarea");area.value=text;result.appendChild(area);area.select();document.execCommand("copy");area.remove();copy.textContent="Copiado ✓";}
    });
    result.append(pre,copy);
    result.scrollIntoView({behavior:"smooth",block:"nearest"});
  });
})();