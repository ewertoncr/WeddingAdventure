(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const menuButton=$(".menu-toggle"),nav=$(".nav");
  menuButton?.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));menuButton.textContent=open?"×":"☰";});
  nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menuButton?.setAttribute("aria-expanded","false");if(menuButton)menuButton.textContent="☰";}));
  const year=$("#year");if(year)year.textContent=new Date().getFullYear();

  // Original pixel-art engine: crisp tile rendering, layered scenery and an animated couple atlas.
  const C={sky:"#76a9e5",sky2:"#d9d9e8",sun:"#fff0b9",cloud:"#fff8e8",far:"#9bafd0",far2:"#728fb2",hill:"#507c72",hill2:"#396653",leaf:"#2c694f",leaf2:"#43865a",leaf3:"#78ad61",trunk:"#775044",soil:"#89553e",soil2:"#a96b49",grass:"#4b984f",grass2:"#83ce68",stone:"#e8d4ad",gold:"#ffe18a",pink:"#ed4d80",dark:"#24345b",white:"#fff5e6",shadow:"#263b5c"};
  const couple=new Image();couple.src="/WeddingAdventure/assets/sprites/couple-atlas.webp?v=3";
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
    // Illustrated parallax environment: layered mountains, forest, river and a living castle valley.
    const sky=c.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,"#5d91c8");sky.addColorStop(.48,"#b8d8e7");sky.addColorStop(.78,"#f5d7c4");sky.addColorStop(1,"#f8e5c9");
    c.fillStyle=sky;c.fillRect(0,0,w,h);
    const glow=c.createRadialGradient(360-camera*.035,42,4,360-camera*.035,42,110);
    glow.addColorStop(0,"#fff7d8bb");glow.addColorStop(1,"#fff7d800");c.fillStyle=glow;c.fillRect(220,0,260,170);
    c.fillStyle="#fff0c9";c.beginPath();c.arc(365-camera*.035,42,17,0,Math.PI*2);c.fill();
    // distant cloud banks drifting independently
    for(let i=0;i<6;i++){let x=((i*112-t*.13)%(w+150)+w+150)%(w+150)-70,y=25+(i%3)*17;
      c.fillStyle="#fff9ed88";c.beginPath();c.ellipse(x,y,31,8,0,0,Math.PI*2);c.ellipse(x+18,y-4,20,9,0,0,Math.PI*2);c.ellipse(x-16,y-2,17,7,0,0,Math.PI*2);c.fill();}
    // distant mountain silhouettes with atmospheric haze
    for(let i=0;i<7;i++){const x=i*94-(camera*.12%94),base=157+(i%3)*8;
      c.fillStyle=i%2?"#8baec0":"#769cb4";c.beginPath();c.moveTo(x-12,base);c.lineTo(x+40,base-75-(i%2)*12);c.lineTo(x+96,base);c.closePath();c.fill();
      c.fillStyle="#e7f0e9aa";c.beginPath();c.moveTo(x+25,base-54);c.lineTo(x+40,base-75-(i%2)*12);c.lineTo(x+56,base-52);c.lineTo(x+45,base-57);c.lineTo(x+39,base-49);c.closePath();c.fill();}
    // valley and forest in multiple parallax layers
    for(let i=0;i<6;i++){const x=i*110-(camera*.22%110),y=145+(i%2)*9;
      c.fillStyle=i%2?"#6e9a83":"#5f8e7b";c.beginPath();c.ellipse(x+48,y+30,72,43,0,0,Math.PI*2);c.fill();}
    for(let i=0;i<15;i++){const x=i*39-(camera*.38%39),y=185+(i%3)*5,sc=.55+(i%4)*.12;
      c.save();c.translate(x,y);c.scale(sc,sc);c.fillStyle="#6d5848";c.fillRect(-3,-24,6,29);
      const g=c.createRadialGradient(0,-36,2,0,-36,23);g.addColorStop(0,"#91b982");g.addColorStop(1,i%2?"#376c59":"#477c61");
      c.fillStyle=g;c.beginPath();c.arc(0,-36,22,0,Math.PI*2);c.fill();c.beginPath();c.arc(-12,-29,14,0,Math.PI*2);c.arc(12,-28,15,0,Math.PI*2);c.fill();c.restore();}
    // river bends through the valley; highlights move with the current
    c.save();c.globalAlpha=.9;c.fillStyle="#6bb8c8";c.beginPath();c.moveTo(0,185);c.bezierCurveTo(95,166,126,215,220,199);c.bezierCurveTo(320,182,365,214,480,190);c.lineTo(480,250);c.lineTo(0,250);c.closePath();c.fill();
    c.strokeStyle="#d5f5e9aa";c.lineWidth=3;c.beginPath();c.moveTo(-10,204);c.bezierCurveTo(95,181,142,226,235,211);c.bezierCurveTo(328,194,386,224,495,202);c.stroke();
    for(let i=0;i<10;i++){let x=(i*57+t*1.15)%510-15,y=211+(i%3)*8;c.strokeStyle="#e9ffff88";c.lineWidth=1.4;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+9,y-2,x+18,y);c.stroke();}c.restore();
    // soft meadow floor and organic platforms
    c.fillStyle="#557f59";c.fillRect(0,205,w,45);
    c.fillStyle="#7fa76a";c.beginPath();c.moveTo(0,205);c.quadraticCurveTo(90,196,175,207);c.quadraticCurveTo(270,216,360,202);c.quadraticCurveTo(420,197,480,205);c.lineTo(480,220);c.lineTo(0,220);c.closePath();c.fill();
    platforms.forEach((p,i)=>{const x=p.x-camera;if(x>w+30||x+p.w< -30)return;
      const y=p.y;c.save();c.shadowColor="#294c3c55";c.shadowBlur=5;c.shadowOffsetY=4;
      const soil=c.createLinearGradient(0,y,0,y+54);soil.addColorStop(0,"#9a7655");soil.addColorStop(1,"#614d43");
      c.fillStyle=soil;c.beginPath();c.roundRect(x,y+4,p.w,48,5);c.fill();c.shadowColor="transparent";
      const turf=c.createLinearGradient(0,y-2,0,y+9);turf.addColorStop(0,"#a8cf79");turf.addColorStop(1,"#4e8d58");
      c.fillStyle=turf;c.beginPath();c.roundRect(x,y,p.w,10,4);c.fill();
      for(let q=10;q<p.w-5;q+=19){const sway=Math.sin(t*.06+q)*2;c.strokeStyle="#c6df8c";c.lineWidth=1.4;c.beginPath();c.moveTo(x+q,y+2);c.quadraticCurveTo(x+q-2+sway,y-5,x+q+2+sway,y-7);c.stroke();}
      c.restore();});
    // waterfall and foam with animated droplets
    const fx=865-camera*.22;
    if(fx>-65&&fx<w+50){c.fillStyle="#d9f5f3";c.beginPath();c.moveTo(fx-7,153);c.quadraticCurveTo(fx+12,148,fx+35,155);c.lineTo(fx+28,207);c.quadraticCurveTo(fx+12,214,fx-1,207);c.closePath();c.fill();
      const water=c.createLinearGradient(fx,155,fx+28,205);water.addColorStop(0,"#8dd4df");water.addColorStop(.5,"#d5f5f0");water.addColorStop(1,"#55aebf");c.fillStyle=water;c.fillRect(fx+2,157,25,48);
      for(let k=0;k<7;k++){const yy=157+(t*1.8+k*9)%49;c.fillStyle="#ffffffbb";c.beginPath();c.ellipse(fx+4+(k*7)%22,yy,1.4,3,0,0,Math.PI*2);c.fill();}
      c.fillStyle="#e5fff0aa";c.beginPath();c.ellipse(fx+14,207,27,5,0,0,Math.PI*2);c.fill();}
    // destination castle, built into the landscape
    const castleX=1900-camera;
    if(castleX>-160&&castleX<w+160){const x=castleX,g=205;
      c.fillStyle="#d8c4ad";c.beginPath();c.moveTo(x-10,g);c.lineTo(x+8,g-79);c.lineTo(x+129,g-79);c.lineTo(x+148,g);c.closePath();c.fill();
      const wall=c.createLinearGradient(x,g-80,x+140,g);wall.addColorStop(0,"#fff0d9");wall.addColorStop(1,"#c9b29b");c.fillStyle=wall;c.fillRect(x+15,g-83,112,83);
      for(const [tx,tw,th] of [[x,31,111],[x+104,34,126]]){c.fillStyle="#f3dfc7";c.fillRect(tx,g-th,tw,th);c.fillStyle="#9c6176";c.beginPath();c.moveTo(tx-5,g-th);c.lineTo(tx+tw/2,g-th-23);c.lineTo(tx+tw+5,g-th);c.closePath();c.fill();c.fillStyle="#b8d5d7";c.fillRect(tx+10,g-th+28,10,18);}
      c.fillStyle="#77566a";c.beginPath();c.roundRect(x+58,g-51,28,51,[14,14,0,0]);c.fill();
      c.fillStyle="#d8b987";c.fillRect(x+69,g-51,4,51);
      c.fillStyle="#a7c9c9";c.fillRect(x+43,g-69,12,19);c.fillRect(x+91,g-69,12,19);
      // pennants flutter
      c.strokeStyle="#765b55";c.lineWidth=2;c.beginPath();c.moveTo(x+132,g-132);c.lineTo(x+132,g-102);c.stroke();
      c.fillStyle="#e66b83";c.beginPath();c.moveTo(x+133,g-131);c.quadraticCurveTo(x+151,g-128+Math.sin(t*.08)*3,x+148,g-117);c.lineTo(x+133,g-119);c.fill();
      // garden arch, flower garlands and lanterns
      c.strokeStyle="#765846";c.lineWidth=5;c.beginPath();c.moveTo(x-15,g);c.lineTo(x-15,g-63);c.quadraticCurveTo(x+43,g-100,x+99,g-63);c.lineTo(x+99,g);c.stroke();
      for(let k=0;k<19;k++){const px=x-13+k*6,py=g-68-Math.sin(k/18*Math.PI)*25+Math.sin(t*.05+k)*1.5;
        c.fillStyle=["#f7b4bf","#fff0dc","#d9a5c8","#e8c879"][k%4];c.beginPath();c.arc(px,py,3.1,0,Math.PI*2);c.fill();
        c.fillStyle="#64895b";c.beginPath();c.arc(px+2,py-3,1.8,0,Math.PI*2);c.fill();}
    }
    // birds, drifting petals and grass that reacts to the breeze
    for(let i=0;i<4;i++){const bx=((i*137+t*.55)%(w+60))-20,by=75+(i%3)*17+Math.sin(t*.04+i)*3;c.strokeStyle="#496b7a99";c.lineWidth=1.2;c.beginPath();c.moveTo(bx-4,by+2);c.quadraticCurveTo(bx,by-3,bx+4,by+2);c.stroke();}
    for(let i=0;i<16;i++){const px=((i*47-t*(.18+i%3*.03))%(w+20)+w+20)%(w+20)-10,py=120+(i*23%88)+Math.sin(t*.04+i)*5;c.save();c.translate(px,py);c.rotate(t*.012+i);c.fillStyle=i%2?"#f4b6c5aa":"#fff0d5bb";c.beginPath();c.ellipse(0,0,2,4,0,0,Math.PI*2);c.fill();c.restore();}
    // meadow flowers with swaying stems
    for(let i=0;i<34;i++){const x=((i*29-camera*.8)%(w+20)+w+20)%(w+20)-10,y=202+(i%3)*3,sway=Math.sin(t*.07+i)*2.2;
      c.strokeStyle="#39704d";c.lineWidth=1;c.beginPath();c.moveTo(x,y+5);c.quadraticCurveTo(x+sway,y+1,x+sway,y-2);c.stroke();
      c.fillStyle=i%3===0?"#fff0c9":i%2?"#f4a9bd":"#d8c4f1";c.beginPath();c.arc(x+sway,y-3,2.2,0,Math.PI*2);c.fill();}
    // The scene breathes in the cover and reacts to the hero's movement.
    if(preview)hearts.forEach((p,i)=>{const x=p.x-camera,y=p.y+Math.sin(t*.06+i)*4;if(x>-20&&x<w+20)drawHeart(c,x,y,1);});
    if(player){const px=player.x-camera;for(let i=0;i<4;i++){const gx=px+((i*13+t*.7)%58)-20,gy=player.y+31+Math.sin(t*.18+i)*2;c.strokeStyle="#c4e58c";c.lineWidth=1.5;c.beginPath();c.moveTo(gx,gy);c.quadraticCurveTo(gx-3,gy-5,gx+Math.sin(t*.1+i)*4,gy-8);c.stroke();}}
    if(player)drawGroom(c,player.x-camera,player.y-27,Math.abs(player.vx)>.25?1+Math.floor(t/7)%3:0,player.face||1);
    else if(preview){const x=178+Math.sin(t*.015)*14,y=139+Math.sin(t*.09)*2;drawGroom(c,x,y,Math.floor(t/8)%3,1);drawBride(c,x+35,y,Math.floor(t/10)%4);}
    c.fillStyle="#fff7e8aa";c.fillRect(0,h-3,w,3);
  }
  // Detailed illustrated characters, rendered as layered human figures rather than tiny atlas tiles.
  function drawPersonBase(c,x,y,kind,pose=0,face=1){
    c.save();c.translate(Math.round(x+24),Math.round(y+32));if(face<0)c.scale(-1,1);
    const bride=kind==="bride",jump=pose===3||pose===4,step=pose===1||pose===2;
    const bob=jump?-5:step?Math.sin(pose*Math.PI/2)*1.5:Math.sin(pose*.7)*.5;
    c.translate(0,bob);
    // soft contact shadow
    c.fillStyle="#253a4c44";c.beginPath();c.ellipse(0,30,jump?12:15,3,0,0,Math.PI*2);c.fill();
    if(bride){
      // veil and flowing hair
      c.fillStyle="#fff8f0cc";c.beginPath();c.moveTo(-10,-24);c.quadraticCurveTo(-25,-7,-18,19);c.quadraticCurveTo(0,28,18,17);c.quadraticCurveTo(21,-6,9,-25);c.closePath();c.fill();
      const dress=c.createLinearGradient(-12,-5,13,29);dress.addColorStop(0,"#fffefa");dress.addColorStop(.55,"#f4e7e3");dress.addColorStop(1,"#d9c9d2");
      c.fillStyle=dress;c.beginPath();c.moveTo(-8,-5);c.quadraticCurveTo(-17,8,-20,28);c.quadraticCurveTo(0,34,20,28);c.quadraticCurveTo(16,9,8,-5);c.closePath();c.fill();
      c.strokeStyle="#c8a9b5";c.lineWidth=1;c.beginPath();c.moveTo(-10,13);c.quadraticCurveTo(0,17,10,13);c.stroke();
      c.fillStyle="#e7c9d0";for(let i=0;i<7;i++){c.beginPath();c.arc(-11+i*3.5,18+(i%2)*5,1.1,0,Math.PI*2);c.fill();}
      // shoulders, neck and face
      c.fillStyle="#e6b18f";c.fillRect(-3,-11,6,8);c.fillStyle="#f0c4a4";c.beginPath();c.ellipse(0,-19,8.2,10,0,0,Math.PI*2);c.fill();
      c.fillStyle="#5b392f";c.beginPath();c.arc(0,-23,9,Math.PI,Math.PI*2);c.quadraticCurveTo(11,-18,7,-12);c.quadraticCurveTo(4,-17,2,-18);c.quadraticCurveTo(-7,-13,-9,-17);c.closePath();c.fill();
      c.strokeStyle="#5b392f";c.lineWidth=3;c.beginPath();c.moveTo(-7,-18);c.quadraticCurveTo(-14,-4,-10,8);c.stroke();
      c.fillStyle="#d9b76c";c.beginPath();c.arc(-5,-28,1.5,0,Math.PI*2);c.arc(0,-30,1.6,0,Math.PI*2);c.arc(5,-28,1.5,0,Math.PI*2);c.fill();
      c.fillStyle="#68453b";c.beginPath();c.arc(-3,-18,1,0,Math.PI*2);c.arc(3,-18,1,0,Math.PI*2);c.fill();
      c.strokeStyle="#a96b6b";c.lineWidth=1;c.beginPath();c.arc(0,-15,2.5,.2,Math.PI-.2);c.stroke();
      // arms and delicate bouquet
      c.strokeStyle="#e6b18f";c.lineWidth=4;c.lineCap="round";c.beginPath();c.moveTo(-8,-4);c.quadraticCurveTo(-14,4,-10,10);c.moveTo(8,-4);c.quadraticCurveTo(14,4,10,10);c.stroke();
      c.fillStyle="#6b9a69";c.fillRect(9,8,2,9);c.fillStyle="#f0a9bb";for(let i=0;i<3;i++){c.beginPath();c.arc(8+i*3,7+(i%2)*2,2,0,Math.PI*2);c.fill();}
    }else{
      // navy tailored suit, jacket, shirt and tie
      const suit=c.createLinearGradient(-12,-7,12,27);suit.addColorStop(0,"#405d91");suit.addColorStop(.55,"#243b6b");suit.addColorStop(1,"#18294e");
      c.fillStyle=suit;c.beginPath();c.moveTo(-9,-7);c.lineTo(9,-7);c.quadraticCurveTo(15,8,13,27);c.lineTo(-13,27);c.quadraticCurveTo(-15,8,-9,-7);c.fill();
      c.fillStyle="#f8f2e9";c.beginPath();c.moveTo(-5,-7);c.lineTo(0,1);c.lineTo(5,-7);c.lineTo(2,12);c.lineTo(-2,12);c.closePath();c.fill();
      c.fillStyle="#bd4962";c.beginPath();c.moveTo(0,-1);c.lineTo(3,5);c.lineTo(0,17);c.lineTo(-3,5);c.closePath();c.fill();
      c.strokeStyle="#d7c6aa";c.lineWidth=1;c.beginPath();c.moveTo(-7,1);c.lineTo(-2,8);c.moveTo(7,1);c.lineTo(2,8);c.stroke();
      c.fillStyle="#e6b18f";c.fillRect(-3,-13,6,8);c.beginPath();c.ellipse(0,-20,8.5,10,0,0,Math.PI*2);c.fill();
      c.fillStyle="#49352e";c.beginPath();c.arc(0,-24,9,Math.PI,Math.PI*2);c.quadraticCurveTo(10,-22,7,-15);c.lineTo(4,-17);c.lineTo(0,-18);c.lineTo(-5,-16);c.lineTo(-9,-18);c.closePath();c.fill();
      c.fillStyle="#49352e";for(const [hx,hy,r] of [[-6,-28,3],[-2,-30,3],[3,-29,3],[7,-26,2.5]]){c.beginPath();c.arc(hx,hy,r,0,Math.PI*2);c.fill();}
      c.fillStyle="#3b2a27";c.beginPath();c.arc(-3,-20,1,0,Math.PI*2);c.arc(3,-20,1,0,Math.PI*2);c.fill();
      c.strokeStyle="#9e5e58";c.lineWidth=1;c.beginPath();c.arc(0,-16,2.5,.2,Math.PI-.2);c.stroke();
      c.strokeStyle="#e6b18f";c.lineWidth=4;c.lineCap="round";c.beginPath();c.moveTo(-9,-3);c.lineTo(-13,8+(step?2:0));c.moveTo(9,-3);c.lineTo(13,8-(step?2:0));c.stroke();
      c.fillStyle="#202c45";c.fillRect(-12,25,9,5);c.fillRect(3,25,9,5);
      c.fillStyle="#d6b38c";c.fillRect(-12,29,10,3);c.fillRect(3,29,10,3);
    }
    // subtle highlight along silhouette
    c.restore();
  }
  function drawGroom(c,x,y,frame=0,face=1){drawPersonBase(c,x,y,"groom",frame,face);}
  function drawBride(c,x,y,frame=0){drawPersonBase(c,x,y,"bride",frame,1);}
  function drawHug(c,x,y,frame=0){
    const bob=Math.sin(frame*Math.PI/3)*1.5;
    drawPersonBase(c,x+8,y,"groom",frame%3,1);
    drawPersonBase(c,x+31,y,"bride",frame%4,1);
    c.save();c.strokeStyle="#e8b18e";c.lineWidth=4;c.lineCap="round";
    c.beginPath();c.moveTo(x+19,y+24+bob);c.quadraticCurveTo(x+34,y+5+bob,x+45,y+20+bob);c.stroke();c.restore();
  }
  function drawCouple(c,x,y,frame,face=1){drawGroom(c,x,y,frame,face);drawBride(c,x+31,y,frame);}
  // Animated cover preview.
  const preview=$("#hero-game-preview"),pctx=preview?.getContext("2d");
  if(pctx){pctx.imageSmoothingEnabled=true;let tick=0;const loop=()=>{tick++;drawWorld(pctx,480,270,0,tick,true);requestAnimationFrame(loop);};loop();}

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
        drawGroom(ctx,player.x-camera,player.y-27,!player.ground?3:Math.abs(player.vx)>.25?1+Math.floor(tick/6)%3:5+Math.floor(tick/12)%4,player.face);
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