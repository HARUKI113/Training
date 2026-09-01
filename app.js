const K="training-dashboard-v2";
const PLAN= {
  1: {
    n:"BACK + BICEPS",s:"背中・二頭筋・腹部",t:"w",e:[["ラットプルダウン","3 × 8〜12"],["ダンベル・ワンハンドロウ","3 × 8〜12 / 左右"],["ダンベル・リアレイズ","2 × 12〜15"],["アーム・カール","3 × 10〜15"],["アブドミナル","2 × 10〜15"]]
  },2: {
    n:"CHEST + SHOULDERS",s:"胸・肩・三頭筋",t:"w",e:[["チェストプレス","3 × 8〜12"],["ショルダープレス","3 × 8〜12"],["ダンベル・サイドレイズ","2 × 12〜15"],["アーム・エクステンション","3 × 10〜15"]]
  },3: {
    n:"EASY CARDIO",s:"ランニングマシン30〜40分（疲労時は自転車20〜30分）",t:"r",e:[]
  },4: {
    n:"FULL BODY",s:"脚・背中・胸・腹部（軽め）",t:"w",e:[["ダンベル・ゴブレットスクワット","3 × 8〜12"],["ダンベル・ルーマニアンデッドリフト","3 × 8〜12"],["ラットプルダウン","2 × 10〜12"],["チェストプレス","2 × 10〜12"],["アブドミナル","2 × 10〜15"]]
  },5: {
    n:"REST",s:"休養（疲労が強ければ完全休養）",t:"x",e:[]
  },6: {
    n:"ARMS + SHOULDERS",s:"腕・肩・腹部",t:"w",e:[["ショルダープレス","3 × 8〜12"],["アーム・カール","3 × 10〜15"],["アーム・エクステンション","3 × 10〜15"],["ダンベル・サイドレイズ","2 × 12〜15"],["アブドミナル","3 × 10〜15"]]
  },0: {
    n:"EASY RUN",s:"ランニングマシン30〜40分（疲労時は自転車20〜30分）",t:"r",e:[]
  }
};
const FOODS=[
  {n:"ごはん",serving:"150g",kcal:234,p:3.8,f:0.5,c:55.7,fiber:2.3},
  {n:"食パン",serving:"6枚切り1枚",kcal:160,p:5.6,f:2.6,c:28.0,fiber:1.4},
  {n:"バナナ",serving:"1本",kcal:86,p:1.1,f:0.2,c:22.5,fiber:1.1},
  {n:"プロテイン",serving:"1回分",kcal:120,p:22,f:2,c:4,fiber:0},
  {n:"納豆",serving:"1パック",kcal:100,p:8,f:5,c:5,fiber:3},
  {n:"卵",serving:"1個",kcal:80,p:6,f:5,c:0.2,fiber:0},
  {n:"鮭",serving:"1切れ",kcal:180,p:20,f:11,c:0,fiber:0},
  {n:"鶏肉",serving:"100g",kcal:165,p:25,f:7,c:0,fiber:0},
  {n:"サラダチキン",serving:"1個",kcal:120,p:23,f:2,c:2,fiber:0},
  {n:"豆腐",serving:"150g",kcal:84,p:7.4,f:4.5,c:2.4,fiber:0.5},
  {n:"牛乳",serving:"200ml",kcal:130,p:7,f:8,c:10,fiber:0},
  {n:"ヨーグルト",serving:"100g",kcal:60,p:3.6,f:3,c:5,fiber:0}
];
const MEALS=[["breakfast","朝ごはんを食べた"],["lunch","昼ごはんを食べた"],["pre","筋トレ前の軽食"],["dinner","晩ごはんを食べた"],["juice","ジュースなし"],["snack","お菓子・夜食を控えた"]];
const MEAL_FOODS=["ごはん","パン","卵","納豆","味噌汁","おにぎり","ヨーグルト","果物","プロテイン","肉・魚","野菜"];
const MAIN_MEALS=["breakfast","lunch","dinner"];
const TIMING= {
  morning:"朝・起床後",prebath:"入浴前",postbath:"入浴後",other:"その他"
};
function blank() {
  return {
    set: {
      goal:110,kcalGoal:0,fatGoal:0,carbGoal:0,fiberGoal:0,name:"",height:167.2,bodyTiming:"prebath"
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
  });
  if(v==='home')renderHome();
  if(v==='body')renderBody()
}
$$('[data-go]').forEach(x=>x.onclick=()=>go(x.dataset.go));
$('#theme').onclick=()=> {
  D.set.theme=document.documentElement.classList.contains('dark')?'light':'dark';
  save()
};
function hasNumber(value) {
  return value!==""&&value!==undefined&&value!==null&&Number.isFinite(Number(value))
}
function numberText(value) {
  let n=Number(value);
  if(!Number.isFinite(n))return "0";
  return Number.isInteger(n)?String(n):n.toFixed(1).replace(/\.0$/,'')
}
function nutritionTotals(d) {
  let total={kcal:0,protein:0,fat:0,carbs:0,fiber:0};
  (D.protein[d]||[]).forEach(x=> {
    total.kcal+=Number(x.kcal)||0;
    total.protein+=Number(x.g??x.p)||0;
    total.fat+=Number(x.fat??x.f)||0;
    total.carbs+=Number(x.carbs??x.c)||0;
    total.fiber+=Number(x.fiber)||0
  });
  return total
}
function nutritionText(x) {
  let out=[];
  if(hasNumber(x.kcal)&&Number(x.kcal)>0)out.push(numberText(x.kcal)+' kcal');
  let p=x.g??x.p;
  if(hasNumber(p))out.push('P '+numberText(p)+'g');
  if(hasNumber(x.fat??x.f))out.push('F '+numberText(x.fat??x.f)+'g');
  if(hasNumber(x.carbs??x.c))out.push('C '+numberText(x.carbs??x.c)+'g');
  if(hasNumber(x.fiber))out.push('食物繊維 '+numberText(x.fiber)+'g');
  return out.join(' / ')||'栄養値未入力'
}
function goalText(goal,unit) {
  return Number(goal)>0?'目標 '+numberText(goal)+' '+unit:'目標未設定'
}
function pTotal(d) {
  return nutritionTotals(d).protein
}
function mealCount(d) {
  let m=D.meal[d]||{};
  return MEALS.filter(x=>m[x[0]]).length
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
function chartRange(values,padding) {
  let min=Math.min(...values),max=Math.max(...values),span=max-min,pad=Math.max(padding,span*.12);
  if(!span)pad=Math.max(padding,Math.abs(max)*.03||1);
  return {min:min-pad,max:max+pad}
}
function chartPath(points) {
  let open=false;
  return points.map(point=> {
    if(!point) {
      open=false;
      return ''
    }
    let command=open?'L':'M';
    open=true;
    return command+point[0]+' '+point[1]
  }).join(' ')
}
function chartSeries(points,color) {
  if(!points.some(Boolean))return '';
  let path=chartPath(points),circles=points.filter(Boolean).map(point=>`<circle cx="${point[0]}" cy="${point[1]}" r="4" fill="var(--card)" stroke="${color}" stroke-width="3"/>`).join('');
  return `<path d="${path}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>${circles}`
}
function chart(el) {
  let byDate=new Map();
  [...bodyFiltered()].filter(x=>hasNumber(x.w)).sort((a,b)=>a.d.localeCompare(b.d)).slice(-21).forEach(x=>byDate.set(x.d,x));
  let a=[...byDate.values()];
  if(a.length<2) {
    el.classList.remove('has-data');
    el.innerHTML='体重を2件以上記録すると表示';
    return
  }
  el.classList.add('has-data');
  let firstDate=parse(a[0].d),lastDate=parse(a[a.length-1].d),spanDays=Math.round((lastDate-firstDate)/86400000),dayCount=Math.max(7,spanDays+1),startDate=new Date(firstDate);
  if(spanDays<6) {
    startDate=new Date(lastDate);
    startDate.setDate(startDate.getDate()-(dayCount-1))
  }
  let viewportWidth=Math.max(280,Math.round(el.clientWidth||393)),p=34,baseDayWidth=64,baseWidth=p*2+(dayCount-1)*baseDayWidth,W=Math.max(viewportWidth,baseWidth),dayWidth=baseWidth<=viewportWidth?(W-p*2)/(dayCount-1):baseDayWidth,H=290,kgTop=28,kgBottom=151,fatTop=185,fatBottom=231,xAtDate=date=>p+Math.round((parse(date)-startDate)/86400000)*dayWidth,weights=a.map(x=>+x.w),muscles=a.filter(x=>hasNumber(x.m)).map(x=>+x.m),fats=a.filter(x=>hasNumber(x.f)).map(x=>+x.f),left=chartRange(weights.concat(muscles),.4),hasFat=fats.length>0,right={min:10,max:13},y=(value,range,top,bottom)=>bottom-(bottom-top)*(value-range.min)/(range.max-range.min),weightPoints=a.map(x=>[xAtDate(x.d),y(+x.w,left,kgTop,kgBottom)]),musclePoints=a.map(x=>hasNumber(x.m)?[xAtDate(x.d),y(+x.m,left,kgTop,kgBottom)]:null),fatPoints=a.map(x=>hasNumber(x.f)?[xAtDate(x.d),y(+x.f,right,fatTop,fatBottom)]:null),ticks=[0,.5,1];
  let kgGrid=ticks.map(r=>`<line x1="${p}" x2="${W-p}" y1="${kgTop+(kgBottom-kgTop)*r}" y2="${kgTop+(kgBottom-kgTop)*r}" stroke="var(--line)" stroke-width="1" opacity=".55"/>`).join('');
  let fatGrid=hasFat?ticks.map(r=>`<line x1="${p}" x2="${W-p}" y1="${fatTop+(fatBottom-fatTop)*r}" y2="${fatTop+(fatBottom-fatTop)*r}" stroke="var(--line)" stroke-width="1" opacity=".55"/>`).join(''):'';
  let leftLabels=ticks.map(r=>`<span class="chart-axis-label" style="top:${kgTop+(kgBottom-kgTop)*r}px">${numberText(left.max-(left.max-left.min)*r)}kg</span>`).join('');
  let rightLabels=ticks.map(r=>`<span class="chart-axis-label" style="top:${fatTop+(fatBottom-fatTop)*r}px">${numberText(right.max-(right.max-right.min)*r)}%</span>`).join('');
  let dateLabels=Array.from({length:dayCount},(_,i)=> {
    let date=new Date(startDate);
    date.setDate(date.getDate()+i);
    let label=(date.getMonth()+1)+'/'+date.getDate(),x=p+i*dayWidth;
    return `<text x="${x}" y="${H-10}" text-anchor="middle" fill="currentColor" opacity=".8" font-size="11">${label}</text>`
  }).join('');
  el.innerHTML=`<div class="chart-frame"><div class="chart-scroll"><svg style="width:${W}px" viewBox="0 0 ${W} ${H}" role="img" aria-label="体重、筋肉量、体脂肪率の推移"><title>体重、筋肉量、体脂肪率の推移</title>${kgGrid}<line x1="${p}" x2="${W-p}" y1="170" y2="170" stroke="var(--line)" stroke-width="1" opacity=".8"/>${fatGrid}${chartSeries(weightPoints,'var(--blue)')}${chartSeries(musclePoints,'var(--green)')}${chartSeries(fatPoints,'var(--orange)')}${dateLabels}</svg></div><div class="chart-axis chart-axis-left" aria-hidden="true">${leftLabels}</div><div class="chart-axis chart-axis-right" aria-hidden="true">${rightLabels}</div></div><div class="chart-legend"><span class="chart-key"><i class="weight"></i>体重（kg）</span><span class="chart-key"><i class="muscle"></i>筋肉量（kg）</span><span class="chart-key"><i class="fat"></i>体脂肪率（%）</span></div>`;
  let scroller=el.querySelector('.chart-scroll');
  requestAnimationFrame(()=>scroller.scrollLeft=scroller.scrollWidth)
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
  let stretch=D.wo.some(x=>x.d===t&&+x.stretch>0)||D.run.some(x=>x.d===t&&+x.stretch>0),list=[["tr",p.t==='x'?'休養を守る':p.t==='r'?'ランニングを実施':'筋トレを実施',p.t==='x'?!!(D.daily[t]|| {
  }).rest:p.t==='r'?D.run.some(x=>x.d===t):D.wo.some(x=>x.d===t)],["pr",'Protein '+D.set.goal+'g',pt>=D.set.goal],["fo",'食事ルールを守る',mealCount(t)>=4],["rc",'回復・ストレッチを意識',stretch||!!(D.daily[t]|| {
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
    ? 'この日はランニング日です．距離・時間・Apple Watchの値は <b>RUNNING</b> タブで記録します．ストレッチもRUNNING側で記録できます．'
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
              <small>${entry.d} ・ ${(entry.e || []).length}種目 ・ ${entry.min || '—'}分 ・ ${entry.kcal || '—'}kcal${entry.totalKcal ? ` ・ 合計 ${entry.totalKcal}kcal` : ''}${entry.hr ? ` ・ HR ${entry.hr}` : ''}${entry.stretch ? ` ・ stretch ${entry.stretch}分` : ''}</small>
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
  ['#wMin','#wKcal','#wTotalKcal','#wHr','#wStretch'].forEach(x=>$(x).value='');
  renderWorkout()
};
$('#saveWo').onclick=()=> {
  let d=$('#wpDate').value,p=PLAN[parse(d).getDay()];
  if(p.t!=='w')return;
  let e=$$('.exercise').map(c=>( {
    n:c.dataset.name,k:c.querySelector('.ew').value,r:[...c.querySelectorAll('.er')].map(x=>x.value)
  })).filter(x=>x.k||x.r.some(Boolean));
  let min=$('#wMin').value,kcal=$('#wKcal').value,totalKcal=$('#wTotalKcal').value,hr=$('#wHr').value,stretch=$('#wStretch').value;
  if(!e.length&&!min&&!kcal&&!totalKcal&&!hr&&!stretch)return alert('種目記録，運動時間，Apple Watchの値のどれかを入力してください．');
  D.wo=D.wo.filter(x=>x.d!==d);
  D.wo.push( {
    id:crypto.randomUUID(),d,p:p.n,e,min,kcal,totalKcal,hr,stretch
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
    id:crypto.randomUUID(),d,km,sec:m*60+s,kcal:$('#rKcal').value,totalKcal:$('#rTotalKcal').value,hr:$('#rHr').value,maxHr:$('#rMaxHr').value,elevation:$('#rElevation').value,stretch:$('#rStretch').value,eff:$('#rEff').value
  });
  save();
  ['#rKm','#rMin','#rSec','#rKcal','#rTotalKcal','#rHr','#rMaxHr','#rElevation','#rStretch'].forEach(x=>$(x).value='');
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
              <small>${entry.d} ・ ${entry.eff} ・ ${Math.floor(entry.sec / 60)}分 ・ ${entry.kcal || '—'}kcal${entry.totalKcal ? ` ・ 合計 ${entry.totalKcal}kcal` : ''}${entry.hr ? ` ・ 平均HR ${entry.hr}` : ''}${entry.maxHr ? ` ・ 最大HR ${entry.maxHr}` : ''}${entry.elevation ? ` ・ 上昇 ${entry.elevation}m` : ''}${entry.stretch ? ` ・ stretch ${entry.stretch}分` : ''}</small>
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
function nutritionValue(value) {
  return value===""||value===undefined||value===null?"":Number(value)||0
}
function addFood(d,food) {
  let entry= {
    id:crypto.randomUUID(),
    n:food.n||food.name,
    g:nutritionValue(food.p??food.protein??food.g),
    kcal:nutritionValue(food.kcal),
    fat:nutritionValue(food.fat??food.f),
    carbs:nutritionValue(food.carbs??food.c),
    fiber:nutritionValue(food.fiber)
  };
  D.protein[d]=D.protein[d]||[];
  D.protein[d].push(entry);
  lastProteinAction= {
    d,id:entry.id
  };
  save();
  showToast(`${entry.n}を追加しました．`,()=> {
    D.protein[d]=(D.protein[d]||[]).filter(x=>x.id!==entry.id); save()
  })
}
function addP(d,n,g) {
  addFood(d,{n,p:g})
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
  let d=$('#fDate').value||ymd(),n=nutritionTotals(d),g=+D.set.goal;
  $('#calTotal').textContent=numberText(n.kcal)+' kcal';
  $('#calGoal').textContent=goalText(D.set.kcalGoal,'kcal');
  $('#pTotal').textContent=numberText(n.protein)+' g';
  $('#pRemain').textContent=g?(n.protein>=g?'目標達成 +'+numberText(n.protein-g)+' g':'あと '+numberText(g-n.protein)+' g'):'目標未設定';
  $('#fatTotal').textContent=numberText(n.fat)+' g';
  $('#fatGoal').textContent=goalText(D.set.fatGoal,'g');
  $('#carbTotal').textContent=numberText(n.carbs)+' g';
  $('#carbGoal').textContent=goalText(D.set.carbGoal,'g');
  $('#fiberTotal').textContent=numberText(n.fiber)+' g';
  $('#fiberGoal').textContent=goalText(D.set.fiberGoal,'g');
  $('#pBar').style.width=g?Math.min(100,n.protein/g*100)+'%':'0%';
  $('#quick').innerHTML=FOODS.map((x,i)=>`<div class="foodquick"><div><b>${x.n}</b><small>${x.serving} ・ ${x.kcal}kcal / P${numberText(x.p)} F${numberText(x.f)} C${numberText(x.c)}</small></div><button class="minus" data-minus="${x.n}" aria-label="${x.n}を取り消す">−</button><button data-food-index="${i}" aria-label="${x.n}を追加">＋</button></div>`).join('');
  $$('[data-food-index]').forEach(b=>b.onclick=()=>addFood(d,FOODS[+b.dataset.foodIndex]));
  $$('[data-minus]').forEach(b=>b.onclick=()=>removeLatestP(d,b.dataset.minus));
  let m=D.meal[d]|| {
  },mealFoods=m.foods|| {
  };
  $('#meal').innerHTML=MEALS.map(([key,label])=> {
    let checked=!!m[key],selected=Array.isArray(mealFoods[key])?mealFoods[key]:[];
    let foodOptions=MEAL_FOODS.map(food=>'<label class="food-option"><input data-meal-food="'+key+'" data-food="'+food+'" type="checkbox" '+(selected.includes(food)?'checked':'')+'>'+food+'</label>').join('');
    let details=MAIN_MEALS.includes(key)?'<div class="meal-foods" '+(checked?'':'hidden')+'><span class="label">食べたもの（複数選択）</span><div class="food-options">'+foodOptions+'</div></div>':'';
    return '<div class="meal-entry"><div class="check"><label><input data-meal="'+key+'" type="checkbox" '+(checked?'checked':'')+'>'+label+'</label><span>'+(checked?'✓':'—')+'</span></div>'+details+'</div>'
  }).join('');
  $$('[data-meal]').forEach(c=>c.onchange=()=> {
    D.meal[d]=D.meal[d]|| {
    };
    D.meal[d][c.dataset.meal]=c.checked;
    if(!c.checked&&MAIN_MEALS.includes(c.dataset.meal)) {
      D.meal[d].foods=D.meal[d].foods|| {
      };
      D.meal[d].foods[c.dataset.meal]=[];
    }
    save()
  });
  $$('[data-meal-food]').forEach(c=>c.onchange=()=> {
    D.meal[d]=D.meal[d]|| {
    };
    D.meal[d].foods=D.meal[d].foods|| {
    };
    let key=c.dataset.mealFood,selected=Array.isArray(D.meal[d].foods[key])?D.meal[d].foods[key]:[];
    D.meal[d].foods[key]=c.checked?[...new Set([...selected,c.dataset.food])]:selected.filter(x=>x!==c.dataset.food);
    save()
  });
  let h=D.protein[d]||[];
  $('#pHistory').innerHTML=h.length?h.map(x=>`<div class="item"><div><b>${x.n}</b><small>${nutritionText(x)}</small></div><button class="btn danger" data-dp="${x.id}">削除</button></div>`).join(''):'<span class="muted">まだ追加なし</span>';
  $$('[data-dp]').forEach(b=>b.onclick=()=> {
    D.protein[d]=D.protein[d].filter(x=>x.id!==b.dataset.dp); save()
  })
}
$('#fDate').onchange=renderFood;
$('#addP').onclick=()=> {
  let name=$('#cName').value.trim(),fields=['#cKcal','#cGram','#cFat','#cCarbs','#cFiber'];
  if(!name||!fields.some(x=>$(x).value!==''))return alert('食品名と栄養値を1つ以上入力してください．');
  addFood($('#fDate').value,{n:name,kcal:$('#cKcal').value,p:$('#cGram').value,f:$('#cFat').value,c:$('#cCarbs').value,fiber:$('#cFiber').value});
  ['#cName',...fields].forEach(x=>$(x).value='')
};
function renderCal() {
  let y=CUR.getFullYear(),m=CUR.getMonth();
  $('#calTitle').textContent=`${y}年 ${m+1}月`;
  let f=new Date(y,m,1),off=(f.getDay()+6)%7,s=new Date(y,m,1-off),today=ymd(),out=[];
  for(let i=0; i<42; i++) {
    let d=new Date(s);
    d.setDate(s.getDate()+i);
    let ds=ymd(d),w=D.wo.some(x=>x.d===ds),r=D.run.some(x=>x.d===ds),food=mealCount(ds)>=4||pTotal(ds)>=D.set.goal,stretch=D.wo.some(x=>x.d===ds&&+x.stretch>0)||D.run.some(x=>x.d===ds&&+x.stretch>0);
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
  D.set.kcalGoal=$('#setKcalGoal').value===''?0:Math.max(0,+$('#setKcalGoal').value||0);
  D.set.fatGoal=$('#setFatGoal').value===''?0:Math.max(0,+$('#setFatGoal').value||0);
  D.set.carbGoal=$('#setCarbGoal').value===''?0:Math.max(0,+$('#setCarbGoal').value||0);
  D.set.fiberGoal=$('#setFiberGoal').value===''?0:Math.max(0,+$('#setFiberGoal').value||0);
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
  $('#setKcalGoal').value=D.set.kcalGoal||'';
  $('#setFatGoal').value=D.set.fatGoal||'';
  $('#setCarbGoal').value=D.set.carbGoal||'';
  $('#setFiberGoal').value=D.set.fiberGoal||'';
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
