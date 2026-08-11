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

function openOceanGame(){
  showOcean();
  setTimeout(startGame, 120);
}
playOcean.addEventListener("click", openOceanGame);
backButton.addEventListener("click", showMenu);

window.addEventListener("load", () => {
  setTimeout(() => {
    intro.classList.add("hide");
    app.classList.remove("is-hidden");
  }, INTRO_TIME);
});









/* ===== Тайны океана v11 — полноценный маршрут туда и обратно ===== */
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

const PATH=[
 {x:30,y:34}, // лодка
 {x:30,y:54}, // под лодкой
 {x:39,y:78}, // дно 1
 {x:50,y:78}, // дно 2
 {x:61,y:78}  // клад
];

let G=null;

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
  last:performance.now()
 };
 scoreEl.textContent="0";
 diversEl.textContent="3";
 overlay.classList.add("is-hidden");
 diver.style.opacity="1";
 draw();
 requestAnimationFrame(loop);
}

function loop(now){
 if(!G||!G.run)return;
 const dt=Math.min((now-G.last)/1000,.04);
 G.last=now;
 update(dt);
 draw();
 requestAnimationFrame(loop);
}

function update(dt){
 if(G.phase==="down"){
   G.f+=dt*.38;
   if(G.f>=1){
     G.f=0;
     G.seg++;
     if(G.seg>=2){
       G.seg=1;
       G.phase="bottom";
       G.bottom=2;
     }
   }
 }
 else if(G.phase==="return"){
   // Explicitly move one segment at a time toward the boat.
   G.f+=dt*.38;
   if(G.f>=1){
     G.f=0;
     G.seg--;
     if(G.seg<0){
       arriveBoat();
       return;
     }
   }
 }

 animateTentacles();
 checkCollision();

 if(G.score>=G.next){
   if(G.divers<3)G.divers++;
   G.next+=200;
   diversEl.textContent=G.divers;
 }
}

function position(){
 if(G.phase==="bottom"||G.phase==="taking"){
   return PATH[G.bottom];
 }

 if(G.phase==="down"){
   const A=PATH[G.seg],B=PATH[G.seg+1],f=G.f;
   return {
    x:A.x+(B.x-A.x)*f,
    y:A.y+(B.y-A.y)*f
   };
 }

 if(G.phase==="return"){
   // seg 1: PATH[2] -> PATH[1]
   // seg 0: PATH[1] -> PATH[0]
   const A=PATH[G.seg+1],B=PATH[G.seg],f=G.f;
   return {
    x:A.x+(B.x-A.x)*f,
    y:A.y+(B.y-A.y)*f
   };
 }

 return PATH[0];
}

function draw(){
 if(!G)return;
 const p=position();
 let x=p.x;

 if(G.phase==="down"||G.phase==="return"){
   x+=G.dodge*5;
 }
 x=Math.max(27,Math.min(68,x));

 diver.style.left=x+"%";
 diver.style.top=p.y+"%";
 diver.classList.toggle("carrying",G.carrying);
}

function move(d){
 if(!G||!G.run)return;

 if(G.phase==="down"||G.phase==="return"){
   G.dodge=Math.max(-2,Math.min(2,G.dodge+d));
 }
 else if(G.phase==="bottom"){
   G.bottom=Math.max(2,Math.min(4,G.bottom+d));

   if(G.bottom===4){
     takeTreasure();
   }
 }
 draw();
}

function takeTreasure(){
 if(!G||G.carrying||!G.run)return;

 G.carrying=true;
 G.score++;
 scoreEl.textContent=G.score;

 G.phase="taking";
 draw();

 setTimeout(()=>{
   if(!G||!G.run)return;

   // Start return from the treasure:
   // treasure (4) -> bottom point 3 (3) -> point 2 (2)
   // -> vertical point 1 (1) -> boat (0).
   G.phase="return";
   G.seg=3;
   G.f=0;
 },650);
}

function arriveBoat(){
 G.carrying=false;
 G.score+=3;
 scoreEl.textContent=G.score;

 G.phase="success";
 draw();

 // Three bag flashes are represented by the reward animation already in the UI.
 const reward=document.getElementById("rewardFlash");
 if(reward){
   reward.classList.remove("show");
   void reward.offsetWidth;
   reward.classList.add("show");
 }

 setTimeout(()=>{
   if(!G||!G.run)return;
   // Successful diver stays alive and can dive again.
   G.phase="down";
   G.seg=0;
   G.f=0;
   G.bottom=2;
   G.dodge=0;
   draw();
 },1000);
}

function animateTentacles(){
 const arms=document.querySelectorAll(".tentacle-arm");
 arms.forEach((arm,i)=>{
   const t=performance.now()/1000;
   const wave=(Math.sin(t*(.9+i*.08)+i*1.7)+1)/2;
   arm.style.transform=`rotate(${[-8,-3,2,7,12][i]}deg) scaleX(${.3+wave*.7})`;
 });
}

function checkCollision(){
 // Collision will be tuned after the return path is visually confirmed.
}

function lose(){
 if(!G||!G.run)return;

 G.divers=Math.max(0,G.divers-1);
 diversEl.textContent=G.divers;
 diver.classList.add("hit-flash");
 setTimeout(()=>diver.classList.remove("hit-flash"),500);

 if(G.divers===0){
   G.run=false;
   titleEl.textContent="Игра окончена";
   textEl.textContent="Спрут съел всех трёх водолазов.";
   document.getElementById("overIcon").textContent="🐙";
   overlay.classList.remove("is-hidden");
 }else{
   G.phase="down";
   G.seg=0;
   G.f=0;
   G.bottom=2;
   G.dodge=0;
 }
}

left.addEventListener("pointerdown",e=>{e.preventDefault();move(-1)});
right.addEventListener("pointerdown",e=>{e.preventDefault();move(1)});

window.addEventListener("keydown",e=>{
 if(e.key==="ArrowLeft"){e.preventDefault();move(-1)}
 if(e.key==="ArrowRight"){e.preventDefault();move(1)}
});

restartBtn.addEventListener("click",startGame);

function openOceanGame(){
 showOcean();
 setTimeout(startGame,120);
}
playOcean.addEventListener("click",openOceanGame);

window.addEventListener("resize",()=>{if(G&&G.run)draw()});
