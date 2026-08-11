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







/* ===== Тайны океана v7 — видимое движение водолаза ===== */

const diverSprite=document.getElementById("diverSprite");
const dangerLayer=document.getElementById("dangerLayer");
const bagSprite=document.getElementById("bagSprite");
const rewardFlash=document.getElementById("rewardFlash");
const leftBtn=document.getElementById("left");
const rightBtn=document.getElementById("right");
const scoreNode=document.getElementById("score");
const diversNode=document.getElementById("divers");
const over=document.getElementById("over");
const overTitle=document.getElementById("overTitle");
const overText=document.getElementById("overText");
const restart=document.getElementById("restart");

const route=[
  {x:29.8,y:34.5},
  {x:29.8,y:54.5},
  {x:38,y:78},
  {x:49.5,y:78},
  {x:61,y:78}
];

const targets=[
  {x:40,y:31},{x:50,y:40},{x:60,y:49},{x:50,y:58},{x:40,y:67}
];

let game=null;

function buildDanger(){
  dangerLayer.innerHTML="";
  targets.forEach((p,i)=>{
    const arm=document.createElement("div");
    arm.className=`tentacle-arm t${i+1}`;
    const suction=document.createElement("span");
    suction.className="suction";
    arm.appendChild(suction);
    dangerLayer.appendChild(arm);

    const dot=document.createElement("div");
    dot.className="danger-dot";
    dot.style.left=p.x+"%";
    dot.style.top=p.y+"%";
    dangerLayer.appendChild(dot);
  });
}
buildDanger();

function startOceanGame(){
  game={
    running:true,
    phase:"down",
    segment:0,
    progress:0,
    bottomPoint:2,
    dodge:0,
    score:0,
    divers:3,
    nextBonus:200,
    t:0,
    last:performance.now(),
    carrying:false,
    tentacles:[0,1,2,3,4].map((_,i)=>({
      phase:i*1.23,
      rate:.82+(i%3)*.17
    }))
  };

  scoreNode.textContent="0";
  diversNode.textContent="3";
  over.classList.add("is-hidden");
  bagSprite.classList.remove("show");
  rewardFlash.classList.remove("show");
  renderOcean();
  requestAnimationFrame(oceanLoop);
}

function oceanLoop(now){
  if(!game)return;

  const dt=Math.min((now-game.last)/1000,.035);
  game.last=now;

  if(game.running){
    game.t+=dt;
    updateOcean(dt);
    renderOcean();
    requestAnimationFrame(oceanLoop);
  }
}

function updateOcean(dt){
  const g=game;

  /*
   * DOWN:
   * segment 0 = boat -> first underwater point
   * segment 1 = first point -> second point
   */
  if(g.phase==="down"){
    g.progress += dt*.72;

    if(g.progress>=1){
      g.progress=0;
      g.segment++;

      if(g.segment>=2){
        g.segment=1;
        g.phase="bottom";
        g.bottomPoint=2;
      }
    }
  }

  /*
   * RETURN:
   * reverse the same route:
   * bottom -> second underwater point -> first -> boat
   */
  else if(g.phase==="return"){
    g.progress -= dt*.72;

    if(g.progress<=0){
      g.progress=1;
      g.segment--;

      if(g.segment<0){
        g.segment=0;
        g.phase="boat";
        deliverTreasure();
        return;
      }
    }
  }

  else if(g.phase==="taking"){
    // Brief pickup animation, then return.
    return;
  }

  animateTentacles();
  checkTentacleCollision();

  if(g.score>=g.nextBonus){
    if(g.divers<3)g.divers++;
    g.nextBonus+=200;
    diversNode.textContent=g.divers;
  }
}

function positionOnRoute(){
  const g=game;

  if(g.phase==="bottom" || g.phase==="taking"){
    return route[g.bottomPoint];
  }

  if(g.phase==="down"){
    const a=g.segment;
    const b=g.segment+1;
    const f=g.progress;
    return {
      x:route[a].x+(route[b].x-route[a].x)*f,
      y:route[a].y+(route[b].y-route[a].y)*f
    };
  }

  if(g.phase==="return"){
    const a=g.segment+1;
    const b=g.segment;
    const f=g.progress;
    return {
      x:route[a].x+(route[b].x-route[a].x)*f,
      y:route[a].y+(route[b].y-route[a].y)*f
    };
  }

  return route[0];
}

function animateTentacles(){
  const g=game;
  const arms=document.querySelectorAll(".tentacle-arm");
  const dots=document.querySelectorAll(".danger-dot");

  arms.forEach((arm,i)=>{
    const q=g.tentacles[i];
    const wave=(Math.sin(g.t*q.rate+q.phase)+1)/2;
    const reach=.30+wave*.70;

    arm.style.transform=
      `rotate(${[-8,-3,2,7,12][i]}deg) scaleX(${.40+reach*.60})`;

    arm.classList.toggle("opening",wave>.72);
    dots[i].classList.toggle("hit",wave>.88);
  });
}

function checkTentacleCollision(){
  const g=game;
  if(!g || g.phase==="boat" || g.phase==="taking")return;

  const p=positionOnRoute();

  for(let i=0;i<5;i++){
    const q=g.tentacles[i];
    const wave=(Math.sin(g.t*q.rate+q.phase)+1)/2;
    const reach=.30+wave*.70;
    const target=targets[i];

    /*
     * Danger is checked only when a tentacle is actually extended
     * toward its own target. The diver can therefore weave between
     * the five moving arms.
     */
    if(reach>.80 && Math.hypot(p.x-target.x,p.y-target.y)<7.5){
      loseDiver();
      return;
    }
  }
}

function move(delta){
  if(!game || !game.running)return;

  if(game.phase==="down" || game.phase==="return"){
    /*
     * Only two controls: left/right. They shift the diver's
     * horizontal corridor while his vertical movement continues
     * automatically.
     */
    game.dodge=Math.max(-2,Math.min(2,game.dodge+delta));
  }

  else if(game.phase==="bottom"){
    game.bottomPoint=Math.max(2,Math.min(4,game.bottomPoint+delta));

    if(game.bottomPoint===4){
      takeTreasure();
    }
  }

  renderOcean();
}

function takeTreasure(){
  if(game.carrying || !game.running)return;

  game.carrying=true;
  game.score++;
  scoreNode.textContent=game.score;

  bagSprite.classList.remove("show");
  void bagSprite.offsetWidth;
  bagSprite.classList.add("show");

  createScorePop("+1");

  game.phase="taking";

  setTimeout(()=>{
    if(!game || !game.running)return;
    game.phase="return";
    game.segment=1;
    game.progress=1;
  },650);
}

function deliverTreasure(){
  if(!game.carrying)return;

  game.carrying=false;

  rewardFlash.classList.remove("show");
  void rewardFlash.offsetWidth;
  rewardFlash.classList.add("show");

  game.score+=3;
  scoreNode.textContent=game.score;
  createScorePop("+3");

  /*
   * Successful diver is back in the boat.
   * He remains available; another dive starts after the reward.
   */
  game.phase="boat";

  setTimeout(()=>{
    if(!game || !game.running)return;
    game.phase="down";
    game.segment=0;
    game.progress=0;
    game.bottomPoint=2;
    game.dodge=0;
  },1000);
}

function createScorePop(text){
  const el=document.createElement("div");
  el.className="game-score-pop";
  el.textContent=text;
  el.style.left="18%";
  el.style.top="13%";
  document.querySelector(".ocean-board").appendChild(el);
  setTimeout(()=>el.remove(),1050);
}

function nextDiver(){
  if(!game || !game.running)return;

  if(game.divers>0){
    game.divers--;
    diversNode.textContent=game.divers;
    game.phase="down";
    game.segment=0;
    game.progress=0;
    game.bottomPoint=2;
    game.dodge=0;
  }else{
    endOcean("Игра окончена","Спрут съел всех трёх водолазов.","🐙");
  }
}

function loseDiver(){
  if(!game || !game.running)return;

  game.divers=Math.max(0,game.divers-1);
  diversNode.textContent=game.divers;

  diverSprite.classList.add("hit-flash");
  setTimeout(()=>diverSprite.classList.remove("hit-flash"),500);

  game.phase="boat";

  if(game.divers===0){
    setTimeout(()=>{
      endOcean("Игра окончена","Спрут съел всех трёх водолазов.","🐙");
    },500);
  }else{
    setTimeout(()=>{
      if(!game || !game.running)return;
      game.phase="down";
      game.segment=0;
      game.progress=0;
      game.bottomPoint=2;
      game.dodge=0;
    },800);
  }
}

function endOcean(title,text,icon){
  game.running=false;
  overTitle.textContent=title;
  overText.textContent=text;
  document.getElementById("overIcon").textContent=icon;
  over.classList.remove("is-hidden");
}

function renderOcean(){
  if(!game)return;

  const p=positionOnRoute();
  let x=p.x;

  if(game.phase==="down" || game.phase==="return"){
    x+=game.dodge*5.5;
  }

  x=Math.max(27,Math.min(66,x));

  diverSprite.style.left=x+"%";
  diverSprite.style.top=p.y+"%";

  diverSprite.style.filter=game.carrying
    ? "drop-shadow(0 5px 7px rgba(0,0,0,.55)) drop-shadow(7px 5px 2px rgba(255,207,76,.65))"
    : "drop-shadow(0 5px 7px rgba(0,0,0,.55))";
}

leftBtn.addEventListener("pointerdown",e=>{
  e.preventDefault();
  move(-1);
});

rightBtn.addEventListener("pointerdown",e=>{
  e.preventDefault();
  move(1);
});

window.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft" || e.key.toLowerCase()==="a"){
    e.preventDefault();
    move(-1);
  }

  if(e.key==="ArrowRight" || e.key.toLowerCase()==="d"){
    e.preventDefault();
    move(1);
  }
});

restart.addEventListener("click",startOceanGame);

const oldShowOcean=showOcean;
showOcean=()=>{
  oldShowOcean();
  setTimeout(startOceanGame,80);
};

window.addEventListener("resize",()=>{
  if(game)renderOcean();
});
