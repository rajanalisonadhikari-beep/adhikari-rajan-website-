const API = "https://adhikari-rajan-api.onrender.com";

// ─── CURSOR ───────────────────────────────────────────────
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
function animRing(){rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing);}
animRing();
document.querySelectorAll('a,button,.cut-card,.circ-item').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.classList.add('hover');ring.classList.add('hover');});
  el.addEventListener('mouseleave',()=>{cur.classList.remove('hover');ring.classList.remove('hover');});
});

// ─── LOADER ───────────────────────────────────────────────
const pctEl=document.getElementById('pct');
let pct=0;
const pctInt=setInterval(()=>{
  pct=Math.min(pct+Math.random()*4,100);
  pctEl.textContent=Math.floor(pct)+'%';
  if(pct>=100){clearInterval(pctInt);setTimeout(()=>document.getElementById('loader').classList.add('out'),400);}
},60);

// ─── NAV SCROLL ───────────────────────────────────────────
const navEl=document.getElementById('nav');
window.addEventListener('scroll',()=>{navEl.classList.toggle('scrolled',window.scrollY>80);});

// ─── HERO ANIMATE ─────────────────────────────────────────
setTimeout(()=>{
  document.getElementById('hero-ey').classList.add('in');
  ['hl1','hl2','hl3'].forEach((id,i)=>setTimeout(()=>document.getElementById(id).classList.add('in'),i*180));
  setTimeout(()=>document.getElementById('hero-desc').classList.add('in'),600);
  setTimeout(()=>document.getElementById('hero-act').classList.add('in'),800);
},2600);

// ─── SCROLL REVEAL ────────────────────────────────────────
const ro=new IntersectionObserver(es=>{es.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('vis'),i*100);ro.unobserve(e.target);}});},{threshold:0.1});
document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el=>ro.observe(el));

// ─── FALLBACK IMAGES ──────────────────────────────────────
const FALLBACKS=[
  'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80',
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80',
  'https://images.unsplash.com/photo-1593702288056-7cc3b83a7369?w=600&q=80',
  'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&q=80',
  'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=600&q=80',
];

// ─── BUILD CUTS GRID FROM BACKEND ─────────────────────────
async function buildCutsGrid(){
  const grid=document.getElementById('cuts-grid');
  if(!grid) return;

  let cuts=[];
  try{
    const res=await fetch(API+'/api/services');
    const all=await res.json();
    // prefer cuts that have a photo; fall back to first 6 total
    const withPhoto=all.filter(s=>s.image);
    cuts=(withPhoto.length>=2 ? withPhoto : all).slice(0,6);
  }catch(e){ cuts=[]; }

  if(!cuts.length){
    // server asleep or empty — show static fallback cards
    const STATIC=[
      {tag:'Classic',name:'Skin Fade',desc:'A razor-clean taper from skin to length.'},
      {tag:'Timeless',name:'Crew Cut',desc:'Short, structured and eternally sharp.'},
      {tag:'Signature',name:'The Thade Cut',desc:'Mid-fade, hard part, textured crop.'},
      {tag:'Bold',name:'Pompadour',desc:'Swept-back volume with commanding presence.'},
      {tag:'Edge',name:'Undercut',desc:'Shaved sides, longer styled top.'},
      {tag:'Minimal',name:'Buzz Cut',desc:'Clean, confident, effortless.'},
    ];
    cuts=STATIC.map((s,i)=>({...s,price:'',image:FALLBACKS[i]}));
  }

  grid.innerHTML='';
  cuts.forEach((cut,i)=>{
    const card=document.createElement('div');
    card.className='cut-card reveal';
    const img=cut.image||FALLBACKS[i%FALLBACKS.length];
    card.innerHTML=`
      <img class="cut-img" src="${img}" alt="${cut.name}" style="width:100%;height:100%;object-fit:cover;display:block;" />
      <div class="cut-overlay">
        <div class="cut-number">0${i+1}</div>
        <div class="cut-tag">${cut.tag||cut.category||'Cut'}</div>
        <div class="cut-name">${cut.name}</div>
        <div class="cut-divider"></div>
        <div class="cut-desc">${cut.desc||''}</div>
        ${cut.price?`<div class="cut-desc" style="margin-top:8px;font-weight:700;color:#c9a84c;">Rs. ${cut.price}</div>`:''}
      </div>`;
    grid.appendChild(card);
    ro.observe(card);
  });
}

// ─── CIRCULAR MENU ────────────────────────────────────────
const CIRC_CUTS=[
  {name:'Skin Fade',desc:'A razor-clean taper from skin to length. Sharp edges, flawless gradient.'},
  {name:'Crew Cut',desc:'Short, structured, and eternally sharp. The gentleman\'s go-to.'},
  {name:'Textured Quiff',desc:'Volume on top, tight on the sides. Movement, texture, and edge.'},
  {name:'Pompadour',desc:'Swept-back volume commanding presence for those who lead.'},
  {name:'French Crop',desc:'Textured fringe with tight sides — effortlessly cool.'},
  {name:'Thade Cut',desc:'Our house signature — mid-fade, hard part, textured crop. One cut. Total transformation.'},
];

function buildCircular(){
  const stage=document.getElementById('circ-stage');
  const center=document.getElementById('circ-center');
  if(!stage||!center) return;
  let activeIdx=0;
  CIRC_CUTS.forEach((cut,i)=>{
    const angle=(i/CIRC_CUTS.length)*Math.PI*2-Math.PI/2;
    const x=50+Math.cos(angle)*42;
    const y=50+Math.sin(angle)*42;
    const item=document.createElement('div');
    item.className='circ-item'+(i===0?' active':'');
    item.style.cssText=`left:${x}%;top:${y}%;`;
    item.innerHTML=`<div class="circ-dot"></div><div class="circ-item-label">${cut.name}</div>`;
    item.addEventListener('click',()=>selectCirc(i));
    stage.appendChild(item);
  });
  function selectCirc(idx){
    activeIdx=idx;
    document.querySelectorAll('.circ-item').forEach((el,i)=>el.classList.toggle('active',i===idx));
    document.getElementById('circ-name').textContent=CIRC_CUTS[idx].name;
    document.getElementById('circ-desc').textContent=CIRC_CUTS[idx].desc;
    center.innerHTML=`<img src="${FALLBACKS[idx%FALLBACKS.length]}" style="width:100%;height:100%;object-fit:cover;filter:sepia(20%) brightness(0.8);" />`;
  }
  selectCirc(0);
  setInterval(()=>{activeIdx=(activeIdx+1)%CIRC_CUTS.length;selectCirc(activeIdx);},5000);
}

// ─── SIGNATURE ────────────────────────────────────────────
function buildSignature(){
  const wrap=document.getElementById('sig-img-wrap');
  if(!wrap) return;
  wrap.innerHTML=`<img src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80" style="width:100%;height:100%;object-fit:cover;filter:sepia(20%) brightness(0.75);" />`;
}

// ─── INIT ─────────────────────────────────────────────────
window.addEventListener('load',async()=>{
  await buildCutsGrid();
  buildCircular();
  buildSignature();
});

// ─── PARALLAX ─────────────────────────────────────────────
window.addEventListener('scroll',()=>{
  const y=window.scrollY;
  document.querySelectorAll('.hero-float').forEach((el,i)=>{
    el.style.transform=`translateY(${y*(0.1+i*0.05)}px)`;
  });
});

// ─── MOBILE MENU ──────────────────────────────────────────
(function(){
  const burger=document.getElementById('navBurger');
  const menu=document.getElementById('mobileMenu');
  if(!burger||!menu) return;
  function setOpen(open){
    burger.classList.toggle('open',open);
    menu.classList.toggle('open',open);
    document.body.classList.toggle('menu-open',open);
    burger.setAttribute('aria-expanded',open);
    menu.setAttribute('aria-hidden',!open);
  }
  burger.addEventListener('click',()=>setOpen(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false);});
})();
