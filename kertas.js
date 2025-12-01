 // Messages & facts
    const fortunes = {
      common: [
        "Semangat, kamu manis seperti stroberi favoritku! Hari ini pasti enak!",
        "Kalau capek, istirahat sebentar ya. Frui‑Chan bangga sama kamu!",
        "Jangan lupa tersenyum—senyummu lebih manis dari madu.",
        "Pelan‑pelan aja, nikmati momen. Manis itu dinikmati, bukan dikejar.",
        "Makan buah sedikit hari ini, biar energimu meletup seperti jeruk!"
      ],
      luck: [
        "Hari ini keberuntunganmu serasa jeruk super segar—ada hal baik menunggu!",
        "Seseorang akan teringat padamu hari ini. Manis, ya?",
        "Cobalah hal baru hari ini, rasanya bisa se‑segar fruit sando pertama."
      ],
      humor: [
        "Aku jatuh dari keranjang tadi… tapi tetap manis kok. Jangan kayak aku ya!",
        "Kalau kamu cuma makan satu fruit sando… itu kurang. Itu fakta dari ilmuwan buah.",
        "Ada 3 hal penting hari ini: makan, senyum, dan… makan lagi."
      ],
      selfcare: [
        "Minum air dulu, pipiku aja bisa segar karena hidrasi.",
        "Jangan lupa makan buah hari ini, biar kamu glowing kayak aku.",
        "Istirahat sebentar, tidur itu investasi untuk mood manismu."
      ],
      rare: [
        "Rare! Besok mungkin ada kabar baik. Simpan kebaikanmu.",
        "Kamu official 'teman buah' Frui‑Chan hari ini. Selamat!",
        "Hoki manis level ultra! Kamu pantas dapat treat enak hari ini."
      ]
    };

    const facts = [
      "Tahukah kamu? Kiwi punya vitamin C lebih tinggi dari jeruk.",
      "Stroberi bukan berry, tapi pisang iya. Unik ya!",
      "Buah saring air di tubuhmu, jadi hidrasi lebih mudah.",
      "Buah yang berwarna cerah biasanya kaya antioksidan.",
      "Jeruk & kiwi itu booster mood alami—coba aja!"
    ];

    // DOM
    const openBtn = document.getElementById('openBtn');
    const againBtn = document.getElementById('againBtn');
    const shareBtn = document.getElementById('shareBtn');
    const copyBtn = document.getElementById('copyBtn');
    const paper = document.getElementById('paper');
    const messageEl = document.getElementById('message');
    const factEl = document.getElementById('fact');
    const rarityEl = document.getElementById('rarity');
    const confettiCanvas = document.getElementById('confettiCanvas');

    // cooldown logic: once per day
    const KEY = 'fruichan-last-scan';
    function canOpen(){
      const raw = localStorage.getItem(KEY);
      if(!raw) return true;
      try{
        const d = JSON.parse(raw);
        const last = new Date(d);
        const now = new Date();
        // allow once per 24 hours
        return (now - last) > (24*60*60*1000);
      }catch(e){return true}
    }
    function markOpened(){
      localStorage.setItem(KEY, JSON.stringify(new Date()));
    }

    function pickRandom(arr){return arr[Math.floor(Math.random()*arr.length)]}

    function reveal(){
      // decide rarity (rare ~7%)
      const p = Math.random();
      let bucket = 'common';
      let rarityText = 'Common';
      if(p < 0.07){ bucket = 'rare'; rarityText = 'Rare!'; }
      else if(p < 0.25) { bucket = 'luck'; rarityText = 'Lucky'; }
      else {
        // pick from other categories randomly
        const subs = ['common','humor','selfcare'];
        bucket = subs[Math.floor(Math.random()*subs.length)];
        rarityText = 'Common';
      }

      const text = pickRandom(fortunes[bucket]);
      const fact = pickRandom(facts);

      messageEl.textContent = text;
      factEl.textContent = fact;
      rarityEl.textContent = rarityText;

      // animate paper in
      paper.classList.remove('hidden');
      paper.classList.add('reveal');

      // confetti on rare
      if(bucket === 'rare') runConfetti();

      // set cooldown
      markOpened();
      updateButtons();
    }

    function updateButtons(){
      if(canOpen()){
        openBtn.disabled = false;
        openBtn.textContent = 'Buka Pesan Hari Ini';
        againBtn.disabled = true;
      }else{
        openBtn.disabled = true;
        openBtn.textContent = 'Sudah Dibuka Hari Ini';
        againBtn.disabled = false;
      }
    }

    openBtn.addEventListener('click', ()=>{
      if(!canOpen()){return}
      reveal();
    });

    againBtn.addEventListener('click', ()=>{
      // allow manual try again but still respect 24h (so it just shows message why)
      if(!canOpen()){
        alert('Kamu sudah membuka pesan hari ini. Coba lagi besok untuk pesan baru!')
        return;
      }
      reveal();
    });

    shareBtn.addEventListener('click', async ()=>{
      const txt = messageEl.textContent + "\n\n" + factEl.textContent + "\n— Frui‑Chan";
      if(navigator.share){
        try{ await navigator.share({title:'Frui‑Chan Fortune',text:txt}); }
        catch(e){console.log('share cancelled')}
      }else{
        // fallback: open twitter share
        const url = encodeURIComponent(location.href);
        const status = encodeURIComponent(txt + ' ' + location.href);
        window.open('https://twitter.com/intent/tweet?text='+status, '_blank');
      }
    });

    copyBtn.addEventListener('click', async ()=>{
      const txt = messageEl.textContent + "\n\n" + factEl.textContent + "\n— Frui‑Chan";
      try{ await navigator.clipboard.writeText(txt); alert('Tersalin ke clipboard!') }
      catch(e){ alert('Gagal menyalin — please copy manually.'); }
    });

    // tiny confetti implementation
    function runConfetti(){
      const c = confettiCanvas;
      c.style.display = 'block';
      c.width = c.clientWidth || 600; c.height = c.clientHeight || 300;
      const ctx = c.getContext('2d');
      const pieces = [];
      for(let i=0;i<40;i++) pieces.push({x:Math.random()*c.width,y:-20,vy:2+Math.random()*6, size:4+Math.random()*7, color:['#ffd7e6','#ffd8b3','#d8ffd7','#d7e6ff'][Math.floor(Math.random()*4)], rot:Math.random()*360});
      let t=0;
      const id = setInterval(()=>{
        t+=1; ctx.clearRect(0,0,c.width,c.height);
        pieces.forEach(p=>{
          p.x += Math.sin(t/10 + p.size)*0.7;
          p.y += p.vy;
          ctx.save();
          ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
          ctx.fillStyle = p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*1.6);
          ctx.restore();
        });
        if(pieces.every(p=>p.y>c.height+40)){ clearInterval(id); c.style.display='none'; }
      },30);
    }

    // initial
    updateButtons();

    // accessibility: keyboard open
    document.addEventListener('keydown', (e)=>{ if(e.key==='Enter') openBtn.click(); });
