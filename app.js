const K="training-dashboard-v2";
const PLAN= {
  1: {
    n:"PULL",s:"背中・二頭・腹筋",t:"w",e:[["ラットプルダウン","3 × 8〜12"],["ロー系","3 × 8〜12"],["リアデルト","3 × 12〜15"],["アームカール","3 × 8〜12"],["ハンマーカール","2 × 10〜15"],["腹筋","3セット"]]
  },2: {
    n:"PUSH",s:"胸・肩・三頭",t:"w",e:[["チェストプレス","3 × 8〜12"],["ショルダープレス","3 × 8〜12"],["サイドレイズ","3 × 12〜15"],["三頭筋種目","3 × 10〜15"],["胸または三頭筋","2 × 10〜15"]]
  },3: {
    n:"RUN + CORE",s:"40分ラン＋体幹",t:"r",e:[]
  },4: {
    n:"UPPER",s:"背中中心＋胸・肩・腕",t:"w",e:[["ラットプルダウン","3 × 8〜12"],["ロー系","3 × 8〜12"],["チェストプレス","3 × 8〜12"],["サイドレイズ","3 × 12〜15"],["二頭筋","2 × 10〜15"],["三頭筋","2 × 10〜15"]]
  },5: {
    n:"REST",s:"完全休養",t:"x",e:[]
  },6: {
    n:"ARMS + SHOULDERS",s:"腕・肩＋軽く脚",t:"w",e:[["ショルダープレス","3 × 8〜12"],["サイドレイズ","3 × 12〜15"],["アームカール","3 × 8〜12"],["ハンマーカール","2 × 10〜15"],["三頭筋","3 × 10〜15"],["スクワット／レッグプレス","3 × 8〜12"],["腹筋","2〜3セット"]]
  },0: {
    n:"EASY RUN",s:"40分イージーラン",t:"r",e:[]
  }
};
const FOODS=[["プロテイン",22],["納豆",8],["卵",6],["鮭",18],["鶏肉",25],["サラダチキン",23],["牛乳",7],["ヨーグルト",10]];
const MEALS=[["breakfast","朝にタンパク質"],["lunch","昼にタンパク質"],["pre","筋トレ前の軽食"],["dinner","夜に主菜"],["juice","ジュースなし"],["snack","お菓子・夜食を控えた"]];
const TIMING= {
  morning:"朝・起床後",prebath:"入浴前",postbath:"入浴後",other:"その他"
};
function blank() {
  return {
    set: {
      goal:110,name:"",height:167.2,bodyTiming:"prebath"
    },body:[],wo:[],run:[],protein: {
    },meal: {
    },daily: {
    }
  }
}
let D=(()=> {
  try {
    let x=JSON.parse(localStorage.getItem(K)); if(x)return Object.assign(blank(),x, {
      set:Object.assign(blank().set,x.set|| {
      })
    }); let old=JSON.parse(localStorage.getItem("training-dashboard-v1")); if(old)return Object.assign(blank(),old, {
      set:Object.assign(blank().set,old.set|| {
      })
    });
  }
  catch {
  }
  return blank()
})();
let CUR=new Date(),lastProteinAction=null;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const pad=n=>String(n).padStart(2,"0");
function ymd(d=new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
}
function parse(s) {
  let[a,b,c]=s.split("-").map(Number);
  return new Date(a,b-1,c)
}
function startWeek(d=new Date()) {
  let x=new Date(d),n=(x.getDay()+6)%7;
  x.setDate(x.getDate()-n);
  x.setHours(0,0,0,0);
  return x
}
function save() {
  localStorage.setItem(K,JSON.stringify(D));
  renderAll()
}
function theme() {
  document.documentElement.classList.toggle("dark",D.set.theme==="dark"||(D.set.theme!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches))
}
function go(v) {
  $$('.view').forEach(x=>x.classList.toggle('active',x.dataset.view===v));
  $$('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.go===v));
  scrollTo( {
    top:0,behavior:'smooth'
  })
}
$$('[data-go]').forEach(x=>x.onclick=()=>go(x.dataset.go));
$('#theme').onclick=()=> {
  D.set.theme=document.documentElement.classList.contains('dark')?'light':'dark';
  save()
};
function pTotal(d) {
  return(D.protein[d]||[]).reduce((s,x)=>s+Number(x.g),0)
}
function bmi(w,h=D.set.height) {
  w=Number(w);
  h=Number(h)/100;
  return w&&h?(w/(h*h)).toFixed(1):"—"
}
function bodyFiltered() {
  let t=D.set.bodyTiming||"prebath";
  return D.body.filter(x=>(x.timing||"prebath")===t)
}
function avg(n) {
  let a=[...bodyFiltered()].filter(x=>x.w).sort((a,b)=>b.d.localeCompare(a.d)).slice(0,n);
  return a.length?a.reduce((s,x)=>s+Number(x.w),0)/a.length:null
}
function showToast(msg,undo) {
  let t=$('#toast');
  t.innerHTML=msg+(undo?'<button id="undoToast">取り消す</button>':'');
  t.classList.add('show');
  if(undo)$('#undoToast').onclick=()=> {
    undo();
    t.classList.remove('show')
  };
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>t.classList.remove('show'),3000)
}
function chart(el) {
  let a=[...bodyFiltered()].filter(x=>x.w).sort((a,b)=>a.d.localeCompare(b.d)).slice(-21);
  if(a.length<2) {
    el.innerHTML='2件以上記録すると表示';
    return
  }
  let V=a.map(x=>+x.w),mi=Math.min(...V)-.4,ma=Math.max(...V)+.4,W=760,H=210,p=24,pts=a.map((x,i)=>[p+(W-p*2)*i/(a.length-1),H-p-(H-p*2)*(x.w-mi)/(ma-mi)]),path=pts.map((q,i)=>(i?'L':'M')+q[0]+' '+q[1]).join(' ');
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}"><path d="${path}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${pts.map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="4" fill="var(--card)" stroke="var(--blue)" stroke-width="3"/>`).join('')}<text x="5" y="18" fill="currentColor" opacity=".55" font-size="11">${ma.toFixed(1)}kg</text><text x="5" y="${H-6}" fill="currentColor" opacity=".55" font-size="11">${mi.toFixed(1)}kg</text></svg>`
}
function renderHome() {
  let t=ymd(),p=PLAN[new Date().getDay()],n=new Date();
  $('#heroDate').textContent=`${n.getFullYear()} / ${pad(n.getMonth()+1)} / ${pad(n.getDate())}`;
  $('#heroTitle').textContent=p.n;
  $('#heroSub').textContent=p.s;
  $('#heroAction').textContent=p.t==='r'?'ランニングを記録':p.t==='x'?'休養を確認':'筋トレを開く';
  $('#heroAction').onclick=()=>go(p.t==='r'?'run':p.t==='x'?'home':'workout');
  let b=[...bodyFiltered()].sort((a,b)=>b.d.localeCompare(a.d))[0]||[...D.body].sort((a,b)=>b.d.localeCompare(a.d))[0];
  $('#dWeight').textContent=b?b.w+' kg':'—';
  $('#dWeightS').textContent=b?`${b.d}・${TIMING[b.timing||'prebath']}`:'記録なし';
  let pt=pTotal(t);
  $('#dProtein').textContent=pt+' g';
  $('#dProteinS').textContent='目標 '+D.set.goal+' g';
  let ws=startWeek(),we=new Date(ws);
  we.setDate(we.getDate()+6);
  we.setHours(23,59,59),w=D.wo.filter(x=>parse(x.d)>=ws&&parse(x.d)<=we),r=D.run.filter(x=>parse(x.d)>=ws&&parse(x.d)<=we);
  $('#dWork').textContent=w.length+' 回';
  $('#dRun').textContent=r.reduce((s,x)=>s+Number(x.km),0).toFixed(1)+' km';
  $('#dRunS').textContent=r.length+' 回';
  let meal=D.meal[t]|| {
  },stretch=D.wo.some(x=>x.d===t&&+x.stretch>0)||D.run.some(x=>x.d===t&&+x.stretch>0),list=[["tr",p.t==='x'?'休養を守る':p.t==='r'?'ランニングを実施':'筋トレを実施',p.t==='x'?!!(D.daily[t]|| {
  }).rest:p.t==='r'?D.run.some(x=>x.d===t):D.wo.some(x=>x.d===t)],["pr",'Protein '+D.set.goal+'g',pt>=D.set.goal],["fo",'食事ルールを守る',Object.values(meal).filter(Boolean).length>=4],["rc",'回復・ストレッチを意識',stretch||!!(D.daily[t]|| {
  }).recovery]];
  $('#daily').innerHTML=list.map(x=>`<div class="check"><label><input data-day="${x[0]}" type="checkbox" ${x[2]?'checked':''}>${x[1]}</label><span>${x[2]?'✓':'—'}</span></div>`).join('');
  $$('[data-day]').forEach(c=>c.onchange=()=> {
    D.daily[t]=D.daily[t]|| {
    }; if(c.dataset.day==='tr')D.daily[t].rest=c.checked; if(c.dataset.day==='rc')D.daily[t].recovery=c.checked; localStorage.setItem(K,JSON.stringify(D)); renderHome(); renderCal()
  });
  $('#score').textContent=list.filter(x=>x[2]).length+' / 4';
  let a=avg(7);
  $('#avgBadge').textContent='7日平均 '+(a?a.toFixed(1)+' kg':'—');
  chart($('#homeChart'))
}
function prevEx(n,d) {
  for(let w of [...D.wo].filter(x=>x.d<d).sort((a,b)=>b.d.localeCompare(a.d))) {
    let e=(w.e||[]).find(x=>x.n===n);
    if(e)return e
  }
  return null
}
function renderWorkout() {
  const date = $('#wpDate').value || ymd();
  const plan = PLAN[parse(date).getDay()];

  $('#wpName').textContent = plan.n;
  $('#wpSub').textContent = plan.s;

  const isWorkout = plan.t === 'w';
  $('#workoutForm').hidden = !isWorkout;
  $('#workoutRunNotice').hidden = isWorkout;
  $('#workoutRunNotice').innerHTML = plan.t === 'r'
    ? 'この日はランニング日です．距離・時間・Apple Watchの消費カロリーは <b>Run</b> タブで記録します．ストレッチもRun側の「ストレッチ分」で記録できます．'
    : 'この日は休養日です．筋トレ記録は不要です．';

  if (isWorkout) {
    $('#exList').innerHTML = plan.e
      .map((exercise, index) => {
        const previous = prevEx(exercise[0], date);
        const previousValue = previous
          ? `${previous.k || '—'}kg / ${(previous.r || []).filter(Boolean).join(', ') || '—'}`
          : '前回記録なし';

        return `
          <div class="exercise" data-ex="${index}" data-name="${exercise[0]}">
            <div class="ex-top">
              <div>
                <b>${exercise[0]}</b>
                <div class="muted exercise-plan">${exercise[1]}</div>
              </div>
              <div class="prev">前回<br>${previousValue}</div>
            </div>
            <div class="sets">
              <span>重量 kg</span>
              <input class="ew" type="number" step=".5">
              <span></span>
              <span></span>
              <span>回数</span>
              <input class="er" type="number" placeholder="1set">
              <input class="er" type="number" placeholder="2set">
              <input class="er" type="number" placeholder="3set">
            </div>
          </div>
        `;
      })
      .join('');
  }

  const history = [...D.wo]
    .sort((a, b) => b.d.localeCompare(a.d))
    .slice(0, 12);

  $('#woHistory').innerHTML = history.length
    ? history
        .map((entry) => `
          <div class="item">
            <div>
              <b>${entry.p}</b>
              <small>${entry.d} ・ ${(entry.e || []).length}種目 ・ ${entry.min || '—'}分 ・ ${entry.kcal || '—'}kcal${entry.stretch ? ` ・ stretch ${entry.stretch}分` : ''}</small>
            </div>
            <button class="btn danger" data-dw="${entry.id}">削除</button>
          </div>
        `)
        .join('')
    : '<span class="muted">まだ記録なし</span>';

  $$('[data-dw]').forEach((button) => {
    button.onclick = () => {
      D.wo = D.wo.filter((entry) => entry.id !== button.dataset.dw);
      save();
    };
  });
}
$('#wpDate').onchange=renderWorkout;
$('#clearWo').onclick=()=> {
  ['#wMin','#wKcal','#wTotalKcal','#wStretch'].forEach(x=>$(x).value='');
  renderWorkout()
};
$('#saveWo').onclick=()=> {
  let d=$('#wpDate').value,p=PLAN[parse(d).getDay()];
  if(p.t!=='w')return;
  let e=$$('.exercise').map(c=>( {
    n:c.dataset.name,k:c.querySelector('.ew').value,r:[...c.querySelectorAll('.er')].map(x=>x.value)
  })).filter(x=>x.k||x.r.some(Boolean));
  let min=$('#wMin').value,kcal=$('#wKcal').value,totalKcal=$('#wTotalKcal').value,stretch=$('#wStretch').value;
  if(!e.length&&!min&&!kcal)return alert('種目記録，運動時間，消費カロリーのどれかを入力してください．');
  D.wo=D.wo.filter(x=>x.d!==d);
  D.wo.push( {
    id:crypto.randomUUID(),d,p:p.n,e,min,kcal,totalKcal,stretch
  });
  save();
  showToast('筋トレを保存しました．')
};
function updateBmi() {
  let w=$('#bWeight').value,h=$('#bHeight').value||D.set.height;
  $('#bBmi').textContent=bmi(w,h)
}
$('#bWeight').oninput=updateBmi;
$('#bHeight').oninput=updateBmi;
$('#saveBody').onclick=()=> {
  let d=$('#bDate').value,w=$('#bWeight').value,h=$('#bHeight').value||D.set.height,timing=$('#bTiming').value;
  if(!d||!w)return alert('日付と体重を入力してください．');
  D.body.push( {
    id:crypto.randomUUID(),d,timing,h,w,bmi:bmi(w,h),f:$('#bFat').value,m:$('#bMuscle').value,v:$('#bVisceral').value,b:$('#bBmr').value,age:$('#bAge').value
  });
  save();
  ['#bWeight','#bFat','#bMuscle','#bVisceral','#bBmr','#bAge'].forEach(x=>$(x).value='');
  updateBmi();
  showToast('体組成を保存しました．')
};
function renderBody() {
  let a=[...D.body].sort((a,b)=>b.d.localeCompare(a.d)),filtered=[...bodyFiltered()].sort((a,b)=>b.d.localeCompare(a.d)),l=filtered[0]||a[0],av=avg(7);
  $('#blw').textContent=l?l.w+' kg':'—';
  $('#bld').textContent=l?`${l.d}・${TIMING[l.timing||'prebath']}`:'—';
  $('#bavg').textContent=av?av.toFixed(1)+' kg':'—';
  $('#bavgS').textContent=`${TIMING[D.set.bodyTiming]||'入浴前'}のみ`;
  $('#blf').textContent=l&&l.f?l.f+' %':'—';
  $('#blm').textContent=l&&l.m?l.m+' kg':'—';
  chart($('#bodyChart'));
  $('#bodyRows').innerHTML=a.map(x=>`<tr><td>${x.d}</td><td>${TIMING[x.timing||'prebath']}</td><td>${x.w}</td><td>${x.bmi||bmi(x.w,x.h||D.set.height)}</td><td>${x.f||'—'}</td><td>${x.m||'—'}</td><td>${x.v||'—'}</td><td>${x.b||'—'}</td><td>${x.age||'—'}</td><td><button class="btn danger" data-db="${x.id}">削除</button></td></tr>`).join('');
  $$('[data-db]').forEach(b=>b.onclick=()=> {
    D.body=D.body.filter(x=>x.id!==b.dataset.db); save()
  })
}
const pace=x=> {
  if(!x||!x.sec||!x.km)return'—';
  let s=Math.round(x.sec/x.km);
  return Math.floor(s/60)+':'+pad(s%60)
};
$('#saveRun').onclick=()=> {
  let d=$('#rDate').value,km=+$('#rKm').value,m=+$('#rMin').value||0,s=+$('#rSec').value||0;
  if(!d||!km||(!m&&!s))return alert('日付，距離，時間を入力してください．');
  D.run.push( {
    id:crypto.randomUUID(),d,km,sec:m*60+s,kcal:$('#rKcal').value,totalKcal:$('#rTotalKcal').value,hr:$('#rHr').value,stretch:$('#rStretch').value,eff:$('#rEff').value
  });
  save();
  ['#rKm','#rMin','#rSec','#rKcal','#rTotalKcal','#rHr','#rStretch'].forEach(x=>$(x).value='');
  showToast('ランニングを保存しました．')
};
function renderRun() {
  const runs = [...D.run].sort((a, b) => b.d.localeCompare(a.d));
  const now = new Date();
  const monthRuns = runs.filter((entry) => {
    const date = parse(entry.d);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });

  const weekStart = startWeek();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59);
  const weekRuns = runs.filter((entry) => parse(entry.d) >= weekStart && parse(entry.d) <= weekEnd);

  $('#mKm').textContent = monthRuns.reduce((sum, entry) => sum + entry.km, 0).toFixed(1) + ' km';
  $('#mRuns').textContent = monthRuns.length + ' runs';
  $('#pace').textContent = pace(runs[0]);

  const longest = runs.reduce((max, entry) => Math.max(max, entry.km), 0);
  $('#long').textContent = longest ? longest.toFixed(1) : '—';
  $('#wKm').textContent = weekRuns.reduce((sum, entry) => sum + entry.km, 0).toFixed(1) + ' km';

  $('#runHistory').innerHTML = runs.length
    ? runs
        .slice(0, 15)
        .map((entry) => `
          <div class="item">
            <div>
              <b>${entry.km.toFixed(2)} km ・ ${pace(entry)} /km</b>
              <small>${entry.d} ・ ${entry.eff} ・ ${Math.floor(entry.sec / 60)}分 ・ ${entry.kcal || '—'}kcal${entry.hr ? ` ・ HR ${entry.hr}` : ''}${entry.stretch ? ` ・ stretch ${entry.stretch}分` : ''}</small>
            </div>
            <button class="btn danger" data-dr="${entry.id}">削除</button>
          </div>
        `)
        .join('')
    : '<span class="muted">まだ記録なし</span>';

  $$('[data-dr]').forEach((button) => {
    button.onclick = () => {
      D.run = D.run.filter((entry) => entry.id !== button.dataset.dr);
      save();
    };
  });
}
function addP(d,n,g) {
  let entry= {
    id:crypto.randomUUID(),n,g
  };
  D.protein[d]=D.protein[d]||[];
  D.protein[d].push(entry);
  lastProteinAction= {
    d,id:entry.id
  };
  save();
  showToast(`${n} +${g}g`,()=> {
    D.protein[d]=(D.protein[d]||[]).filter(x=>x.id!==entry.id); save()
  })
}
function removeLatestP(d,n) {
  let a=D.protein[d]||[],idx=-1;
  for(let i=a.length-1; i>=0; i--) {
    if(a[i].n===n) {
      idx=i;
      break
    }
  }
  if(idx<0)return showToast(`${n} の追加記録がありません．`);
  let [removed]=a.splice(idx,1);
  save();
  showToast(`${n} を取り消しました．`,()=> {
    D.protein[d]=D.protein[d]||[]; D.protein[d].push(removed); save()
  })
}
function renderFood() {
  let d=$('#fDate').value||ymd(),t=pTotal(d),g=+D.set.goal;
  $('#pTotal').textContent=t+' g';
  $('#pBar').style.width=Math.min(100,t/g*100)+'%';
  $('#pRemain').textContent=t>=g?'目標達成 +'+(t-g)+' g':'あと '+(g-t)+' g';
  $('#quick').innerHTML=FOODS.map(x=>`<div class="foodquick"><div><b>${x[0]}</b><small>${x[1]} g / 回</small></div><button class="minus" data-minus="${x[0]}">−</button><button data-plus="${x[0]}" data-g="${x[1]}">＋</button></div>`).join('');
  $$('[data-plus]').forEach(b=>b.onclick=()=>addP(d,b.dataset.plus,+b.dataset.g));
  $$('[data-minus]').forEach(b=>b.onclick=()=>removeLatestP(d,b.dataset.minus));
  let m=D.meal[d]|| {
  };
  $('#meal').innerHTML=MEALS.map(x=>`<div class="check"><label><input data-meal="${x[0]}" type="checkbox" ${m[x[0]]?'checked':''}>${x[1]}</label><span>${m[x[0]]?'✓':'—'}</span></div>`).join('');
  $$('[data-meal]').forEach(c=>c.onchange=()=> {
    D.meal[d]=D.meal[d]|| {
    }; D.meal[d][c.dataset.meal]=c.checked; save()
  });
  let h=D.protein[d]||[];
  $('#pHistory').innerHTML=h.length?h.map(x=>`<div class="item"><div><b>${x.n}</b><small>+${x.g} g</small></div><button class="btn danger" data-dp="${x.id}">削除</button></div>`).join(''):'<span class="muted">まだ追加なし</span>';
  $$('[data-dp]').forEach(b=>b.onclick=()=> {
    D.protein[d]=D.protein[d].filter(x=>x.id!==b.dataset.dp); save()
  })
}
$('#fDate').onchange=renderFood;
$('#addP').onclick=()=> {
  let n=$('#cName').value.trim(),g=+$('#cGram').value;
  if(!n||!g)return alert('食品名とgを入力してください．');
  addP($('#fDate').value,n,g);
  $('#cName').value=$('#cGram').value=''
};
function renderCal() {
  let y=CUR.getFullYear(),m=CUR.getMonth();
  $('#calTitle').textContent=`${y}年 ${m+1}月`;
  let f=new Date(y,m,1),off=(f.getDay()+6)%7,s=new Date(y,m,1-off),today=ymd(),out=[];
  for(let i=0; i<42; i++) {
    let d=new Date(s);
    d.setDate(s.getDate()+i);
    let ds=ymd(d),w=D.wo.some(x=>x.d===ds),r=D.run.some(x=>x.d===ds),food=Object.values(D.meal[ds]|| {
    }).filter(Boolean).length>=4||pTotal(ds)>=D.set.goal,stretch=D.wo.some(x=>x.d===ds&&+x.stretch>0)||D.run.some(x=>x.d===ds&&+x.stretch>0);
    out.push(`<div class="day ${d.getMonth()!==m?'out':''} ${ds===today?'today':''}"><b class="calendar-day-number">${d.getDate()}</b><span class="marks">${w?'<i class="dot w"></i>':''}${r?'<i class="dot r"></i>':''}${food?'<i class="dot f"></i>':''}${stretch?'<i class="dot s"></i>':''}</span></div>`)
  }
  $('#cal').innerHTML=out.join('')
}
$('#prevM').onclick=()=> {
  CUR.setMonth(CUR.getMonth()-1);
  renderCal()
};
$('#nextM').onclick=()=> {
  CUR.setMonth(CUR.getMonth()+1);
  renderCal()
};
$('#saveSet').onclick=()=> {
  D.set.goal=+$('#setGoal').value||110;
  D.set.height=+$('#setHeight').value||167.2;
  D.set.bodyTiming=$('#setBodyTiming').value||'prebath';
  D.set.name=$('#setName').value.trim();
  save();
  showToast('設定を保存しました．')
};
$('#export').onclick=()=> {
  let a=document.createElement('a'),b=new Blob([JSON.stringify(D,null,2)], {
    type:'application/json'
  });
  a.href=URL.createObjectURL(b);
  a.download='training-backup-'+ymd()+'.json';
  a.click();
  URL.revokeObjectURL(a.href)
};
$('#import').onchange=async e=> {
  try {
    let x=JSON.parse(await e.target.files[0].text());
    D=Object.assign(blank(),x, {
      set:Object.assign(blank().set,x.set|| {
      })
    });
    save();
    showToast('バックアップを読み込みました．')
  }
  catch {
    alert('読み込みに失敗しました．')
  }
  e.target.value=''
};
$('#clearAll').onclick=()=> {
  if(confirm('この端末内の全記録を削除しますか？')) {
    localStorage.removeItem(K);
    D=blank();
    save()
  }
};
function renderAll() {
  theme();
  ['#wpDate','#bDate','#rDate','#fDate'].forEach(x=> {
    if(!$(x).value)$(x).value=ymd()
  });
  $('#setGoal').value=D.set.goal;
  $('#setName').value=D.set.name||'';
  $('#setHeight').value=D.set.height||167.2;
  $('#setBodyTiming').value=D.set.bodyTiming||'prebath';
  if(!$('#bHeight').value)$('#bHeight').value=D.set.height||167.2;
  renderHome();
  renderWorkout();
  renderBody();
  renderRun();
  renderFood();
  renderCal();
  updateBmi()
}
renderAll();
