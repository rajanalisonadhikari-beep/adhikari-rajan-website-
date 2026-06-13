/* ════════════════════════════════════════════════════════════
   PAGES.JS — shared interactions for inner pages
   (cursor · loader · nav · scroll reveal · mobile menu · form · lightbox)
   ════════════════════════════════════════════════════════════ */

/* ─── CUSTOM CURSOR ─── */
(function(){
  const cur=document.getElementById('cursor');
  const ring=document.getElementById('cursor-ring');
  if(!cur||!ring) return;
  // Skip on touch devices
  if(window.matchMedia('(hover:none),(pointer:coarse)').matches) return;
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
  (function loop(){rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop);})();
  const hoverables='a,button,input,textarea,select,.value-card,.gallery-item,.svc-item';
  document.querySelectorAll(hoverables).forEach(el=>{
    el.addEventListener('mouseenter',()=>{cur.classList.add('hover');ring.classList.add('hover');});
    el.addEventListener('mouseleave',()=>{cur.classList.remove('hover');ring.classList.remove('hover');});
  });
})();

/* ─── LOADER ─── */
(function(){
  const pctEl=document.getElementById('pct');
  const loader=document.getElementById('loader');
  if(!loader) return;
  let pct=0;
  const t=setInterval(()=>{
    pct=Math.min(pct+Math.random()*6,100);
    if(pctEl) pctEl.textContent=Math.floor(pct)+'%';
    if(pct>=100){clearInterval(t);setTimeout(()=>loader.classList.add('out'),350);}
  },50);
  // Safety: never trap the page behind the loader
  window.addEventListener('load',()=>setTimeout(()=>loader.classList.add('out'),1600));
})();

/* ─── NAV SCROLL STATE ─── */
(function(){
  const nav=document.getElementById('nav');
  if(!nav) return;
  const onScroll=()=>nav.classList.toggle('scrolled',window.scrollY>80);
  onScroll();
  window.addEventListener('scroll',onScroll,{passive:true});
})();

/* ─── MOBILE MENU ─── */
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

/* ─── SCROLL REVEAL ─── */
(function(){
  const els=document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
  if(!els.length) return;
  const io=new IntersectionObserver(entries=>{
    entries.forEach((e,i)=>{
      if(e.isIntersecting){setTimeout(()=>e.target.classList.add('vis'),i*90);io.unobserve(e.target);}
    });
  },{threshold:0.12});
  els.forEach(el=>io.observe(el));
})();

/* ─── FOOTER YEAR ─── */
(function(){
  document.querySelectorAll('.js-year').forEach(el=>el.textContent=new Date().getFullYear());
})();

/* ─── CONTACT FORM (client-side validation + confirmation) ─── */
(function(){
  const form=document.getElementById('contactForm');
  if(!form) return;
  const success=document.getElementById('formSuccess');
  const required=['name','email','message'];

  function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}

  form.querySelectorAll('input,textarea,select').forEach(field=>{
    field.addEventListener('input',()=>field.closest('.form-group')?.classList.remove('invalid'));
  });

  document.getElementById('formSubmit').addEventListener('click',()=>{
    let ok=true;
    required.forEach(name=>{
      const field=form.querySelector('[name="'+name+'"]');
      const group=field.closest('.form-group');
      const empty=!field.value.trim();
      const bad=name==='email' && field.value.trim() && !validEmail(field.value);
      if(empty||bad){group.classList.add('invalid');ok=false;} else {group.classList.remove('invalid');}
    });
    if(!ok){form.querySelector('.invalid input,.invalid select,.invalid textarea')?.focus();return;}

    // No backend wired — confirm to the user and offer a real channel.
    form.style.display='none';
    if(success) success.classList.add('show');
  });
})();

/* ─── GALLERY LIGHTBOX ─── */
(function(){
  const items=document.querySelectorAll('.gallery-item');
  const box=document.getElementById('lightbox');
  if(!items.length||!box) return;
  const img=box.querySelector('img');
  const close=box.querySelector('.lightbox-close');
  function open(src,alt){img.src=src;img.alt=alt||'';box.classList.add('open');document.body.classList.add('menu-open');}
  function shut(){box.classList.remove('open');document.body.classList.remove('menu-open');}
  items.forEach(it=>{
    const src=it.querySelector('img');
    it.addEventListener('click',()=>open(src.dataset.full||src.src,src.alt));
  });
  close.addEventListener('click',shut);
  box.addEventListener('click',e=>{if(e.target===box)shut();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')shut();});
})();
