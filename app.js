const intro = document.getElementById("intro");
const app = document.getElementById("app");
const oceanScreen = document.getElementById("oceanScreen");
const playOcean = document.getElementById("playOcean");
const backButton = document.getElementById("backButton");

const INTRO_TIME = 3200;

function showMenu() {
  oceanScreen.classList.add("is-hidden");
  app.classList.remove("is-hidden");
}

function showOcean() {
  app.classList.add("is-hidden");
  oceanScreen.classList.remove("is-hidden");
  window.scrollTo({ top: 0, behavior: "instant" });
}

playOcean.addEventListener("click", showOcean);
backButton.addEventListener("click", showMenu);

window.addEventListener("load", () => {
  setTimeout(() => {
    intro.classList.add("hide");
    app.classList.remove("is-hidden");
  }, INTRO_TIME);
});


const oc=document.getElementById("oceanCanvas"),cx=oc.getContext("2d"),
L=document.getElementById("left"),R=document.getElementById("right"),
SC=document.getElementById("score"),OV=document.getElementById("over"),
OT=document.getElementById("overTitle"),OX=document.getElementById("overText"),
RS=document.getElementById("restart");

let G=null;

function fit(){
  const r=oc.getBoundingClientRect(), d=Math.min(devicePixelRatio||1,2);
  oc.width=Math.max(1,r.width*d); oc.height=Math.max(1,r.height*d);
  cx.setTransform(d,0,0,d,0,0);
}

function start(){
  fit();
  G={
    run:true, x:.18, y:.30, targetY:.30, score:0, depth:0,
    t:performance.now(), left:false, right:false, treasure:false,
    boatX:.18, boatBob:0, world:0, flash:0,
    bubbles:Array.from({length:34},(_,i)=>({
      x:(i*.137)%1,y:(i*.071)%1,s:.7+(i%5)*.2,sp:.008+(i%7)*.0015
    })),
    fish:Array.from({length:9},(_,i)=>({
      x:(i*.17+.1)%1,y:.2+(i%6)*.11,s:.55+(i%4)*.12,
      dir:i%2?1:-1,sp:.018+(i%5)*.006
    })),
    tentacles:[
      {x:.74,phase:0,sp:.9},
      {x:.84,phase:2,sp:1.15},
      {x:.93,phase:4,sp:.72}
    ]
  };
  SC.textContent="0"; OV.classList.add("is-hidden");
  requestAnimationFrame(loop);
}

function end(title,text,icon){
  if(!G||!G.run)return;
  G.run=false; OT.textContent=title; OX.textContent=text;
  document.getElementById("overIcon").textContent=icon;
  OV.classList.remove("is-hidden");
}

function loop(n){
  if(!G)return;
  const dt=Math.min((n-G.t)/1000,.035); G.t=n;
  update(dt,n/1000); draw(n/1000);
  if(G.run)requestAnimationFrame(loop);
}

function update(dt,t){
  if(!G.run)return;

  const d=(G.right?1:0)-(G.left?1:0);
  G.x=Math.max(.08,Math.min(.92,G.x+d*.48*dt));

  // Continuous descent: the diver slowly goes down.
  G.depth=Math.min(900,G.depth+dt*12);
  G.y=Math.min(.76,.30+G.depth/900*.46);
  G.world+=dt*.035;

  // Animated boat and bubbles.
  G.boatBob=Math.sin(t*2.3)*.012;

  G.score+=dt*3;
  SC.textContent=Math.floor(G.score);

  for(const b of G.bubbles){
    b.y-=b.sp*dt*5;
    if(b.y<-.04){b.y=1.03;b.x=(b.x+.31)%1}
  }

  for(const f of G.fish){
    f.x+=f.dir*f.sp*dt*3;
    if(f.dir>0&&f.x>1.08)f.x=-.08;
    if(f.dir<0&&f.x<-.08)f.x=1.08;
  }

  // Treasure appears at the bottom and becomes reachable.
  const treasureX=.88, treasureY=.80;
  if(!G.treasure && G.depth>560 &&
     Math.abs(G.x-treasureX)<.08 && Math.abs(G.y-treasureY)<.08){
    G.treasure=true; G.score+=500; SC.textContent=Math.floor(G.score);
    end("Клад найден!","Ты опередил спрута и добрался до сокровища.","🏆");
    return;
  }

  // Moving tentacles near the treasure.
  if(G.depth>260){
    for(const q of G.tentacles){
      const tx=q.x+Math.sin(t*q.sp+q.phase)*.055;
      const ty=.72+Math.abs(Math.sin(t*q.sp*.8+q.phase))*.09;
      const dx=G.x-tx,dy=G.y-ty;
      if(Math.hypot(dx,dy)<.075){
        end("Спрут заметил тебя!","Щупальце перехватило водолаза.","🐙");
        return;
      }
    }
  }
}

function draw(t){
  const w=oc.clientWidth,h=oc.clientHeight;
  cx.clearRect(0,0,w,h);

  const g=cx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,"#0aa0bf");g.addColorStop(.28,"#07627f");
  g.addColorStop(.65,"#063a55");g.addColorStop(1,"#01151f");
  cx.fillStyle=g;cx.fillRect(0,0,w,h);

  // Animated light from surface.
  cx.save();cx.globalAlpha=.10;
  for(let i=0;i<6;i++){
    const x=w*(.02+i*.20)+Math.sin(t*.4+i)*10;
    cx.fillStyle="#d9fbff";cx.beginPath();
    cx.moveTo(x,0);cx.lineTo(x+45,0);cx.lineTo(x+130,h*.65);
    cx.lineTo(x+55,h*.65);cx.closePath();cx.fill();
  }
  cx.restore();

  // Surface waves.
  cx.strokeStyle="rgba(225,253,255,.75)";cx.lineWidth=2;
  cx.beginPath();
  for(let x=0;x<=w;x+=6){
    const y=18+Math.sin(x*.045+t*2.4)*3+Math.sin(x*.015+t)*2;
    x?cx.lineTo(x,y):cx.moveTo(x,y);
  }cx.stroke();

  // Boat at the surface.
  const bx=G.boatX*w, by=(.10+G.boatBob)*h;
  cx.save();cx.translate(bx,by);
  cx.fillStyle="#8e2d2d";cx.beginPath();
  cx.moveTo(-55,0);cx.lineTo(55,0);cx.lineTo(40,14);cx.lineTo(-42,14);cx.closePath();cx.fill();
  cx.fillStyle="#e7edf0";cx.fillRect(-8,-31,5,30);
  cx.strokeStyle="#e7edf0";cx.lineWidth=2;cx.beginPath();cx.moveTo(-5,-30);cx.lineTo(27,-14);cx.stroke();
  // two crew silhouettes
  for(const px of [-22,12]){
    cx.fillStyle="#111820";cx.beginPath();cx.arc(px,-11,7,0,7);cx.fill();
    cx.fillRect(px-5,-4,10,11);
  }
  cx.restore();

  // Bubbles.
  for(const b of G.bubbles){
    const x=b.x*w+Math.sin(t*1.4+b.x*13)*6,y=b.y*h,r=1.5+b.s*2;
    cx.strokeStyle="rgba(190,248,255,.48)";cx.lineWidth=1;
    cx.beginPath();cx.arc(x,y,r,0,7);cx.stroke();
  }

  // Fish schools.
  for(const f of G.fish){
    const x=f.x*w,y=f.y*h;
    cx.save();cx.translate(x,y);if(f.dir<0)cx.scale(-1,1);
    cx.fillStyle="rgba(187,232,238,.55)";
    cx.beginPath();cx.ellipse(0,0,10*f.s,5*f.s,0,0,7);cx.fill();
    cx.beginPath();cx.moveTo(-9*f.s,0);cx.lineTo(-17*f.s,-6*f.s);cx.lineTo(-17*f.s,6*f.s);cx.closePath();cx.fill();
    cx.restore();
  }

  // Seabed.
  cx.fillStyle="#02131a";cx.beginPath();cx.moveTo(0,h*.87);
  for(let x=0;x<=w;x+=10)cx.lineTo(x,h*(.87+Math.sin(x*.026)*.025));
  cx.lineTo(w,h);cx.lineTo(0,h);cx.closePath();cx.fill();

  // Treasure chest.
  if(!G.treasure){
    const tx=.88*w,ty=.80*h;
    cx.fillStyle="#925322";cx.fillRect(tx-24,ty-15,48,28);
    cx.fillStyle="#dfab43";cx.fillRect(tx-24,ty-15,48,5);cx.fillRect(tx-4,ty-15,8,28);
    cx.fillStyle="rgba(255,221,95,.8)";
    cx.beginPath();cx.arc(tx,ty-20,9+Math.sin(t*4)*2,0,7);cx.fill();
  }

  // Giant octopus.
  const ox=.82*w,oy=.92*h;
  cx.fillStyle="#070b12";cx.beginPath();cx.ellipse(ox,oy-45,w*.11,h*.12,0,0,7);cx.fill();
  for(const q of G.tentacles){
    const tx=(q.x+Math.sin(t*q.sp+q.phase)*.055)*w;
    const ty=(.76+Math.abs(Math.sin(t*q.sp*.8+q.phase))*.09)*h;
    cx.strokeStyle="#070b12";cx.lineWidth=Math.max(13,w*.035);cx.lineCap="round";
    cx.beginPath();cx.moveTo(ox,oy-20);
    cx.bezierCurveTo(ox+(tx-ox)*.35,oy-15,ox+(tx-ox)*.8,ty+45,tx,ty);cx.stroke();
  }
  cx.fillStyle="#d9f8ff";cx.beginPath();cx.arc(ox-18,oy-57,4,0,7);cx.arc(ox+18,oy-57,4,0,7);cx.fill();

  // Diver with a small swinging animation.
  const dx=G.x*w,dy=G.y*h;
  cx.save();cx.translate(dx,dy);cx.rotate(Math.sin(t*3)*.035);
  cx.strokeStyle="#c1d7db";cx.lineWidth=5;cx.lineCap="round";
  cx.beginPath();
  cx.moveTo(-8,-10);cx.lineTo(-19,4);cx.moveTo(8,-10);cx.lineTo(19,4);
  cx.moveTo(-5,7);cx.lineTo(-12,22);cx.moveTo(5,7);cx.lineTo(12,22);cx.stroke();
  cx.fillStyle="#182c36";cx.fillRect(-10,-18,20,26);
  cx.fillStyle="#bdebf0";cx.beginPath();cx.arc(0,-29,13,0,7);cx.fill();
  cx.fillStyle="#062331";cx.beginPath();cx.arc(0,-30,8,0,7);cx.fill();
  cx.fillStyle="#c9d6da";cx.fillRect(10,-27,8,25);
  cx.restore();
}

function bind(b,k){
  const down=e=>{e.preventDefault();if(G&&G.run){G[k]=true;b.classList.add("pressed")}};
  const up=e=>{e.preventDefault();if(G){G[k]=false;b.classList.remove("pressed")}};
  b.addEventListener("pointerdown",down);
  ["pointerup","pointercancel","pointerleave"].forEach(x=>b.addEventListener(x,up));
}
bind(L,"left");bind(R,"right");

window.addEventListener("keydown",e=>{
  if(!G||!G.run)return;
  if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")G.left=true;
  if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")G.right=true;
});
window.addEventListener("keyup",e=>{
  if(!G)return;
  if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")G.left=false;
  if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")G.right=false;
});

RS.addEventListener("click",start);
const oldShowOcean=showOcean;
showOcean=()=>{oldShowOcean();setTimeout(start,60)};
window.addEventListener("resize",()=>{if(G){fit();draw(performance.now()/1000)}});
