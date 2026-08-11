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






/* ===== Тайны океана v6 — точная логика водолазов и клада ===== */

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
    point:0,
    dodge:0,
    score:0,
    divers:3,
    nextBonus:200,
    t:0,
    last:performance.now(),
    carrying:false,
    bagRewarded:false,
    tentacles:[0,1,2,3,4].map((_,i)=>({
      phase:i*1.23,
      rate:.85+(i%3)*.17
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

  const dt=Math.min((now-game.last)/1000,.04);
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

  if(g.phase==="down"){
    // Two fixed points under the boat.
    g.point+=dt*.42;

    if(g.point>=2){
      g.point=2;
      g.phase="bottom";
    }
  }

  else if(g.phase==="bottom"){
    // Three bottom points. The player uses only LEFT / RIGHT.
    // At the third point the bag is taken.
    if(g.point>=4){
      takeTreasure();
      return;
    }
  }

  else if(g.phase==="return"){
    // Return through the same route.
    g.point-=dt*.58;

    if(g.point<=0){
      g.point=0;
      g.phase="boat";
      deliverTreasure();
      return;
    }
  }

  animateTentacles();
  checkTentacleCollision();

  // Every 200 points: replenish up to three divers.
  if(g.score>=g.nextBonus){
    if(g.divers<3){
      g.divers++;
      diversNode.textContent=g.divers;
    }
    g.nextBonus+=200;
  }
}

function animateTentacles(){
  const g=game;
  const arms=document.querySelectorAll(".tentacle-arm");
  const dots=document.querySelectorAll(".danger-dot");

  arms.forEach((arm,i)=>{
    const q=g.tentacles[i];
    const wave=(Math.sin(g.t*q.rate+q.phase)+1)/2;

    // Every tentacle has its own rhythm and target.
    const reach=.30+wave*.70;
    const angle=[-8,-3,2,7,12][i];

    arm.style.transform=
      `rotate(${angle}deg) scaleX(${.40+reach*.60})`;

    arm.classList.toggle("opening",wave>.72);
    dots[i].classList.toggle("hit",wave>.88);
  });
}

function checkTentacleCollision(){
  const g=game;
  if(!g || !(g.phase==="down"||g.phase==="bottom"||g.phase==="return")) return;

  const p=currentPosition();

  for(let i=0;i<5;i++){
    const q=g.tentacles[i];
    const wave=(Math.sin(g.t*q.rate+q.phase)+1)/2;
    const reach=.30+wave*.70;
    const target=targets[i];

    // The tip must be extended and close to the diver's position.
    if(reach>.76 && Math.hypot(p.x-target.x,p.y-target.y)<8){
      loseDiver();
      return;
    }
  }
}

function currentPosition(){
  const p=game.point;
  const a=Math.max(0,Math.min(4,Math.floor(p)));
  const b=Math.max(0,Math.min(4,Math.ceil(p)));
  const f=p-a;

  return {
    x:route[a].x+(route[b].x-route[a].x)*f,
    y:route[a].y+(route[b].y-route[a].y)*f
  };
}

function move(delta){
  if(!game || !game.running) return;

  if(game.phase==="down" || game.phase==="return"){
    // While travelling vertically, the two keys let the diver
    // weave around the tentacles.
    game.dodge=Math.max(-2,Math.min(2,game.dodge+delta));
  }

  else if(game.phase==="bottom"){
    // Three points on the seabed: P3 -> P4 -> P5.
    game.point=Math.max(2,Math.min(4,game.point+delta));

    if(game.point===4){
      takeTreasure();
    }
  }

  renderOcean();
}

function takeTreasure(){
  if(game.carrying || !game.running) return;

  game.carrying=true;
  game.bagRewarded=true;
  game.score+=1;
  scoreNode.textContent=game.score;

  bagSprite.classList.remove("show");
  void bagSprite.offsetWidth;
  bagSprite.classList.add("show");

  createScorePop("+1");

  // Brief pause: the diver visibly takes the bag, then turns back.
  game.phase="taking";
  setTimeout(()=>{
    if(!game || !game.running)return;
    game.phase="return";
  },650);
}

function deliverTreasure(){
  if(!game.carrying) return;

  game.carrying=false;

  // The original concept: on reaching the boat the bag is shown
  // three times and three points are awarded.
  rewardFlash.classList.remove("show");
  void rewardFlash.offsetWidth;
  rewardFlash.classList.add("show");

  game.score+=3;
  scoreNode.textContent=game.score;
  createScorePop("+3");

  // The successful diver is back in the boat.
  // IMPORTANT: he is NOT removed from the three-diver reserve.
  game.phase="success";

  setTimeout(()=>{
    if(!game || !game.running)return;

    // If there are fewer than three, a 200-point threshold may
    // replenish one. Otherwise the same three remain available.
    game.phase="down";
    game.point=0;
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

function loseDiver(){
  if(!game || !game.running || game.phase==="boat") return;

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
      game.point=0;
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

  const p=currentPosition();
  let x=p.x;

  if(game.phase==="down" || game.phase==="return"){
    x+=game.dodge*5.5;
  }

  x=Math.max(28,Math.min(65,x));

  diverSprite.style.left=x+"%";
  diverSprite.style.top=p.y+"%";

  // Carry the bag visibly after pickup.
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
