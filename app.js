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




/* ===== Тайны океана v4 — маршрут из 5 точек =====
   Две точки вниз от лодки + три точки по дну к кладу.
   Управление только ◀ / ▶. */
const diverSprite=document.getElementById("diverSprite");
const dangerLayer=document.getElementById("dangerLayer");
const leftBtn=document.getElementById("left");
const rightBtn=document.getElementById("right");
const scoreNode=document.getElementById("score");
const diversNode=document.getElementById("divers");
const over=document.getElementById("over");
const overTitle=document.getElementById("overTitle");
const overText=document.getElementById("overText");
const restart=document.getElementById("restart");

let oceanGame=null;

/* P1, P2 — вертикальный спуск.
   P3, P4, P5 — три точки по дну до мешка. */
const route=[
  {x:29.8,y:34.5},
  {x:29.8,y:54.5},
  {x:38.0,y:78.0},
  {x:49.5,y:78.0},
  {x:61.0,y:78.0}
];

function makeTentacles(){
  dangerLayer.innerHTML="";
  for(let i=0;i<5;i++){
    const el=document.createElement("div");
    el.className="danger-tentacle t"+(i+1);
    el.dataset.index=i;
    dangerLayer.appendChild(el);
  }
}
makeTentacles();

function startOceanGame(){
  oceanGame={
    running:true,
    phase:"down",
    point:0,
    score:0,
    divers:3,
    nextBonus:200,
    t:0,
    last:performance.now(),
    tentacles:[0,1,2,3,4].map((_,i)=>({phase:i*1.31,rate:.9+(i%2)*.18}))
  };
  scoreNode.textContent="0";
  diversNode.textContent="3";
  over.classList.add("is-hidden");
  renderOcean();
  requestAnimationFrame(oceanLoop);
}

function oceanLoop(now){
  if(!oceanGame)return;
  const dt=Math.min((now-oceanGame.last)/1000,.04);
  oceanGame.last=now;
  if(oceanGame.running){
    oceanGame.t+=dt;
    updateOcean(dt);
    renderOcean();
    requestAnimationFrame(oceanLoop);
  }
}

function updateOcean(dt){
  const g=oceanGame;

  if(g.phase==="down"){
    // The diver automatically passes the two vertical points.
    g.point+=dt*.42;
    if(g.point>=2){
      g.point=2;
      // At the bottom, the player chooses P3/P4/P5 with the two keys.
      g.phase="bottom";
    }
  }else if(g.phase==="bottom"){
    // Only the two buttons change the bottom point.
    // Reaching the last point means the diver takes the gold bag.
    if(g.point>=4){
      g.score+=1;
      scoreNode.textContent=g.score;
      g.phase="return";
    }
  }else if(g.phase==="return"){
    // Return through the same three bottom points, then the two vertical points.
    g.point-=dt*.58;
    if(g.point<=0){
      g.point=0;
      g.score+=3;
      scoreNode.textContent=g.score;
      g.phase="boat";
      setTimeout(nextDiver,550);
    }
  }

  // Five tentacles grow/shrink one after another from the octopus.
  // Their tips are the danger zone; the active one can reach the route.
  const progress=g.phase==="down" ? g.point/2 :
                 g.phase==="bottom" ? (g.point-2)/2 :
                 g.phase==="return" ? g.point/4 : 0;

  const nodes=document.querySelectorAll(".danger-tentacle");
  nodes.forEach((el,i)=>{
    const q=g.tentacles[i];
    const wave=(Math.sin(g.t*q.rate+q.phase)+1)/2;
    const reach=.25+wave*.75;
    el.style.setProperty("--reach",reach);
    el.style.setProperty("width",(24+reach*65)+"%");
    el.classList.toggle("active",wave>.65);
  });

  // Collision: while moving down, a tentacle can reach the diver's current
  // horizontal corridor; on the bottom, the last three points are the safe route.
  if(g.phase==="down" || g.phase==="return"){
    for(let i=0;i<5;i++){
      const q=g.tentacles[i];
      const wave=(Math.sin(g.t*q.rate+q.phase)+1)/2;
      const reach=.25+wave*.75;
      if(reach>.84){
        const dangerBand=.22+i*.105;
        if(Math.abs(progress-dangerBand)<.055){
          loseDiver();
          return;
        }
      }
    }
  }

  if(g.score>=g.nextBonus){
    if(g.divers<3)g.divers++;
    g.nextBonus+=200;
    diversNode.textContent=g.divers;
  }
}

function moveBottom(delta){
  const g=oceanGame;
  if(!g||!g.running||g.phase!=="bottom")return;
  g.point=Math.max(2,Math.min(4,g.point+delta));
  if(g.point===4){
    // One point for picking up the bag.
    g.score+=1;
    scoreNode.textContent=g.score;
    g.phase="return";
  }
  renderOcean();
}

function nextDiver(){
  const g=oceanGame;
  if(!g||!g.running)return;
  if(g.divers>0){
    g.divers--;
    diversNode.textContent=g.divers;
    g.point=0;
    g.phase="down";
  }else{
    endOcean("Игра окончена","Спрут съел всех трёх водолазов.","🐙");
  }
}

function loseDiver(){
  const g=oceanGame;
  if(!g||!g.running)return;
  g.divers=Math.max(0,g.divers-1);
  diversNode.textContent=g.divers;
  if(g.divers===0){
    endOcean("Игра окончена","Спрут съел всех трёх водолазов.","🐙");
  }else{
    g.phase="boat";
    setTimeout(nextDiver,700);
  }
}

function endOcean(title,text,icon){
  oceanGame.running=false;
  overTitle.textContent=title;
  overText.textContent=text;
  document.getElementById("overIcon").textContent=icon;
  over.classList.remove("is-hidden");
}

function renderOcean(){
  const g=oceanGame;
  if(!g)return;

  // Interpolate the five route points for a smooth animated movement.
  let a=Math.floor(g.point), b=Math.ceil(g.point);
  if(a===b){a=Math.max(0,Math.min(4,a));b=a}
  else{a=Math.max(0,Math.min(4,a));b=Math.max(0,Math.min(4,b))}
  const f=g.point-a;
  const x=route[a].x+(route[b].x-route[a].x)*f;
  const y=route[a].y+(route[b].y-route[a].y)*f;

  diverSprite.style.left=x+"%";
  diverSprite.style.top=y+"%";

  // Directional tilt.
  const dir=(route[b].x-route[a].x);
  diverSprite.style.transform=`translate(-50%,-50%) rotate(${dir>0?7:dir<0?-7:0}deg)`;
}

function press(btn,delta){
  btn.addEventListener("pointerdown",e=>{
    e.preventDefault();
    moveBottom(delta);
  });
}
press(leftBtn,-1);
press(rightBtn,1);

window.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a"){
    e.preventDefault();moveBottom(-1);
  }
  if(e.key==="ArrowRight"||e.key.toLowerCase()==="d"){
    e.preventDefault();moveBottom(1);
  }
});

restart.addEventListener("click",startOceanGame);

const oldShowOcean=showOcean;
showOcean=()=>{
  oldShowOcean();
  setTimeout(startOceanGame,80);
};
