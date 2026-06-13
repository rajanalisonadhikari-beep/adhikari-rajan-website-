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

// ─── AI IMAGE GENERATION ──────────────────────────────────
const CUTS=[
  {tag:'Classic',name:'Skin Fade',desc:'A razor-clean taper from skin to length. Sharp edges, flawless gradient.',prompt:'professional studio photo of a man with a perfect skin fade haircut, dark background, dramatic barbershop lighting, high detail hair, sharp lines'},
  {tag:'Timeless',name:'Crew Cut',desc:'Short, structured, and eternally sharp. The gentleman\'s go-to.',prompt:'professional studio photo of a man with a classic crew cut haircut, barbershop setting, dark moody background, sharp clean styling'},
  {tag:'Modern',name:'Textured Quiff',desc:'Volume on top, tight on the sides. Movement, texture, and edge.',prompt:'professional studio photo of a man with a textured quiff hairstyle, styled hair, dark dramatic background, barbershop quality photo'},
  {tag:'Bold',name:'Pompadour',desc:'Swept-back volume with a commanding presence. For those who lead.',prompt:'professional studio photo of a man with a slick pompadour hairstyle, bold voluminous top, dark background, dramatic lighting'},
  {tag:'Minimal',name:'Buzz Cut',desc:'Clean, confident, effortless. Let your face do the talking.',prompt:'professional studio photo of a man with a buzz cut, clean close-cropped hair, strong jawline, dark studio background'},
  {tag:'Edge',name:'Undercut',desc:'Shaved sides, longer styled top. A contrast cut built for the bold.',prompt:'professional studio photo of a man with an undercut hairstyle, shaved sides longer top styled, dark dramatic barbershop background'},
];

const CIRC_CUTS=[
  {name:'Skin Fade',desc:'A razor-clean taper from skin to length. Sharp edges, flawless gradient.',prompt:'close up professional studio photo of man with perfect skin fade haircut dark background barbershop lighting'},
  {name:'Crew Cut',desc:'Short, structured, and eternally sharp. The gentleman\'s go-to.',prompt:'professional photo man classic crew cut dark moody background barbershop'},
  {name:'Textured Quiff',desc:'Volume on top, tight on the sides. Movement, texture, and edge.',prompt:'professional photo man textured quiff hairstyle styled dark background'},
  {name:'Pompadour',desc:'Swept-back volume commanding presence for those who lead.',prompt:'professional photo man slick pompadour hairstyle voluminous dark background'},
  {name:'French Crop',desc:'Textured fringe with tight sides — effortlessly cool.',prompt:'professional photo man french crop haircut textured fringe dark studio background'},
  {name:'Thade Cut',desc:'Our house signature — mid-fade, hard part, textured crop. One cut. Total transformation.',prompt:'professional photo man signature mid fade haircut hard part textured crop dark dramatic barbershop studio'},
];

async function generateImage(prompt){
  const res=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      model:'claude-sonnet-4-20250514',
      max_tokens:1000,
      messages:[{role:'user',content:[
        {type:'text',text:`Generate a high quality, realistic image for a premium barbershop website. The image should show: ${prompt}. Make it look like a professional photography portfolio shot with dark, moody atmosphere. Return ONLY a base64 encoded JPEG image data URI, nothing else. Format: data:image/jpeg;base64,...`}
      ]}]
    })
  });
  const d=await res.json();
  const txt=d.content?.find(c=>c.type==='text')?.text||'';
  const m=txt.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
  return m?m[0]:null;
}

// Build cuts grid
async function buildCutsGrid(){
  const grid=document.getElementById('cuts-grid');
  grid.innerHTML='';
  CUTS.forEach((cut,i)=>{
    const card=document.createElement('div');
    card.className='cut-card reveal';
    card.innerHTML=`
      <div class="cut-loading" id="cl-${i}">
        <div class="cut-spinner"></div>
        <div class="cut-loading-text">Generating AI image…</div>
      </div>
      <img class="cut-img" id="ci-${i}" src="" alt="${cut.name}" style="display:none;" />
      <div class="cut-overlay">
        <div class="cut-number">0${i+1}</div>
        <div class="cut-tag">${cut.tag}</div>
        <div class="cut-name">${cut.name}</div>
        <div class="cut-divider"></div>
        <div class="cut-desc">${cut.desc}</div>
      </div>`;
    grid.appendChild(card);
    ro.observe(card);
  });

  // Generate images in parallel batches of 2
  for(let i=0;i<CUTS.length;i+=2){
    const batch=CUTS.slice(i,i+2);
    await Promise.all(batch.map(async(cut,bi)=>{
      const idx=i+bi;
      try{
        const dataUri=await generateImage(cut.prompt);
        const loader=document.getElementById('cl-'+idx);
        const img=document.getElementById('ci-'+idx);
        if(dataUri&&img){
          img.src=dataUri;
          img.style.display='block';
          if(loader)loader.style.display='none';
        } else {
          // Fallback to Unsplash
          useFallback(idx,cut);
        }
      }catch(e){useFallback(idx,cut);}
    }));
  }
}

function useFallback(idx,cut){
  const fallbacks=[
    'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80',
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80',
    'https://images.unsplash.com/photo-1593702288056-7cc3b83a7369?w=600&q=80',
    'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&q=80',
    'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=600&q=80',
  ];
  const loader=document.getElementById('cl-'+idx);
  const img=document.getElementById('ci-'+idx);
  if(img){img.src=fallbacks[idx%fallbacks.length];img.style.display='block';}
  if(loader)loader.style.display='none';
}

// Build circular menu
async function buildCircular(){
  const stage=document.getElementById('circ-stage');
  const center=document.getElementById('circ-center');
  let activeIdx=0;

  // Place items around circle
  CIRC_CUTS.forEach((cut,i)=>{
    const angle=(i/CIRC_CUTS.length)*Math.PI*2 - Math.PI/2;
    const r=stage.offsetWidth*0.47||220;
    const x=50+Math.cos(angle)*42;
    const y=50+Math.sin(angle)*42;
    const item=document.createElement('div');
    item.className='circ-item'+(i===0?' active':'');
    item.style.cssText=`left:${x}%;top:${y}%;`;
    item.innerHTML=`<div class="circ-dot"></div><div class="circ-item-label">${cut.name}</div>`;
    item.addEventListener('click',()=>selectCirc(i));
    stage.appendChild(item);
  });

  async function selectCirc(idx){
    activeIdx=idx;
    document.querySelectorAll('.circ-item').forEach((el,i)=>el.classList.toggle('active',i===idx));
    document.getElementById('circ-name').textContent=CIRC_CUTS[idx].name;
    document.getElementById('circ-desc').textContent=CIRC_CUTS[idx].desc;
    center.innerHTML=`<div class="circ-loading" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:0.75rem;"><div class="cut-spinner"></div></div>`;
    try{
      const uri=await generateImage(CIRC_CUTS[idx].prompt);
      if(uri){
        center.innerHTML=`<img src="${uri}" style="width:100%;height:100%;object-fit:cover;filter:sepia(20%) brightness(0.8);" />`;
      } else { circFallback(idx); }
    }catch(e){ circFallback(idx); }
  }

  function circFallback(idx){
    const fb=['https://lh3.googleusercontent.com/JkbZGSelccBdPS5pCmLXA6q27qXE-92KLThSLabsRMTLdZ1TitjkPBoWRsIohjwuflvnwJld-XZfT_4C=w966','','https://lh3.googleusercontent.com/-M25YL2_viVXJGPqnnTpVW6LSfkXPidSsnvIjp9_9LPt1RtT0_Tpo6uxeKRM2-igEtbEl-gGE8BGyG7B=w600','https://lh3.googleusercontent.com/g4b36y3wLO8dNe-OAAGblM8sAYlI0T1GsXq50IlZc6EBHLROrVv6lQm0b7Q8zP5O28paGB8tbyUStDIH=w966','https://lh3.googleusercontent.com/zYUHVQeMB0rFWobUyFV4x6cEYeMmM02e-jK7OYfU1wGF2yVTWq_OaPGzluXvxupMGKP56LjerxsjoKss=w966','https://lh3.googleusercontent.com/VG-kTS4RK5WwtfkbBSWT6Fwoj1jyrJ6TpxjGcwsa4-OK0eGjSPGR-cIFoKRjnymk8QOFRkoLMNWFOvvB=w966'];
    center.innerHTML=`<img src="${fb[idx%fb.length]}" style="width:100%;height:100%;object-fit:cover;filter:sepia(20%) brightness(0.8);" />`;
  }

  selectCirc(0);

  // Auto-rotate
  setInterval(()=>{
    activeIdx=(activeIdx+1)%CIRC_CUTS.length;
    selectCirc(activeIdx);
  },5000);
}

// Signature image
async function buildSignature(){
  const wrap=document.getElementById('sig-img-wrap');
  try{
    const uri=await generateImage('professional studio portrait of a barber doing a signature thade cut mid fade hard part dark moody lighting dramatic barbershop');
    if(uri){
      wrap.innerHTML=`<img src="${uri}" style="width:100%;height:100%;object-fit:cover;filter:sepia(20%) brightness(0.75);" />`;
    } else { sigFallback(); }
  }catch(e){ sigFallback(); }
  function sigFallback(){
    wrap.innerHTML=`<img src="https://lh3.googleusercontent.com/g4b36y3wLO8dNe-OAAGblM8sAYlI0T1GsXq50IlZc6EBHLROrVv6lQm0b7Q8zP5O28paGB8tbyUStDIH=w1521" style="width:100%;height:100%;object-fit:cover;filter:sepia(20%) brightness(0.75);" />`;
  }
}

// Init all
window.addEventListener('load',()=>{
  buildCutsGrid();
  buildCircular();
  buildSignature();
});

// Parallax on hero floats
window.addEventListener('scroll',()=>{
  const y=window.scrollY;
  document.querySelectorAll('.hero-float').forEach((el,i)=>{
    el.style.transform=`translateY(${y*(0.1+i*0.05)}px)`;
  });
});

// ── EDITABLE CONTENT (managed from /admin) — falls back to defaults if unavailable ──
fetch('content.json?v=' + Date.now())
  .then(function(r){ return r.ok ? r.json() : null; })
  .then(function(c){
    if(!c) return;
    function set(id, val){ var el=document.getElementById(id); if(el && val) el.textContent = val; }
    set('hero-ey', c.hero_eyebrow);
    set('hl1', c.hero_line1);
    if(c.hero_line2){ var h2=document.getElementById('hl2'); if(h2) h2.innerHTML='<em>'+c.hero_line2+'</em>'; }
    set('hl3', c.hero_line3);
    set('hero-desc', c.hero_desc);
    set('story-p1', c.story_p1);
    set('story-p2', c.story_p2);
    set('sig-p1', c.signature_p1);
    set('sig-p2', c.signature_p2);
    set('price-val', c.price);
    set('testi1-text', c.testi1_text);
    set('testi2-text', c.testi2_text);
    if(c.testi1_author){ var a1=document.getElementById('testi1-author'); if(a1) a1.textContent='— '+c.testi1_author; }
    if(c.testi2_author){ var a2=document.getElementById('testi2-author'); if(a2) a2.textContent='— '+c.testi2_author; }
    if(c.phone){ var ph=document.getElementById('contact-phone'); if(ph){ ph.textContent=c.phone; ph.setAttribute('href','tel:'+c.phone.replace(/\s+/g,'')); } }
    if(c.instagram_handle){
      var handle=c.instagram_handle.replace(/^@/,'');
      var ih=document.getElementById('contact-insta'); if(ih) ih.textContent='@'+handle;
      document.querySelectorAll('.js-insta').forEach(function(a){ a.setAttribute('href','https://instagram.com/'+handle); });
    }
  })
  .catch(function(){});

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
