const byId = id => document.getElementById(id);
const labels = {day:'День рождения',month:'Месяц рождения',yearDigits:'Цифры года'};
const positions = [
 ['left','Левая вершина','day',8,50],['top','Верхняя вершина','month',50,8],
 ['right','Правая вершина','yearDigits',92,50],['bottom','Нижняя вершина','left top right',50,92],
 ['core','Личный центр','left top right bottom',50,50],
 ['nw','Верхний левый угол','left top',20,20],['ne','Верхний правый угол','top right',80,20],
 ['se','Нижний правый угол','right bottom',80,80],['sw','Нижний левый угол','bottom left',20,80],
 ['family','Родовой центр','nw ne se sw'],['combined','Общий центр силы','core family'],
 ['sky','Небо','top bottom'],['earth','Земля','left right'],['personal','Личное предназначение','sky earth'],
 ['father','Отцовская линия','nw se'],['mother','Материнская линия','ne sw'],
 ['social','Социальное предназначение','father mother'],['spirit','Духовное предназначение','personal social'],
 ['planet','Планетарное предназначение','social spirit']
];
const axes=['family','combined','sky','earth','father','mother','personal','social','spirit','planet'];
const roman = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII'];
let values, traces, currentDate;
const storageKey='mirastros.atlas.reference.1';
for(const [key,label] of positions){labels[key]=label;byId('list').add(new Option(label,key))}
function calculate(date){
 const [year,month,day]=date.split('-').map(Number);
 values={day,month,yearDigits:String(year).split('').map(Number)};traces={};
 for(const [key,,parts] of positions){
  const operands=parts.split(' ').flatMap(id=>values[id]);
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
 byId('group').textContent=index<5?'Личный квадрат':index<9?'Родовой квадрат':'Составной показатель';
 byId('position').textContent=label;byId('roman').textContent=roman[value];byId('name').textContent='Энергия '+value;
 byId('interpretation').textContent=key==='core'?'Сумма четырёх вершин личного квадрата.':key==='right'?'Правая вершина строится из суммы цифр года рождения.':('Основа расчёта — '+parts.split(' ').map(id=>labels[id].toLowerCase()).join(' и ')+'.');
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
  if(x===undefined) continue;
  const b=document.createElement('button');b.className='node '+id;b.dataset.key=id;b.style.left=x+'%';b.style.top=y+'%';
  b.textContent=values[id];b.setAttribute('aria-label',label+', '+values[id]);b.onclick=()=>select(id);wheel.append(b);
 }
 byId('lines').replaceChildren();
 for(const middle of axes){
  const b=document.createElement('button');b.textContent=labels[middle];const seq=document.createElement('b');
  seq.textContent=String(values[middle]);b.append(seq);b.onclick=()=>{select(middle);byId('reading').scrollIntoView({block:'center'})};byId('lines').append(b);
 }
 select(key);
}
const input=byId('date');
const now=new Date();input.max=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');input.min='0001-01-01';
let selected='core';input.value='1984-10-31';
try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved){input.value=saved.date;if(!input.checkValidity())input.value='1984-10-31';if(positions.some(p=>p[0]===saved.key))selected=saved.key}}catch{}
byId('form').onsubmit=e=>{e.preventDefault();render(input.value,'core')};
byId('list').onchange=e=>select(e.target.value);
render(input.value,selected);
