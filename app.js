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





/* ===== Тайны океана v5 — пять щупалец, пять точек опасности ===== */
const diverSprite=document.getElementById("diverSprite");
const dangerLayer=document.getElementById("dangerLayer");
const leftBtn=document.getElementById("left"),rightBtn=document.getElementById("right");
const scoreNode=document.getElementById("score"),diversNode=document.getElementById("divers");
const over=document.getElementById("over"),overTitle=document.getElementById("overTitle"),overText=document.getElementById("overText"),restart=document.getElementById("restart");

const route=[{x:29.8,y:34.5},{x:29.8,y:54.5},{x:38,y:78},{x:49.5,y:78},{x:61,y:78}];
const targets=[{x:40,y:31},{x:50,y:40},{x:60,y:49},{x:50,y:58},{x:40,y:67}];
let game=null;

function buildDanger(){
  dangerLayer.innerHTML="";
  targets.forEach((p,i)=>{
    const arm=document.createElement("div");
    arm.className=`tentacle-arm t${i+1}`;
    const suction=document.createElement("span"); suction.className="suction"; arm.appendChild(suction);
    dangerLayer.appendChild(arm);
    const dot=document.createElement("div"); dot.className="danger-dot";
    dot.style.left=p.x+"%";dot.style.top=p.y+"%";dangerLayer.appendChild(dot);
  });
}
buildDanger();

function startOceanGame(){
  game={running:true,phase:"down",point:0,dodge:0,score:0,divers:3,nextBonus:200,t:0,last:performance.now(),
    tentacles:[0,1,2,3,4].map((_,i)=>({phase:i*1.23,rate:.85+(i%3)*.17}))};
  scoreNode.textContent="0";diversNode.textContent="3";over.classList.add("is-hidden");renderOcean();requestAnimationFrame(oceanLoop);
}
function oceanLoop(now){
  if(!game)return;
  const dt=Math.min((now-game.last)/1000,.04);game.last=now;
  if(game.running){game.t+=dt;updateOcean(dt);renderOcean();requestAnimationFrame(oceanLoop)}
}
function updateOcean(dt){
  const g=game;
  if(g.phase==="down"){g.point+=dt*.42;if(g.point>=2){g.point=2;g.phase="bottom"}}
  else if(g.phase==="bottom"){if(g.point>=4){g.score++;scoreNode.textContent=g.score;g.phase="return"}}
  else if(g.phase==="return"){g.point-=dt*.58;if(g.point<=0){g.point=0;g.score+=3;scoreNode.textContent=g.score;g.phase="boat";setTimeout(nextDiver,550)}}

  document.querySelectorAll(".tentacle-arm").forEach((arm,i)=>{
    const q=g.tentacles[i],wave=(Math.sin(g.t*q.rate+q.phase)+1)/2;
    const reach=.35+wave*.65;
    arm.style.transform=`rotate(${[-8,-3,2,7,12][i]}deg) scaleX(${.45+reach*.55})`;
    arm.classList.toggle("opening",wave>.72);
    document.querySelectorAll(".danger-dot")[i].classList.toggle("hit",wave>.88);
  });

  if(g.phase==="down"||g.phase==="return"||g.phase==="bottom"){
    const p=currentPosition();
    for(let i=0;i<5;i++){
      const q=g.tentacles[i],wave=(Math.sin(g.t*q.rate+q.phase)+1)/2,reach=.35+wave*.65,target=targets[i];
      if(Math.hypot(p.x-target.x,p.y-target.y)<8.2&&reach>.72){loseDiver();return}
    }
  }
  if(g.score>=g.nextBonus){if(g.divers<3)g.divers++;g.nextBonus+=200;diversNode.textContent=g.divers}
}
function currentPosition(){
  const p=game.point,a=Math.max(0,Math.min(4,Math.floor(p))),b=Math.max(0,Math.min(4,Math.ceil(p))),f=p-a;
  return{x:route[a].x+(route[b].x-route[a].x)*f,y:route[a].y+(route[b].y-route[a].y)*f};
}
function move(delta){
  if(!game||!game.running)return;
  if(game.phase==="down"||game.phase==="return"){
    game.dodge=Math.max(-2,Math.min(2,game.dodge+delta));
  }else if(game.phase==="bottom"){
    game.point=Math.max(2,Math.min(4,game.point+delta));
    if(game.point===4){game.score++;scoreNode.textContent=game.score;game.phase="return"}
  }
}
function renderOcean(){
  if(!game)return;
  const p=currentPosition();
  let x=p.x;
  if(game.phase==="down"||game.phase==="return")x+=game.dodge*5.5;
  x=Math.max(28,Math.min(65,x));
  diverSprite.style.left=x+"%";diverSprite.style.top=p.y+"%";
}
function nextDiver(){
  if(!game||!game.running)return;
  if(game.divers>0){game.divers--;diversNode.textContent=game.divers;game.point=0;game.dodge=0;game.phase="down"}
  else endOcean("Игра окончена","Спрут съел всех трёх водолазов.","🐙");
}
function loseDiver(){
  game.divers=Math.max(0,game.divers-1);diversNode.textContent=game.divers;
  diverSprite.classList.add("hit-flash");setTimeout(()=>diverSprite.classList.remove("hit-flash"),500);
  if(game.divers===0)endOcean("Игра окончена","Спрут съел всех трёх водолазов.","🐙");
  else{game.phase="boat";setTimeout(nextDiver,700)}
}
function endOcean(title,text,icon){
  game.running=false;overTitle.textContent=title;overText.textContent=text;
  document.getElementById("overIcon").textContent=icon;over.classList.remove("is-hidden");
}
leftBtn.addEventListener("pointerdown",e=>{e.preventDefault();move(-1)});
rightBtn.addEventListener("pointerdown",e=>{e.preventDefault();move(1)});
window.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a"){e.preventDefault();move(-1)}if(e.key==="ArrowRight"||e.key.toLowerCase()==="d"){e.preventDefault();move(1)}});
restart.addEventListener("click",startOceanGame);
const oldShowOcean=showOcean;showOcean=()=>{oldShowOcean();setTimeout(startOceanGame,80)};
window.addEventListener("resize",()=>{if(game)renderOcean()});
