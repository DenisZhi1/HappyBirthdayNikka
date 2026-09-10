const $ = (selector, root = document) => root.querySelector(selector);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const announce = text => { $('#live-status').textContent = text; };
const parcelMarkup = `<div class="parcel"><div class="parcel-body"><div class="box-face box-front"><span class="parcel-sticker">HAPPY<br><b>BIRTHDAY!</b></span></div><div class="box-face box-back"></div><div class="box-face box-left"></div><div class="box-face box-right"></div><div class="box-face box-bottom"></div></div><div class="parcel-lid"><div class="lid-face lid-front"></div><div class="lid-face lid-back"></div><div class="lid-face lid-left"></div><div class="lid-face lid-right"></div><div class="lid-face lid-top"></div><div class="bow"></div><div class="bow bow-right"></div></div></div>`;
$('#hero-parcel').innerHTML = parcelMarkup;
$('#final-parcel').innerHTML = parcelMarkup;

const steps = [
  {title:'Докажи, что ты не робот.', description:'Подарки роботам не выдаём. У них и так есть обновления. Поставь галочку — и дело в шляпе.', label:'ПРОВЕРКА ЧЕЛОВЕЧНОСТИ', foot:'Совершенно серьёзная система безопасности', success:'Человек обнаружен. И, кажется, прекрасный.', next:'А ты уверена, что хочешь подарок?', render:()=>`<label class="check-control"><input type="checkbox" id="human-check"><span>Я не робот. Я именинница.</span><span class="robot" aria-hidden="true">⟳</span></label><button class="button primary" type="submit">Подтвердить <span>→</span></button>`},
  {title:'А ты уверена, что хочешь подарок?', description:'Если да, смотри ниже. Наш отдел котобезопасности просит выбрать всех котиков. Даже того, который явно что-то замышляет.', label:'КОТОКОНТРОЛЬ', foot:'Ни один кот не пострадал', success:'Котики одобряют. Уже неплохое начало.', next:'Да, хочу. Что там дальше?', render:()=>`<div class="captcha-instruction">Выбери все 3 картинки с котиками.</div><div class="tile-grid">${['🐱','🐶','🦊','🐻','😎','😺','🐰','😼','🐼'].map((animal,i)=>`<button type="button" class="animal-tile" data-index="${i}" aria-label="${['Кот','Собака','Лиса','Медведь','Смайлик в очках','Улыбающийся кот','Кролик','Хитрый кот','Панда'][i]}" aria-pressed="false">${animal}</button>`).join('')}</div><button class="button primary" type="submit">Котики найдены <span>→</span></button>`},
  {title:'Хорошо. Но насколько сильно?', description:'Мы почти поверили. Теперь поставь свечку в отмеченное место. Подарок любит точность. А мы любим немного потянуть время.', label:'ТОЧНАЯ НАСТРОЙКА ПРАЗДНИКА', foot:'Отдел контроля праздничного настроения', success:'Попадание в самое сердечко. То есть в рамочку.', next:'Так, где мой подарок?', render:()=>`<label class="code-label" for="candle-slider">Передвинь свечку в жёлтую рамку.</label><div class="slider-field"><div class="candle-rail" aria-hidden="true"><span class="candle-target"></span><span class="moving-candle">🕯️</span></div><input id="candle-slider" type="range" min="0" max="100" value="0" aria-label="Положение свечки" aria-valuetext="0 процентов"><div class="slider-labels"><span>← Двигай ползунок</span><span id="slider-value">0%</span></div></div><button class="button primary" type="submit">Вот сюда! <span>→</span></button>`},
  {title:'Последняя проверка. Наверное.', description:'Введи секретное слово с картинки. Подсказка: ради него мы иногда и ходим на дни рождения.', label:'СЕКРЕТНЫЙ КОД', foot:'Регистр букв не важен. Твоя улыбка — важна.', success:'Код принят. Тортик мысленно уже нарезан.', next:'«Наверное»?! Продолжить →', render:()=>`<div class="code-image" aria-hidden="true">${'ТОРТИК'.split('').map(c=>`<span>${c}</span>`).join('')}</div><label class="code-label" for="secret-code">Какое слово здесь спрятано?</label><input class="code-input" id="secret-code" type="text" placeholder="Твой ответ" autocomplete="off" maxlength="30" spellcheck="false"><details><summary class="code-label">Текстовая подсказка</summary><p class="code-label">Секретное слово — «тортик».</p></details><button class="button primary" type="submit">Расшифровать <span>→</span></button>`},
  {title:'Всё. Последняя. Честно-честно.', description:'Загадай желание и погаси свечи в нужном порядке. Желание можно самое смелое. Мы никому не скажем.', label:'ПРОТОКОЛ ИСПОЛНЕНИЯ ЖЕЛАНИЙ', foot:'Желания отправляются прямо во Вселенную', success:'Желание принято. Подарок разблокирован!', next:'Наконец-то! К подарку →', render:()=>`<div class="code-label">Нажми на свечи в таком порядке:</div><div class="sequence" aria-label="2, затем 4, затем 1, затем 3">2 → 4 → 1 → 3</div><div class="candle-buttons">${[1,2,3,4].map(n=>`<button type="button" class="candle-button" data-candle="${n}" aria-label="Погасить свечу ${n}"><span class="flame" aria-hidden="true">🕯️</span><b>${n}</b></button>`).join('')}</div><div class="sequence-progress">Погашено: <span id="candle-count">0</span> из 4</div><button class="button primary" type="submit" disabled>Загадала. Открывай! <span>✦</span></button>`}
];
let completed = 0;
function scrollToElement(element, focus = false) {
  element.scrollIntoView({behavior:reduceMotion?'instant':'smooth',block:'start'});
  if(focus) { const heading = $('h3',element); if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});} }
}
function addChallenge(index) {
  const step=steps[index];
  const section=document.createElement('article');
  section.className='challenge';section.id=`step-${index+1}`;
  section.setAttribute('aria-labelledby',`title-${index+1}`);
  section.innerHTML=`<div class="challenge-copy"><span class="challenge-number">0${index+1} / ${step.label}</span><h3 id="title-${index+1}">${step.title}</h3><p>${step.description}</p><div class="trust-label"><span>✧</span>${step.foot}</div></div><form class="challenge-form" novalidate><div class="captcha-brand"><strong>birthday<span>CAPTCHA</span></strong><span>0${index+1} / 05</span></div>${step.render()}<p class="status" role="status" aria-live="polite"></p><div class="captcha-foot"><span>Защита от слишком лёгких подарков</span><span>♡</span></div></form>`;
  $('#challenges').append(section);
  const form=$('form',section);let chosen=new Set();let candlePosition=0;
  if(index===1) section.querySelectorAll('.animal-tile').forEach(tile=>tile.addEventListener('click',()=>{const id=Number(tile.dataset.index);chosen.has(id)?chosen.delete(id):chosen.add(id);tile.setAttribute('aria-pressed',String(chosen.has(id)));$('.status',section).textContent='';}));
  if(index===2) $('#candle-slider',section).addEventListener('input',event=>{const value=event.target.value;$('.moving-candle',section).style.left=`${value}%`;$('#slider-value',section).textContent=`${value}%`;event.target.setAttribute('aria-valuetext',`${value} процентов`);$('.status',section).textContent='';});
  if(index===4) section.querySelectorAll('.candle-button').forEach(button=>button.addEventListener('click',()=>{
    if(Number(button.dataset.candle)!==[2,4,1,3][candlePosition]) {candlePosition=0;section.querySelectorAll('.candle-button').forEach(b=>{b.classList.remove('blown');b.disabled=false;});$('.status',section).textContent='Свечи зажглись снова. Начни с 2, затем 4, 1 и 3.';}
    else{candlePosition++;button.classList.add('blown');button.disabled=true;$('.status',section).textContent=candlePosition===4?'Все свечи погашены. Пусть сбудется!':'';}
    $('#candle-count',section).textContent=candlePosition;$('[type=submit]',section).disabled=candlePosition!==4;
  }));
  form.addEventListener('submit',event=>{
    event.preventDefault();if(index!==completed)return;
    const errors=[()=>$('#human-check',section).checked?'':'Без галочки никак. Даже в день рождения :)',()=>chosen.size===3&&[0,5,7].every(n=>chosen.has(n))?'':'Почти! Нужны ровно три котика. Смайлик в очках — под прикрытием.',()=>Math.abs(Number($('#candle-slider',section).value)-70)<=4?'':'Чуть ближе к жёлтой рамке. Она на отметке 70%.',()=>$('#secret-code',section).value.trim().toLocaleLowerCase('ru')==='тортик'?'':'Вкусно, но не то. Попробуй «тортик» русскими буквами.',()=>candlePosition===4?'':'Сначала погаси все свечи по порядку.'];
    const error=errors[index]();if(error){$('.status',section).textContent=error;return;}completeChallenge(index,section);
  });
  return section;
}
function completeChallenge(index,section) {
  completed=index+1;section.classList.add('solved');
  const nextId=completed===5?'gift':`step-${completed+1}`;
  const banner=document.createElement('div');banner.className='complete-banner';
  banner.innerHTML=`<span>✓ ${steps[index].success}</span><a href="#${nextId}">${completed===5?'К подарку ↓':'Дальше ↓'}</a>`;
  section.append(banner);
  $('#nav-count').textContent=`${completed}/5`;
  document.querySelectorAll('.progress-track li').forEach((node,i)=>{node.classList.toggle('done',i<completed);node.classList.toggle('current',i===completed);if(i<completed)$('span',node).textContent='✓';if(i===completed)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');});
  announce(steps[index].success);
  if(completed<5){const next=addChallenge(completed);setTimeout(()=>scrollToElement(next,true),reduceMotion?0:350);}
  else{$('#gift').hidden=false;$('#gift-nav').removeAttribute('aria-disabled');$('#lock-icon').textContent='✦';setTimeout(()=>scrollToElement($('#gift')),reduceMotion?0:350);}
}
addChallenge(0);
$('#gift-nav').addEventListener('click',event=>{if(completed<5){event.preventDefault();scrollToElement($(`#step-${completed+1}`));announce('Подарок откроется после пяти проверок.');}});

let rotationX=4, rotationY=-13, drag=null, opening=false, finaleTimer;
const card=$('#birthday-card');
card.insertAdjacentHTML('beforeend','<div class="card-spine" aria-hidden="true"></div><div class="card-spine right" aria-hidden="true"></div>');
function applyRotation(animate=false){card.style.transition=animate&&!reduceMotion?'transform .65s cubic-bezier(.2,.7,.2,1)':'none';card.style.transform=`rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;}
// The entire card owns the gesture, including its image and reverse-side text.
card.addEventListener('dragstart',event=>event.preventDefault());
card.addEventListener('pointerdown',event=>{
  if(event.button!==0||!event.isPrimary||drag)return;
  event.preventDefault();
  card.focus({preventScroll:true});
  card.style.transition='none';
  drag={pointerId:event.pointerId,x:event.clientX,y:event.clientY,rx:rotationX,ry:rotationY};
  card.setPointerCapture(event.pointerId);
});
card.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointerId)return;rotationY=drag.ry+(event.clientX-drag.x)*.6;rotationX=Math.max(-65,Math.min(65,drag.rx-(event.clientY-drag.y)*.35));applyRotation();});
function endDrag(event){if(drag&&event.pointerId===drag.pointerId)drag=null;}
card.addEventListener('pointerup',endDrag);card.addEventListener('pointercancel',endDrag);card.addEventListener('lostpointercapture',endDrag);
card.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;event.preventDefault();if(event.key==='ArrowLeft')rotationY-=15;if(event.key==='ArrowRight')rotationY+=15;if(event.key==='ArrowUp')rotationX=Math.max(-65,rotationX-10);if(event.key==='ArrowDown')rotationX=Math.min(65,rotationX+10);if(event.key==='Home'){rotationX=4;rotationY=-13;}applyRotation(true);});
$('#flip-card').addEventListener('click',()=>{rotationY+=180;rotationX=0;applyRotation(true);});
$('#reset-card').addEventListener('click',()=>{rotationX=4;rotationY=-13;applyRotation(true);});
$('#open-gift').addEventListener('click',()=>{
  if(opening)return;opening=true;$('#open-gift').hidden=true;$('#final-stage').classList.add('opening');$('#gift-subtitle').textContent='С Днём рождения, Ника. Пусть твоя магия становится только сильнее.';
  finaleTimer=setTimeout(()=>{$('#card-space').hidden=false;$('#card-controls').hidden=false;$('#gift').classList.add('celebrated');rotationX=4;rotationY=-13;applyRotation();celebrate();announce('С Днём рождения, Ника! Открытку можно вращать и переворачивать.');card.focus({preventScroll:true});},reduceMotion?0:650);
});
$('#replay-gift').addEventListener('click',()=>{clearTimeout(finaleTimer);opening=false;$('#card-space').hidden=true;$('#card-controls').hidden=true;$('#gift').classList.remove('celebrated');$('#final-stage').classList.remove('opening');$('#open-gift').hidden=false;$('#gift-subtitle').textContent='Этот момент можно повторять сколько угодно.';scrollToElement($('#gift'));$('#open-gift').focus({preventScroll:true});});
let confettiFrame;
function celebrate(){
  if(reduceMotion)return;
  cancelAnimationFrame(confettiFrame);
  const canvas=$('#confetti'),ctx=canvas.getContext('2d');const width=innerWidth,height=innerHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  const pieces=Array.from({length:145},()=>({x:width*.5,y:height*.65,vx:(Math.random()-.5)*18,vy:-Math.random()*17-5,color:['#e5fa32','#5282ff','#f4a7ce','#ffffff'][Math.floor(Math.random()*4)],size:Math.random()*6+3,spin:Math.random()*6,angle:Math.random()*6}));
  const started=performance.now();let previous=started;
  function frame(time){const delta=Math.min((time-previous)/16.67,2);previous=time;ctx.clearRect(0,0,width,height);pieces.forEach(p=>{p.x+=p.vx*delta;p.y+=p.vy*delta;p.vy+=.16*delta;p.vx*=Math.pow(.995,delta);p.angle+=p.spin*.025*delta;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=Math.max(0,1-(time-started)/4800);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.5);ctx.restore();});if(time-started<4800)confettiFrame=requestAnimationFrame(frame);else ctx.clearRect(0,0,width,height);}
  confettiFrame=requestAnimationFrame(frame);
}
