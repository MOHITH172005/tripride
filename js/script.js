/* TRIPRIDE — vanilla JS */
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

  /* ---------- Toast ---------- */
  let toastEl, toastT;
  function toast(msg){
    if(!toastEl){toastEl=document.createElement('div');toastEl.className='toast';toastEl.setAttribute('role','status');document.body.appendChild(toastEl);}
    toastEl.textContent=msg;toastEl.classList.add('show');
    clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove('show'),3800);
  }
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-toast]');
    if(t){e.preventDefault();toast(t.dataset.toast);}
  });

  /* ---------- Mobile menu & dropdown ---------- */
  const burger=$('.burger'), menu=$('.menu');
  if(burger&&menu){
    burger.addEventListener('click',()=>{
      const open=menu.classList.toggle('open');
      burger.classList.toggle('open',open);
      burger.setAttribute('aria-expanded',open);
      document.body.style.overflow=open?'hidden':'';
    });
    $$('.menu a').forEach(a=>a.addEventListener('click',()=>{
      menu.classList.remove('open');burger.classList.remove('open');document.body.style.overflow='';
    }));
  }
  $$('.has-dd').forEach(dd=>{
    const btn=$('.dd-btn',dd);
    btn.addEventListener('click',e=>{e.stopPropagation();dd.classList.toggle('open');btn.setAttribute('aria-expanded',dd.classList.contains('open'));});
  });
  document.addEventListener('click',e=>{$$('.has-dd.open').forEach(d=>{if(!d.contains(e.target)&&window.innerWidth>1020)d.classList.remove('open');});});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$$('.has-dd.open').forEach(d=>d.classList.remove('open'));}});
  window.addEventListener('resize',()=>{if(window.innerWidth>1020){menu&&menu.classList.remove('open');burger&&burger.classList.remove('open');document.body.style.overflow='';}});

  /* ---------- Images with graceful fallback ---------- */
  $$('[data-img]').forEach(el=>{
    const im=new Image();
    im.onload=()=>{el.style.backgroundImage='url("'+el.dataset.img+'")';};
    im.src=el.dataset.img;
  });
  /* Logo: hide text wordmark if the logo already contains the name (wide logo) */
  const logo=$('.logo-img');
  if(logo){
    const check=()=>{ if(logo.naturalWidth/logo.naturalHeight>2.4){const w=$('.wordmark');w&&(w.style.display='none');logo.style.height='38px';} };
    logo.complete?check():logo.addEventListener('load',check);
    logo.addEventListener('error',()=>{logo.style.display='none';});
  }

  /* ---------- Scroll reveal ---------- */
  const rev=$$('.reveal');
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    rev.forEach(r=>io.observe(r));
  }else rev.forEach(r=>r.classList.add('in'));
  function revealNow(root){$$('.reveal',root).forEach(r=>r.classList.add('in'));}

  /* ---------- Generic search & filter ---------- */
  function applyFilter(form){
    const list=$(form.dataset.filter); if(!list) return;
    const items=$$('.item',list);
    let shown=0;
    items.forEach(it=>{
      let ok=true;
      [...form.elements].forEach(f=>{
        if(!f.name||ok===false) return;
        const v=(f.value||'').trim().toLowerCase(); if(!v) return;
        if(f.name==='q'){ if(!it.textContent.toLowerCase().includes(v)) ok=false; }
        else if(f.name.startsWith('max')){ const k=f.name.slice(3).toLowerCase(); if(Number(it.dataset[k])>Number(v)) ok=false; }
        else if(f.tagName==='SELECT'||f.type==='hidden'){ if((it.dataset[f.name]||'').toLowerCase()!==v) ok=false; }
        else { if(!(it.dataset[f.name]||'').toLowerCase().includes(v)) ok=false; }
      });
      it.hidden=!ok; if(ok){shown++;it.classList.add('in');}
    });
    const c=$('[data-count-for="'+form.dataset.filter+'"]'); if(c) c.textContent=shown+' result'+(shown===1?'':'s')+' found';
    const em=$('[data-empty-for="'+form.dataset.filter+'"]'); if(em) em.hidden=shown>0;
  }
  $$('form[data-filter]').forEach(f=>{
    f.addEventListener('input',()=>applyFilter(f));
    f.addEventListener('change',()=>applyFilter(f));
    f.addEventListener('submit',e=>{e.preventDefault();applyFilter(f);});
    f.addEventListener('reset',()=>setTimeout(()=>{$$('.chips button',f.closest('section')||document).forEach((b,i)=>b.classList.toggle('on',b.dataset.v===''));applyFilter(f);},0));
    applyFilter(f);
  });
  $$('.chips[data-set]').forEach(ch=>{
    const form=$(ch.dataset.form); const input=form&&form.elements[ch.dataset.set];
    $$('button',ch).forEach(b=>b.addEventListener('click',()=>{
      $$('button',ch).forEach(x=>x.classList.remove('on'));b.classList.add('on');
      input.value=b.dataset.v;form.dispatchEvent(new Event('input'));
    }));
  });

  /* ---------- Add local draft: trips & vehicles ---------- */
  const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  $$('form[data-add]').forEach(f=>{
    f.addEventListener('submit',e=>{
      e.preventDefault();
      const d=Object.fromEntries(new FormData(f)); Object.keys(d).forEach(k=>d[k]=esc(String(d[k]).trim()));
      const list=$(f.dataset.target); const a=document.createElement('article');
      a.className='card item in';
      if(f.dataset.add==='trip'){
        a.dataset.dest=d.dest.toLowerCase();a.dataset.budget=d.budget||0;
        a.innerHTML='<div class="ph card-img" style="--g:linear-gradient(135deg,#0F8BD0,#9FD6F5)"><span class="badge acc">Your draft</span></div><div class="card-b"><h3>'+d.title+'</h3><div class="meta"><span>'+d.dest+'</span><span>'+d.dates+'</span><span>'+d.spots+' spots</span></div><p>Draft created in your browser only. It is not published or saved.</p><div class="price">₹'+Number(d.budget||0).toLocaleString('en-IN')+' <small>/ person (est.)</small></div></div>';
      }else{
        a.dataset.type=d.type.toLowerCase();a.dataset.price=d.price||0;a.dataset.condition=d.condition.toLowerCase();
        a.innerHTML='<div class="ph card-img" style="--g:linear-gradient(135deg,#3E7CB1,#13294b)"><span class="badge acc">Your draft</span></div><div class="card-b"><h3>'+d.title+'</h3><div class="meta"><span>'+d.type+'</span><span>'+d.condition+'</span><span>'+d.city+'</span></div><p>Draft listing in your browser only. It is not published or saved.</p><div class="price">₹'+Number(d.price||0).toLocaleString('en-IN')+'</div></div>';
      }
      list.prepend(a);f.reset();
      const flt=$('form[data-filter="'+f.dataset.target+'"]'); flt&&applyFilter(flt);
      toast('Draft added to this page preview. Publishing will be available once the platform backend is built.');
      a.scrollIntoView({behavior:'smooth',block:'center'});
    });
  });

  /* ---------- Taxi fare estimator ---------- */
  const fare=$('#fare-form');
  if(fare){
    fare.addEventListener('submit',e=>{
      e.preventDefault();
      const km=parseFloat(fare.km.value); const out=$('#fare-out');
      if(!fare.pickup.value.trim()||!fare.drop.value.trim()||!(km>0)){toast('Please enter pickup, drop and an approximate distance.');return;}
      const bike=Math.round(20+km*7), car=Math.round(45+km*13);
      const lo=v=>Math.round(v*.9), hi=v=>Math.round(v*1.15);
      out.hidden=false;
      out.innerHTML='<strong>'+esc(fare.pickup.value)+' → '+esc(fare.drop.value)+'</strong> · about '+km+' km'+
       '<div class="fare-opt"><div><b>Bike taxi</b><br><small>1 passenger · quickest in traffic</small></div><div class="price">₹'+lo(bike)+'–'+hi(bike)+'</div></div>'+
       '<div class="fare-opt"><div><b>Car taxi</b><br><small>Up to 4 passengers · AC</small></div><div class="price">₹'+lo(car)+'–'+hi(car)+'</div></div>'+
       '<p class="note">Illustrative estimate from a simple formula, not a real fare quote. Live pricing will come with the app.</p>'+
       '<button type="button" class="btn block" style="margin-top:14px" data-toast="Ride booking is not live yet. This is a design preview of the Tripride taxi flow.">Request ride</button>';
    });
  }

  /* ---------- Forms that are demos only ---------- */
  $$('form[data-demo]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();toast(f.dataset.demo);f.reset();}));

  /* ---------- Footer year ---------- */
  $$('.yr').forEach(y=>y.textContent=new Date().getFullYear());
})();
