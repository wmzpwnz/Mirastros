const names = ["", "Маг", "Жрица", "Императрица", "Император", "Жрец", "Влюбленные", "Колесница", "Сила", "Отшельник", "Колесо Фортуны", "Справедливость", "Повешенный", "Смерть", "Умеренность", "Дьявол", "Башня", "Звезда", "Луна", "Солнце", "Суд", "Мир", "Шут"];
const meanings = ["", "Воля, действие, инициатива", "Интуиция, тайна, внутренняя мудрость", "Изобилие, творчество, природа", "Структура, порядок, авторитет", "Традиция, духовность, поиск истины", "Выбор, гармония, отношения", "Контроль, победа, движение", "Сила воли, терпение, внутренняя сила", "Размышление, поиск, уединение", "Судьба, циклы, перемены", "Баланс, справедливость, карма", "Жертва, новый взгляд, переоценка", "Трансформация, окончание, новое начало", "Гармония, баланс, умеренность", "Искушение, зависимость, материальность", "Разрушение, освобождение, прорыв", "Надежда, вдохновение, духовность", "Иллюзии, страхи, подсознание", "Радость, успех, просветление", "Возрождение, прощение, новый шанс", "Завершение, достижение, целостность", "Начало, невинность, потенциал"];
const byId = id => document.getElementById(id);
const labels = {day:'День',month:'Месяц',year:'Год'};
const positions = [
 ['destiny','Судьба','day month',8,50],['character','Характер','day year',50,8],
 ['purpose','Предназначение','month year',92,50],['health','Ресурс','destiny character purpose',50,92],
 ['core','Центр','destiny character purpose health',50,50],['soul','Душа','destiny character',32,32],
 ['realization','Реализация','purpose health',68,68],['talent','Талант','character purpose',68,32],
 ['karmic','Кармическая позиция','destiny health',32,68],['shadow','Тень','core talent',50,72],
 ['heaven','Линия неба','destiny purpose',20,20],['earth','Линия земли','character health',80,80],
 ['man','Мужская линия','destiny character',80,20],['woman','Женская линия','purpose health',20,80]
];
const axes = [
 ['heaven','destiny','purpose'],['earth','character','health'],
 ['man','destiny','character'],['woman','purpose','health']
];
const comments = [
 'Какая тема возвращается в ваших решениях?', 'Как вы действуете в привычной ситуации?',
 'Какому делу вы хотите уделить силы?', 'Что помогает вам восстановиться?',
 'Какая из этих тем сейчас объединяет разные области вашей жизни?', 'Что важно вам, даже когда этого никто не видит?',
 'В каком деле вы уже видите результат?', 'Что даётся вам достаточно естественно, чтобы поделиться этим с другими?',
 'Какой повторяющийся опыт стоит осмыслить?', 'Что обычно остаётся за пределами вашего внимания?'
];
const roman = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII'];
let values, traces, currentDate;
const storageKey='mirastros.atlas.v2';
for(const [key,label] of positions){labels[key]=label;byId('list').add(new Option(label,key))}
function calculate(date){
 const [year,month,day]=date.split('-').map(Number);
 values={day,month,year};traces={};
 for(const [key,,parts] of positions){
  const operands=parts.split(' ').map(id=>values[id]);
  let sum=operands.reduce((a,b)=>a+b,0);
  let trace=operands.join(' + ')+' = '+sum;
  while(sum>22){
   const digits=String(sum).split('').map(Number);
   sum=digits.reduce((a,b)=>a+b,0);trace+=' → '+digits.join(' + ')+' = '+sum;
  }
  values[key]=sum;traces[key]=trace;
 }
}
function select(key){
 const index=positions.findIndex(p=>p[0]===key);
 const [,label,parts]=positions[index],value=values[key];
 byId('group').textContent=index<4?'Основание карты':index<10?'Личная позиция':'Ось матрицы';
 byId('position').textContent=label;byId('roman').textContent=roman[value];byId('name').textContent=names[value];
 byId('interpretation').textContent=meanings[value]+'. '+(comments[index]||'Посмотрите, какие темы связывают начало и конец этой линии.');
 byId('source').textContent=parts.split(' ').map(id=>labels[id]).join(' + ');
 byId('formula').textContent=traces[key];byId('list').value=key;
 document.querySelectorAll('.node').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.key===key)));
 try{localStorage.setItem(storageKey,JSON.stringify({date:currentDate,key}))}catch{}
}
function render(date,key){
 currentDate=date;calculate(date);
 byId('stamp').textContent=date.split('-').reverse().join('.');
 const wheel=byId('wheel');
 const ticks=Array.from({length:120},(_,i)=>'<path transform="rotate('+i*3+' 50 50)" d="M50 1v'+(i%5===0?'2':'0.8')+'"/>').join('');
 wheel.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke-width=".18" opacity=".85">'+ticks+'<circle cx="50" cy="50" r="47"/><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="25.5"/><circle cx="50" cy="50" r="9"/></g><g stroke-width=".35"><path d="M8 50 50 8 92 50 50 92Z M20 20H80V80H20Z M8 50H92 M50 8V92 M20 20L80 80 M80 20L20 80"/></g></svg>';
 for(const [id,label,,x,y] of positions){
  const b=document.createElement('button');b.className='node '+id;b.dataset.key=id;b.style.left=x+'%';b.style.top=y+'%';
  b.textContent=values[id];b.setAttribute('aria-label',label+', '+values[id]);b.onclick=()=>select(id);wheel.append(b);
 }
 byId('lines').replaceChildren();
 for(const [middle,start,end] of axes){
  const b=document.createElement('button');b.textContent=labels[middle];const seq=document.createElement('b');
  seq.textContent=[start,middle,end].map(id=>values[id]).join(' · ');b.append(seq);b.onclick=()=>{select(middle);byId('reading').scrollIntoView({block:'center'})};byId('lines').append(b);
 }
 select(key);
}
const input=byId('date');
const now=new Date();input.max=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');input.min='0001-01-01';
let selected='core';input.value='1990-05-15';
try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved){input.value=saved.date;if(!input.checkValidity())input.value='1990-05-15';if(positions.some(p=>p[0]===saved.key))selected=saved.key}}catch{}
byId('form').onsubmit=e=>{e.preventDefault();render(input.value,'core')};
byId('list').onchange=e=>select(e.target.value);
render(input.value,selected);
