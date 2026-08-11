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








/* ===== Тайны океана v8 — explicit frame-by-frame movement ===== */
const diver=document.getElementById("diverSprite");
const danger=document.getElementById("dangerLayer");
const left=document.getElementById("left");
const right=document.getElementById("right");
const scoreEl=document.getElementById("score");
const diversEl=document.getElementById("divers");
const overlay=document.getElementById("over");
const titleEl=document.getElementById("overTitle");
const textEl=document.getElementById("overText");
const restartBtn=document.getElementById("restart");
const boardEl=document.querySelector(".ocean-board");

const PATH=[
  {x:30,y:34}, // boat / first point
  {x:30,y:54}, // second point
  {x:39,y:78}, // bottom 1
  {x:50,y:78}, // bottom 2
  {x:61,y:78}  // treasure
];

const TIPS=[
  {x:38,y:34},{x:48,y:43},{x:58,y:52},{x:50,y:61},{x:42,y:70}
];

let G=null;

function makeTentacles(){
  danger.innerHTML="";
  for(let i=0;i<5;i++){
    const arm=document.createElement("div");
    arm.className="tentacle-arm t"+(i+1);
    arm.innerHTML='<span class="suction"></span>';
    danger.appendChild(arm);
    const dot=document.createElement("div");
    dot.className="danger-dot";
    dot.style.left=TIPS[i].x+"%";
    dot.style.top=TIPS[i].y+"%";
    danger.appendChild(dot);
  }
}
makeTentacles();

function startGame(){
  G={
    run:true,
    phase:"down",
    seg:0,
    f:0,
    bottom:2,
    dodge:0,
    score:0,
    divers:3,
    next:200,
    carrying:false,
    last:performance.now(),
    tent:[0,1,2,3,4].map(i=>({phase:i*1.7, speed:.9+i*.045}))
  };
  scoreEl.textContent="0";
  diversEl.textContent="3";
  overlay.classList.add("is-hidden");
  diver.style.opacity="1";
  frame(performance.now());
}

function frame(now){
  if(!G || !G.run)return;
  const dt=Math.min((now-G.last)/1000,.05);
  G.last=now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

function update(dt){
  // Explicitly advance position every frame.
  if(G.phase==="down"){
    G.f+=dt*.55;
    if(G.f>=1){
      G.f=0;
      G.seg++;
      if(G.seg>=2){
        G.seg=1;
        G.phase="bottom";
        G.bottom=2;
      }
    }
  }else if(G.phase==="return"){
    G.f-=dt*.55;
    if(G.f<=0){
      G.f=1;
      G.seg--;
      if(G.seg<0){
        deliver();
        return;
      }
    }
  }

  // Independent tentacle cycles, always visible.
  document.querySelectorAll(".tentacle-arm").forEach((arm,i)=>{
    const q=G.tent[i];
    const w=(Math.sin(G.last/1000*q.speed+q.phase)+1)/2;
    arm.style.transform=`rotate(${[-8,-3,2,7,12][i]}deg) scaleX(${.25+w*.75})`;
  });

  // Collision only when a tentacle is strongly extended and near the diver.
  const p=position();
  if(G.phase==="down"||G.phase==="bottom"||G.phase==="return"){
    for(let i=0;i<5;i++){
      const q=G.tent[i];
      const w=(Math.sin(G.last/1000*q.speed+q.phase)+1)/2;
      if(w>.88 && Math.hypot(p.x-TIPS[i].x,p.y-TIPS[i].y)<6){
        lose();
        return;
      }
    }
  }

  if(G.score>=G.next){
    if(G.divers<3)G.divers++;
    G.next+=200;
    diversEl.textContent=G.divers;
  }
}

function position(){
  if(G.phase==="bottom")return PATH[G.bottom];
  let a,b,f;
  if(G.phase==="down"){
    a=G.seg;b=G.seg+1;f=G.f;
  }else if(G.phase==="return"){
    a=G.seg+1;b=G.seg;f=G.f;
  }else{
    return PATH[0];
  }
  const A=PATH[a],B=PATH[b];
  return {x:A.x+(B.x-A.x)*f,y:A.y+(B.y-A.y)*f};
}

function draw(){
  const p=position();
  let x=p.x;
  if(G.phase==="down"||G.phase==="return"){
    x+=G.dodge*6;
  }
  x=Math.max(27,Math.min(68,x));

  diver.style.left=x+"%";
  diver.style.top=p.y+"%";

  // Add a tiny visible swimming bob so movement is unmistakable.
  diver.style.marginTop=(Math.sin(G.last/1000*8)*3)+"px";
}

function move(d){
  if(!G||!G.run)return;

  // Only two controls. During vertical travel they choose a corridor.
  if(G.phase==="down"||G.phase==="return"){
    G.dodge=Math.max(-2,Math.min(2,G.dodge+d));
  }else if(G.phase==="bottom"){
    G.bottom=Math.max(2,Math.min(4,G.bottom+d));
    if(G.bottom===4)take();
  }
  draw();
}

function take(){
  if(G.carrying||!G.run)return;
  G.carrying=true;
  G.score++;
  scoreEl.textContent=G.score;
  G.phase="return";
  G.seg=1;
  G.f=1;
}

function deliver(){
  G.carrying=false;
  G.score+=3;
  scoreEl.textContent=G.score;
  G.phase="down";
  G.seg=0;
  G.f=0;
  G.dodge=0;
}

function lose(){
  G.divers--;
  diversEl.textContent=G.divers;
  diver.style.opacity=".15";
  if(G.divers<=0){
    G.run=false;
    titleEl.textContent="Игра окончена";
    textEl.textContent="Спрут съел всех трёх водолазов.";
    document.getElementById("overIcon").textContent="🐙";
    overlay.classList.remove("is-hidden");
    return;
  }
  G.phase="down";G.seg=0;G.f=0;G.dodge=0;
  setTimeout(()=>{if(G&&G.run)diver.style.opacity="1"},500);
}

left.addEventListener("pointerdown",e=>{e.preventDefault();move(-1)});
right.addEventListener("pointerdown",e=>{e.preventDefault();move(1)});
window.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft"){e.preventDefault();move(-1)}
  if(e.key==="ArrowRight"){e.preventDefault();move(1)}
});
restartBtn.addEventListener("click",startGame);

const previousShowOcean=showOcean;
showOcean=function(){
  previousShowOcean();
  setTimeout(startGame,100);
};

window.addEventListener("resize",()=>{if(G&&G.run)draw()});
