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

const oc=document.getElementById("oceanCanvas"),cx=oc.getContext("2d"),L=document.getElementById("left"),R=document.getElementById("right"),SC=document.getElementById("score"),OV=document.getElementById("over"),OT=document.getElementById("overTitle"),OX=document.getElementById("overText"),RS=document.getElementById("restart");
let G;
function fit(){let r=oc.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);oc.width=r.width*d;oc.height=r.height*d;cx.setTransform(d,0,0,d,0,0)}
function start(){fit();G={run:true,x:.5,score:0,t:performance.now(),left:false,right:false,treasure:false,oct:[.18,.5,.82]};SC.textContent=0;OV.classList.add("is-hidden");requestAnimationFrame(loop)}
function end(title,text,icon){G.run=false;OT.textContent=title;OX.textContent=text;document.getElementById("overIcon").textContent=icon;OV.classList.remove("is-hidden")}
function loop(n){if(!G)return;let dt=Math.min((n-G.t)/1000,.04);G.t=n;update(dt,n/1000);draw(n/1000);if(G.run)requestAnimationFrame(loop)}
function update(dt,t){let d=(G.right?1:0)-(G.left?1:0);G.x=Math.max(.07,Math.min(.93,G.x+d*.48*dt));G.score+=dt*5;SC.textContent=Math.floor(G.score);if(!G.treasure&&G.x>.43&&G.x<.57&&Math.random()<dt*.22){G.treasure=true;G.score+=500;SC.textContent=Math.floor(G.score);end("Клад найден!","Ты добрался до сокровища!","🏆");return}for(let x of G.oct){let xx=x+Math.sin(t*1.2+x*8)*.07;if(Math.abs(G.x-xx)<.065&&G.t>5000){end("Спрут заметил тебя!","Щупальца перехватили водолаза.","🐙");return}}}
function draw(t){let w=oc.clientWidth,h=oc.clientHeight;cx.clearRect(0,0,w,h);let g=cx.createLinearGradient(0,0,0,h);g.addColorStop(0,"#087f9d");g.addColorStop(.45,"#06445f");g.addColorStop(1,"#01131f");cx.fillStyle=g;cx.fillRect(0,0,w,h);
cx.fillStyle="rgba(190,245,255,.12)";for(let i=0;i<5;i++){let x=w*(.05+i*.23);cx.beginPath();cx.moveTo(x,0);cx.lineTo(x+35,0);cx.lineTo(x+150,h*.55);cx.lineTo(x+75,h*.55);cx.fill()}
cx.strokeStyle="rgba(220,250,255,.6)";cx.beginPath();for(let x=0;x<w;x+=6){let y=22+Math.sin(x*.04+t*2)*3;x?cx.lineTo(x,y):cx.moveTo(x,y)}cx.stroke();
for(let i=0;i<24;i++){let x=(i*.173%1)*w,y=((i*.097-t*.018)%1)*h;if(y<0)y+=h;cx.strokeStyle="rgba(180,245,255,.5)";cx.beginPath();cx.arc(x,y,2+(i%3),0,7);cx.stroke()}
cx.fillStyle="#02121a";cx.beginPath();cx.moveTo(0,h*.91);for(let x=0;x<=w;x+=12)cx.lineTo(x,h*(.91+Math.sin(x*.025)*.025));cx.lineTo(w,h);cx.lineTo(0,h);cx.fill();
let tx=w*.5,ty=h*.9;if(!G.treasure){cx.fillStyle="#a76525";cx.fillRect(tx-22,ty-13,44,25);cx.fillStyle="#e0aa42";cx.fillRect(tx-22,ty-13,44,5);cx.fillRect(tx-4,ty-13,8,25)}
let ox=w*.5,oy=h*.93;cx.fillStyle="#070b12";cx.beginPath();cx.ellipse(ox,oy-20,w*.13,h*.09,0,0,7);cx.fill();for(let x of G.oct){let xx=(x+Math.sin(t*1.2+x*8)*.07)*w,yy=h*(.78-Math.abs(Math.sin(t+x*5))*.06);cx.strokeStyle="#070b12";cx.lineWidth=Math.max(12,w*.045);cx.lineCap="round";cx.beginPath();cx.moveTo(ox,oy);cx.bezierCurveTo(ox,oy-40,xx,yy+45,xx,yy);cx.stroke()}
let dx=G.x*w,dy=h*.7;cx.strokeStyle="#b9d2d6";cx.lineWidth=5;cx.beginPath();cx.moveTo(dx-9,dy-10);cx.lineTo(dx-18,dy+5);cx.moveTo(dx+9,dy-10);cx.lineTo(dx+18,dy+5);cx.moveTo(dx-5,dy+8);cx.lineTo(dx-12,dy+22);cx.moveTo(dx+5,dy+8);cx.lineTo(dx+12,dy+22);cx.stroke();cx.fillStyle="#172a34";cx.fillRect(dx-10,dy-17,20,25);cx.fillStyle="#b9e8ee";cx.beginPath();cx.arc(dx,dy-27,13,0,7);cx.fill();cx.fillStyle="#062331";cx.beginPath();cx.arc(dx,dy-28,8,0,7);cx.fill();cx.fillStyle="#c8d4d8";cx.fillRect(dx+10,dy-25,8,25)}
function bind(b,k){let d=e=>{e.preventDefault();G&&(G[k]=true,b.classList.add("pressed"))},u=e=>{e.preventDefault();G&&(G[k]=false,b.classList.remove("pressed"))};["pointerdown"].forEach(x=>b.addEventListener(x,d));["pointerup","pointercancel","pointerleave"].forEach(x=>b.addEventListener(x,u))}
bind(L,"left");bind(R,"right");RS.addEventListener("click",start);window.addEventListener("resize",()=>{if(G){fit();draw(performance.now()/1000)}})
const oldShowOcean=showOcean;showOcean=()=>{oldShowOcean();setTimeout(start,50)}
