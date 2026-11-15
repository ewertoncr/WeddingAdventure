(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const menuButton=$(".menu-toggle"),nav=$(".nav");
  menuButton?.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));menuButton.textContent=open?"×":"☰";});
  nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menuButton?.setAttribute("aria-expanded","false");if(menuButton)menuButton.textContent="☰";}));
  const year=$("#year");if(year)year.textContent=new Date().getFullYear();

  // Original pixel-art engine: crisp tile rendering, layered scenery and an animated couple atlas.
  const C={sky:"#76a9e5",sky2:"#d9d9e8",sun:"#fff0b9",cloud:"#fff8e8",far:"#9bafd0",far2:"#728fb2",hill:"#507c72",hill2:"#396653",leaf:"#2c694f",leaf2:"#43865a",leaf3:"#78ad61",trunk:"#775044",soil:"#89553e",soil2:"#a96b49",grass:"#4b984f",grass2:"#83ce68",stone:"#e8d4ad",gold:"#ffe18a",pink:"#ed4d80",dark:"#24345b",white:"#fff5e6",shadow:"#263b5c"};
  const couple=new Image();couple.decoding="async";couple.src="/WeddingAdventure/assets/sprites/wedding-couple-16bit.svg?v=1";
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
    // Rebuilt meadow: varied silhouettes, layered depth and textured pixel terrain.
    const px=(n)=>Math.round(n);
    const poly=(points,color)=>{
      c.fillStyle=color;c.beginPath();c.moveTo(px(points[0][0]),px(points[0][1]));
      for(let i=1;i<points.length;i++)c.lineTo(px(points[i][0]),px(points[i][1]));
      c.closePath();c.fill();
    };
    const cloud=(x,y,scale=1)=>{
      const q=scale;rect(c,x+8*q,y,18*q,5*q,"#f7fbf5");rect(c,x+2*q,y+4*q,31*q,7*q,"#fff9ed");
      rect(c,x+8*q,y+10*q,20*q,3*q,"#dcecf0");rect(c,x+4*q,y+2*q,8*q,3*q,"#fffdf5");
    };
    const tree=(x,base,scale=1,variant=0,front=false)=>{
      const q=scale, trunk=front?"#684638":"#765443",leaf=variant%3===0?"#397b5d":variant%3===1?"#438967":"#347456";
      rect(c,x+10*q,base-29*q,7*q,31*q,trunk);rect(c,x+7*q,base-7*q,13*q,4*q,"#523b35");
      // layered, stepped canopy with highlights and shaded underside
      rect(c,x+1*q,base-45*q,25*q,16*q,leaf);
      rect(c,x+5*q,base-53*q,18*q,12*q,variant%2?"#4b956b":"#55a071");
      rect(c,x-3*q,base-39*q,33*q,13*q,leaf);
      rect(c,x+4*q,base-57*q,10*q,7*q,variant%2?"#70b77a":"#68ad73");
      rect(c,x+2*q,base-36*q,7*q,5*q,"#8bc987");
      rect(c,x+19*q,base-31*q,8*q,5*q,front?"#2d684f":"#2e7055");
      rect(c,x+7*q,base-20*q,4*q,3*q,"#8b6248");
    };
    // Sky with a warm horizon, distant haze and small pixel clouds.
    rect(c,0,0,w,h,"#78b7e5");rect(c,0,0,w,74,"#8bc8ed");rect(c,0,74,w,43,"#b9dfe8");
    rect(c,0,117,w,33,"#9acbdc");
    const sunX=365-camera*.025;
    rect(c,sunX-5,27,28,28,"#ffe5a0");rect(c,sunX,22,18,38,"#ffe5a0");
    rect(c,sunX+4,31,11,18,"#fff2c7");
    for(let i=0;i<5;i++){const x=((i*127-camera*.035-t*.08)%(w+120)+w+120)%(w+120)-55;cloud(x,23+(i%3)*21,.72+(i%2)*.18);}
    // Far mountains: distinct stepped profiles rather than repeated vertical blocks.
    for(let i=0;i<5;i++){
      const x=i*126-(camera*.10%126)-18,base=158+(i%2)*7,peak=49+(i%3)*12;
      poly([[x,base],[x+17,base-20],[x+29,base-peak+17],[x+42,base-peak],[x+54,base-peak+18],[x+70,base-12],[x+88,base]],i%2?"#87abc5":"#91b5cd");
      poly([[x+29,base-peak+17],[x+42,base-peak],[x+54,base-peak+18],[x+48,base-peak+13],[x+42,base-peak+9],[x+36,base-peak+19]],"#edf2e9");
      poly([[x+54,base-peak+18],[x+70,base-12],[x+88,base],[x+60,base]],"#779fbd");
      rect(c,x+8,base-16,30,4,"#a8c4d2");
    }
    // Rolling hills with small village roofs, layered at different speeds.
    for(let i=0;i<6;i++){
      const x=i*96-(camera*.19%96)-10,y=167+(i%3)*5;
      poly([[x-10,205],[x+3,y+8],[x+27,y-8],[x+48,y+1],[x+68,y-11],[x+91,y+8],[x+105,205]],i%2?"#6f9f82":"#78a88a");
      rect(c,x+25,y+1,25,13,"#688e83");rect(c,x+29,y-5,17,6,"#e8d7bd");
      rect(c,x+34,y+5,4,9,"#b7d8d4");rect(c,x+43,y+5,4,9,"#b7d8d4");
    }
    // A winding stream broken into stepped banks, not a straight blue stripe.
    const waterOffset=(camera*.28)%190;
    for(let i=-1;i<5;i++){
      const x=i*190-waterOffset;
      poly([[x,176],[x+34,170],[x+78,174],[x+116,166],[x+151,173],[x+190,168],[x+190,191],[x+151,197],[x+111,190],[x+75,198],[x+34,191],[x,196]],"#4da8c4");
      poly([[x+8,178],[x+38,174],[x+75,178],[x+112,171],[x+145,177],[x+178,173],[x+178,178],[x+144,182],[x+112,176],[x+76,184],[x+38,180],[x+8,184]],"#a5e0df");
      rect(c,x+44,188,27,2,"#7dd0d7");rect(c,x+129,186,22,2,"#78c8d3");
    }
    // Forest in three parallax bands; individual tree silhouettes vary in scale.
    for(let i=0;i<13;i++){
      const x=i*48-(camera*.34%48)-12,base=202+(i%3)*2;
      tree(x,base,.72+(i%3)*.10,i,false);
    }
    for(let i=0;i<8;i++){
      const x=i*72-(camera*.49%72)-18,base=205+(i%2)*2;
      tree(x,base,.95+(i%3)*.12,i+2,false);
    }
    // Distant flower garden, tiny fence posts and warm lanterns.
    for(let i=0;i<16;i++){
      const x=((i*43-camera*.55)%(w+40)+w+40)%(w+40)-20,y=197+(i%3)*3;
      rect(c,x,y-7,2,8,"#397b53");rect(c,x-3,y-9,4,4,i%3?"#f3a8bd":"#ffe5a0");
      rect(c,x+2,y-11,4,4,i%2?"#fff0df":"#d9b4e3");rect(c,x+1,y-4,2,3,"#7dbd73");
    }
    // Continuous ground slab, with strata, stones, roots and grass edge.
    rect(c,0,205,w,45,"#704a3c");rect(c,0,205,w,6,"#3d8750");rect(c,0,211,w,4,"#83c86c");
    rect(c,0,215,w,5,"#5b9e58");rect(c,0,220,w,30,"#704a3c");
    for(let x=0;x<w;x+=24){
      rect(c,x+2,224,10,3,"#895a43");rect(c,x+14,237,8,3,"#5c4039");
      rect(c,x+5,245,13,3,"#80513f");
      if((x/24)%3===0){rect(c,x+8,218,3,5,"#a46b4c");rect(c,x+11,220,2,3,"#b77a55");}
    }
    // Decorative stepping stones and tall grass tufts on the lip.
    for(let i=0;i<26;i++){
      const x=((i*31-camera*.78)%(w+30)+w+30)%(w+30)-15;
      rect(c,x,202-(i%3)*2,3,8,"#34794d");rect(c,x+3,205-(i%2)*3,3,5,"#6bb65e");
      if(i%2===0)rect(c,x+7,207,3,2,"#b5d88a");
    }
    // Platforms receive layered turf, soil strata, stones and hanging roots.
    platforms.forEach((p,i)=>{
      const x=Math.round(p.x-camera);if(x>w+30||x+p.w< -30)return;const y=p.y;
      rect(c,x,y+5,p.w,49,"#704a3c");rect(c,x,y+5,p.w,4,"#9a6549");
      rect(c,x,y,p.w,7,"#438d50");rect(c,x,y,p.w,3,"#a4d66e");
      rect(c,x+3,y+8,p.w-6,2,"#8b5b43");
      for(let q=8;q<p.w-5;q+=23){rect(c,x+q,y-5,3,7,"#39834d");rect(c,x+q+3,y-3,3,5,"#70b85f");}
      for(let q=11;q<p.w-10;q+=31){
        rect(c,x+q,y+19,9,3,"#9a6348");rect(c,x+q+14,y+34,7,3,"#563e39");
        if((q+i)%2<1)rect(c,x+q+4,y+47,2,6,"#4d7650");
      }
      rect(c,x+2,y+12,Math.max(0,p.w-4),1,"#b77a53");
    });
    // Waterfall and stone bridge landmark.
    const fx=865-camera*.22;
    if(fx>-55&&fx<w+45){
      rect(c,fx-5,148,43,7,"#dcece0");rect(c,fx,155,34,50,"#4daec6");
      rect(c,fx+5,155,4,45,"#8bd7df");rect(c,fx+22,155,4,45,"#348eae");
      for(let k=0;k<8;k++){const yy=155+(t*1.5+k*7)%47;rect(c,fx+4+(k*7)%25,yy,3,5,"#d8f8ed");}
      rect(c,fx-13,201,52,5,"#b9dcd0");rect(c,fx-8,206,42,3,"#5a9eae");
    }
    // Castle destination: layered stonework, rose windows, roof tiles and a flower arch.
    const cx=1900-camera,g=205;
    if(cx>-175&&cx<w+175){
      rect(c,cx+13,g-88,118,88,"#d9c3a4");rect(c,cx+19,g-83,106,83,"#f3dfbf");
      rect(c,cx+3,g-113,38,113,"#e6d0ae");rect(c,cx+107,g-129,39,129,"#e6d0ae");
      rect(c,cx+7,g-108,30,5,"#fff0d7");rect(c,cx+111,g-124,31,5,"#fff0d7");
      rect(c,cx-2,g-119,48,9,"#9c5870");rect(c,cx+103,g-135,47,9,"#9c5870");
      for(let k=0;k<4;k++){rect(c,cx+5+k*10,g-130,5,13,"#c47d82");rect(c,cx+111+k*9,g-146,5,13,"#c47d82");}
      rect(c,cx+44,g-105,57,105,"#fff0d7");rect(c,cx+51,g-53,43,53,"#75516a");
      rect(c,cx+58,g-78,10,14,"#83c3d2");rect(c,cx+78,g-78,10,14,"#83c3d2");
      rect(c,cx+60,g-76,3,10,"#e7f5e9");rect(c,cx+80,g-76,3,10,"#e7f5e9");
      rect(c,cx+64,g-50,16,50,"#a87572");rect(c,cx+67,g-48,10,48,"#e0b779");
      rect(c,cx+69,g-56,6,6,"#fff0a8");
      // stone joints and ivy
      for(let k=0;k<5;k++){rect(c,cx+21+(k%2)*47,g-67+k*13,17,2,"#d2b996");}
      for(let k=0;k<13;k++){const ax=cx-10+k*9,ay=g-77-Math.round(Math.sin(k/12*Math.PI)*17);
        rect(c,ax,ay,5,5,["#ed9eb6","#fff0d8","#d5a6d8","#f4cf7c"][k%4]);rect(c,ax+1,ay+5,3,4,"#579564");
      }
      rect(c,cx+134,g-158,3,27,"#55465a");rect(c,cx+137,g-155,20,11,"#d84f79");rect(c,cx+137,g-144,15,4,"#f7b5c5");
    }
    // Floating petals and foreground glints move independently from the camera.
    for(let i=0;i<12;i++){
      const x=((i*53-t*(.18+i%3*.035))%(w+24)+w+24)%(w+24)-12,y=92+(i*23%93)+Math.sin(t*.025+i)*3;
      rect(c,x,y,3,3,i%2?"#ffe5ec":"#fff0c6");
    }
    if(preview)hearts.forEach((p,i)=>{const x=p.x-camera,y=p.y+Math.sin(t*.06+i)*3;if(x>-20&&x<w+20)drawHeart(c,x,y,1);});
    if(player){
      const px=player.x-camera;
      for(let i=0;i<4;i++){const gx=px+((i*13+t*.7)%58)-20,gy=player.y+31;rect(c,gx,gy,2,3,"#d6ef9c");}
      drawGroom(c,player.x-camera,player.y-27,Math.abs(player.vx)>.25?1+Math.floor(t/7)%3:0,player.face);
    }else if(preview){
      const x=178+Math.sin(t*.015)*14,y=139+Math.sin(t*.09)*2;
      drawGroom(c,x,y,Math.floor(t/8)%3,1);drawBride(c,x+35,y,Math.floor(t/10)%4);
    }
    rect(c,0,h-3,w,3,"#fff5df");
  }
  // Hand-built pixel sprites on a 2px grid: expressive faces, wedding clothes and readable silhouettes.
  function drawPersonBase(c,x,y,kind,pose=0,face=1){
    const bride=kind==="bride";
    // Original 48x64 sprite atlas: five distinct poses for each character.
    // The hand-built renderer below remains as a fallback if the SVG cannot load.
    if(couple.complete&&couple.naturalWidth>=240){
      const frame=pose===1?1:pose===2?2:pose===3?3:pose===4?4:pose>=5?([0,1,0,2][(pose-5)%4]):0;
      const sx=frame*48,sy=bride?64:0;
      c.save();
      if(face<0){c.translate(Math.round(x+48),Math.round(y));c.scale(-1,1);c.drawImage(couple,sx,sy,48,64,0,0,48,64);}
      else c.drawImage(couple,sx,sy,48,64,Math.round(x),Math.round(y),48,64);
      c.restore();
      return;
    }
    c.save();c.translate(Math.round(x+24),Math.round(y+32));if(face<0)c.scale(-1,1);
    const jump=pose===3||pose===4,step=pose===1||pose===2,idle=pose>=5;
    const idleBob=idle?[0,-1,0,1][(pose-5)%4]:0;
    const bob=jump?-5:step?(pose===1?-1:1):idleBob;c.translate(0,bob);
    // contact shadow
    rect(c,-13,29,26,3,"#293b5a55");rect(c,-8,32,16,2,"#293b5a33");
    if(bride){
      // veil and dark chestnut hair
      rect(c,-10,-28,20,5,"#fff8f0");rect(c,-14,-23,5,27,"#f4e9eb");rect(c,9,-23,5,27,"#f4e9eb");
      rect(c,-9,-26,18,6,"#50352f");rect(c,-11,-22,22,5,"#50352f");rect(c,-10,-17,4,13,"#654239");rect(c,7,-17,4,15,"#654239");
      // face, eyes and smile
      rect(c,-7,-20,14,13,"#edbd9e");rect(c,-8,-18,3,7,"#d99f86");rect(c,5,-18,3,7,"#d99f86");
      rect(c,-4,-15,2,2,"#49332f");rect(c,3,-15,2,2,"#49332f");rect(c,-2,-10,5,2,"#a85d69");
      // pearl tiara
      rect(c,-7,-25,3,3,"#f4d88c");rect(c,-1,-28,3,4,"#fff0b4");rect(c,5,-25,3,3,"#f4d88c");
      // gown and bodice
      rect(c,-6,-7,12,5,"#fffaf2");rect(c,-9,-3,18,12,"#f6edf0");rect(c,-12,8,24,9,"#fffaf6");
      rect(c,-15,17,30,8,"#f5e5ed");rect(c,-18,25,36,5,"#e9d2df");rect(c,-12,12,24,2,"#d8b8c8");
      rect(c,-2,-5,4,14,"#e9d5df");rect(c,-13,20,4,4,"#fffdf6");rect(c,9,20,4,4,"#fffdf6");
      // arms raised on celebration frames, otherwise open for the embrace
      if(jump){rect(c,-14,-3,5,10,"#edbd9e");rect(c,-18,-12,5,11,"#edbd9e");rect(c,-19,-15,5,4,"#edbd9e");rect(c,9,-3,5,10,"#edbd9e");rect(c,13,-12,5,11,"#edbd9e");rect(c,14,-15,5,4,"#edbd9e");}
      else if(step){const arm=pose===1?2:-1;rect(c,-13,-2+arm,5,13,"#edbd9e");rect(c,-15,9+arm,7,4,"#edbd9e");rect(c,8,-2-arm,5,13,"#edbd9e");rect(c,8,9-arm,7,4,"#edbd9e");}
      else{rect(c,-13,-2,5,13,"#edbd9e");rect(c,-15,9,7,4,"#edbd9e");rect(c,8,-2,5,13,"#edbd9e");rect(c,8,9,7,4,"#edbd9e");}
      // bouquet
      rect(c,11,7,3,8,"#4f8b60");rect(c,8,4,4,4,"#f5a8bb");rect(c,13,3,4,4,"#fff0d4");rect(c,15,7,4,4,"#e88da9");
    }else{
      // groom hair and face
      rect(c,-9,-26,18,6,"#382a2b");rect(c,-12,-22,24,5,"#382a2b");rect(c,-10,-18,4,6,"#382a2b");
      rect(c,-8,-20,16,14,"#edbd9e");rect(c,-10,-17,3,7,"#d99f86");rect(c,7,-17,3,7,"#d99f86");
      rect(c,-4,-15,2,2,"#382a2b");rect(c,3,-15,2,2,"#382a2b");rect(c,-2,-10,5,2,"#a85d69");
      // tailored navy suit, white shirt and rose tie
      rect(c,-9,-6,18,5,"#f7f1e9");rect(c,-12,-2,24,17,"#2e477b");rect(c,-14,3,5,14,"#23375f");rect(c,9,3,5,14,"#23375f");
      rect(c,-5,-5,10,15,"#fff7ed");rect(c,-2,-4,4,12,"#d74f79");rect(c,-1,8,2,5,"#a83d66");
      rect(c,-10,12,20,4,"#405b91");rect(c,-12,16,24,5,"#243a68");
      const stride=step?(pose===1?3:-3):0;
      rect(c,-10+stride,20,8,8,"#202c45");rect(c,2-stride,20,8,8,"#202c45");
      rect(c,-11+stride,27,10,4,"#d5b58f");rect(c,2-stride,27,10,4,"#d5b58f");
      // boutonniere and pocket square
      rect(c,7,1,3,3,"#fff4df");rect(c,8,5,3,3,"#e9a1b2");rect(c,-10,1,3,4,"#e7d4b6");
      if(jump){rect(c,-15,-2,5,9,"#edbd9e");rect(c,-19,-11,5,11,"#edbd9e");rect(c,-20,-14,5,4,"#edbd9e");rect(c,10,-2,5,9,"#edbd9e");rect(c,14,-11,5,11,"#edbd9e");rect(c,15,-14,5,4,"#edbd9e");}
      else{const swing=step?(pose===1?2:-2):0;rect(c,-15,-1,5,10+swing,"#edbd9e");rect(c,-15,9+swing,5,4,"#edbd9e");rect(c,10,-1,5,10-swing,"#edbd9e");rect(c,10,9-swing,5,4,"#edbd9e");}
    }
    c.restore();
  }
  function drawGroom(c,x,y,frame=0,face=1){drawPersonBase(c,x,y,"groom",frame,face);}
  function drawBride(c,x,y,frame=0){drawPersonBase(c,x,y,"bride",frame,1);}
  function drawHug(c,x,y,frame=0){
    const lift=Math.floor(frame%3===0?1:0);
    drawPersonBase(c,x+7,y,"groom",frame%3,1);
    drawPersonBase(c,x+29,y,"bride",frame%4,1);
    // arms wrap around each other; little hearts rise above the couple
    rect(c,x+17,y+7-lift,6,3,"#edbd9e");rect(c,x+22,y+4-lift,5,3,"#edbd9e");
    rect(c,x+38,y+7-lift,6,3,"#edbd9e");rect(c,x+34,y+4-lift,5,3,"#edbd9e");
  }
  function drawCouple(c,x,y,frame,face=1){drawGroom(c,x,y,frame,face);drawBride(c,x+31,y,frame);}
  // Animated cover preview.
  const preview=$("#hero-game-preview"),pctx=preview?.getContext("2d");
  if(pctx){pctx.imageSmoothingEnabled=false;let tick=0;const loop=()=>{tick++;drawWorld(pctx,480,270,0,tick,true);requestAnimationFrame(loop);};loop();}

  // Playable platform adventure with 12 memories, enemies, checkpoint and finish sequence.
  const canvas=$("#game"),ctx=canvas?.getContext("2d");
  if(ctx){
    const W=480,H=250,GRAVITY=.43;
    ctx.imageSmoothingEnabled=false;
    const keys={left:false,right:false};
    const player={x:58,y:173,vx:0,vy:0,w:48,h:37,ground:false,face:1,celebrate:false,coyote:0,jumpBuffer:0};
    const pickups=hearts.map(p=>({...p,got:false}));
    const enemies=[{x:590,y:168,min:545,max:625,v:0.65,alive:true},{x:1190,y:162,min:1120,max:1215,v:0.72,alive:true},{x:1510,y:166,min:1460,max:1570,v:0.8,alive:true}];
    let camera=0,tick=0,score=0,lives=3,playing=false,won=false,ending=false,endingStarted=0,checkpoint=58,raf=0,last=0,particles=[];
    const scoreEl=$("#score"),overlay=$("#game-overlay"),message=$("#game-message"),level=$("#level-name"),lifeEl=$(".game-lives");
    function updateHud(){if(scoreEl)scoreEl.textContent=score+" / "+pickups.length;if(lifeEl)lifeEl.textContent="♥ ".repeat(lives).trim()||"♡";}
    function reset(){player.x=58;player.y=173;player.vx=player.vy=0;player.ground=false;player.face=1;player.celebrate=false;player.coyote=0;player.jumpBuffer=0;camera=0;tick=0;score=0;lives=3;checkpoint=28;won=false;ending=false;endingStarted=0;playing=false;particles=[];pickups.forEach(p=>p.got=false);enemies.forEach(e=>e.alive=true);keys.left=keys.right=false;updateHud();if(message)message.textContent="Recolham as 12 memórias, evitem os guardiões e cheguem ao castelo.";const title=overlay?.querySelector("h3"),copy=overlay?.querySelector("p"),start=$("#start-game");if(title)title.innerHTML="A vossa história<br>começa aqui.";if(copy)copy.textContent="Uma aventura a dois, à procura de todas as memórias.";if(start)start.innerHTML="Começar a jogar <span>▶</span>";overlay?.classList.remove("hidden");if(level)level.textContent="THE MEADOW";}
    function jump(){if(playing&&!won)player.jumpBuffer=9;}
    function sparkle(x,y,color=C.gold){for(let i=0;i<12;i++){const a=i*Math.PI/6;particles.push({x,y,vx:Math.cos(a)*1.4,vy:Math.sin(a)*1.4-1,life:28,color});}}
    function respawn(){lives--;updateHud();if(lives<=0){playing=false;overlay?.classList.remove("hidden");const h=overlay?.querySelector("h3"),p=overlay?.querySelector("p"),b=$("#start-game");if(h)h.textContent="A aventura continua.";if(p)p.textContent="As memórias continuam à vossa espera. Tentem novamente!";if(b)b.textContent="Jogar novamente ▶";return;}
      player.x=checkpoint;player.y=checkpoint>1000?120:173;player.vx=player.vy=0;message.textContent="Respirem fundo — ainda têm "+lives+" vidas!";}
    function drawEnemy(e){const x=Math.round(e.x-camera),y=e.y+Math.sin(tick*.12+e.x)*2;if(x< -30||x>W+30||!e.alive)return;
      // Animated clock guardian: a readable clock face, ticking hands and tiny feet.
      rect(ctx,x+3,y+26,21,4,"#28385c55");rect(ctx,x+5,y+7,17,17,"#6d5570");rect(ctx,x+2,y+5,23,19,"#b9b6b0");rect(ctx,x+5,y+2,17,4,"#e9d9bf");
      rect(ctx,x+7,y+9,3,3,"#fff7df");rect(ctx,x+17,y+9,3,3,"#fff7df");rect(ctx,x+8,y+10,2,2,"#27334f");rect(ctx,x+18,y+10,2,2,"#27334f");
      rect(ctx,x+12,y+13,2,6,"#9d4d68");rect(ctx,x+12,y+13,6,2,"#9d4d68");rect(ctx,x+9,y+19,10,2,"#9d4d68");
      const foot=Math.floor(tick/8)%2;rect(ctx,x+6-foot,y+24,5,5,"#51445d");rect(ctx,x+17+foot,y+24,5,5,"#51445d");
      rect(ctx,x+1,y+12,4,3,"#d6b17a");rect(ctx,x+23,y+12,4,3,"#d6b17a");}
    function draw(){
      drawWorld(ctx,W,H,camera,tick,false,null);
      pickups.forEach(p=>{if(!p.got){const x=p.x-camera;if(x>-20&&x<W+20){drawHeart(ctx,x,p.y+Math.sin(tick*.09+p.x)*2,1);drawSpark(ctx,x+7,p.y-6,tick);}}});
      enemies.forEach(drawEnemy);
      // Player rendered in the foreground.
      if(ending){
        const elapsed=tick-endingStarted,gx=player.x-camera,bx=1900-camera;
        if(elapsed<105){
          // The groom and bride visibly close the distance before the embrace.
          const approach=clamp(elapsed/82,0,1);
          const groomX=gx+Math.round(20*approach);
          const brideX=bx-Math.round(24*approach);
          const walkingPose=Math.floor(elapsed/7)%2?1:2;
          const brideFrame=elapsed<58?walkingPose:(Math.floor(elapsed/8)%2?3:4);
          const brideY=elapsed<58?140:Math.round(140-(elapsed-58)*.48-Math.sin(elapsed*.2)*2);
          drawGroom(ctx,groomX,player.y-27,elapsed<72?walkingPose:4,1);
          drawBride(ctx,brideX,brideY,brideFrame);
          if(elapsed>34){drawHeart(ctx,brideX+8,90+Math.sin(tick*.18)*4,.8);drawHeart(ctx,brideX+35,75+Math.sin(tick*.15+1)*4,.65);}
        }else{
          const hugFrame=Math.floor((elapsed-105)/20)%6;
          drawHug(ctx,gx+16,player.y-27,hugFrame);
          for(let i=0;i<5;i++){const hx=gx+8+i*13,hy=94+Math.sin(tick*.12+i*1.4)*10-(i%2)*14;drawHeart(ctx,hx,hy,.65+(i%2)*.15);}
          if(Math.floor(elapsed/14)%2===0){drawSpark(ctx,gx+61,79,tick);drawSpark(ctx,gx+8,93,tick+3);}
        }
      }else{
        if(player.x>1500)drawBride(ctx,1900-camera,126,0);
        drawGroom(ctx,player.x-camera,player.y-27,!player.ground?3:Math.abs(player.vx)>.25?1+Math.floor(tick/5)%2:5+Math.floor(tick/16)%4,player.face);
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
        if(player.ground)player.coyote=8;else player.coyote=Math.max(0,player.coyote-dt);
        if(player.jumpBuffer>0){player.jumpBuffer=Math.max(0,player.jumpBuffer-dt);if(player.ground||player.coyote>0){player.vy=-8.3;player.ground=false;player.coyote=0;player.jumpBuffer=0;}}
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