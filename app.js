const $ = id => document.getElementById(id);
const today = new Date();
const dateKey = d => d.toISOString().slice(0,10);
const money = n => 'Bs ' + Number(n||0).toLocaleString('es-BO',{minimumFractionDigits:0,maximumFractionDigits:2});
const monthKey = dateKey(today).slice(0,7);
const monthName = today.toLocaleDateString('es-BO',{month:'long',year:'numeric'});
const initial = {
  goal:20000, start:'08:00', end:'18:00',
  workers:[
    {id:1,name:'Valeria Rojas',specialty:'Peinados',rate:12},
    {id:2,name:'Camila Flores',specialty:'Tintes',rate:15},
    {id:3,name:'Daniela Pérez',specialty:'Manicure y pedicure',rate:12},
    {id:4,name:'Sofía Méndez',specialty:'Cortes',rate:10}
  ],
  services:[
    {name:'Corte de cabello',price:50,area:'Cortes'},
    {name:'Peinado',price:80,area:'Peinados'},
    {name:'Tinte',price:180,area:'Tintes'},
    {name:'Manicure',price:45,area:'Manicure y pedicure'},
    {name:'Pedicure',price:55,area:'Manicure y pedicure'},
    {name:'Tratamiento capilar',price:120,area:'Tratamientos'}
  ],
  records:[],attendance:{}
};
let db = load();
let currentUser = 'owner';
function load(){try{return JSON.parse(localStorage.getItem('beautycrm_data'))||structuredClone(initial)}catch(e){return JSON.parse(JSON.stringify(initial))}}
function save(){localStorage.setItem('beautycrm_data',JSON.stringify(db))}
function seedDemo(){if(db.records.length===0){const names=['María López','Andrea Ruiz','Lucía Vargas','Paola Arias','Carla Ríos','Mónica Salas'];const vals=[[1,1,80],[2,2,180],[3,4,45],[4,0,50],[1,5,120],[2,2,160],[3,3,55],[4,0,50],[1,1,90],[2,2,190],[3,4,45]];vals.forEach((v,i)=>{let d=new Date();d.setDate(Math.max(1,d.getDate()-(i%8)));const w=db.workers.find(x=>x.id===v[0]);db.records.push({id:Date.now()+i,client:names[i%names.length],service:db.services[v[1]].name,workerId:w.id,worker:w.name,price:v[2],rate:w.rate,commission:v[2]*w.rate/100,date:dateKey(d)})});save()}}
seedDemo();
function recordsThisMonth(){return db.records.filter(r=>r.date.slice(0,7)===monthKey)}
function recordsToday(){return db.records.filter(r=>r.date===dateKey(today))}
function workersStats(){return db.workers.map(w=>{const rs=recordsThisMonth().filter(r=>r.workerId===w.id);return {...w,revenue:rs.reduce((a,r)=>a+r.price,0),commission:rs.reduce((a,r)=>a+r.commission,0),count:rs.length,clients:new Set(rs.map(r=>r.client.toLowerCase())).size}})}
function isOwner(){return currentUser==='owner'}
function currentWorker(){return db.workers.find(w=>String(w.id)===String(currentUser))}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
function renderUser(){const sel=$('userSelect');sel.innerHTML='<option value="owner">Vista: Dueña</option>'+db.workers.map(w=>`<option value="${w.id}">Vista: ${w.name}</option>`).join('');sel.value=currentUser;$('sideName').textContent=isOwner()?'Administración':currentWorker().name;$('sideRole').textContent=isOwner()?'Propietaria':currentWorker().specialty;$('sideAvatar').textContent=isOwner()?'A':currentWorker().name[0];document.querySelectorAll('.owner-only').forEach(x=>x.style.display=isOwner()?'flex':'none');$('welcomeTitle').textContent=isOwner()?'¡Buen día, administradora!':`¡Buen día, ${currentWorker().name.split(' ')[0]}!`;document.querySelectorAll('.nav-link[data-page="team"],.nav-link[data-page="attendance"]').forEach(x=>x.style.display='flex')}
function renderDashboard(){const rs=recordsThisMonth(),total=rs.reduce((a,r)=>a+r.price,0),goal=Number(db.goal)||1,percent=Math.min(100,total/goal*100);$('revenueStat').textContent=money(total);$('goalStat').textContent=money(goal);$('servicesStat').textContent=rs.length;$('clientsStat').textContent=new Set(rs.map(r=>r.client.toLowerCase())).size;$('goalRemaining').textContent=total>=goal?'¡Meta alcanzada!':`Restan ${money(goal-total)}`;$('goalPercent').textContent=Math.round(percent)+'%';$('goalBar').style.width=percent+'%';$('goalCurrent').textContent=money(total);$('goalTotal').textContent='de '+money(goal);$('goalMessage').textContent=total>=goal?'¡Excelente! El salón alcanzó su objetivo mensual.':'Cada servicio registrado suma al avance del salón.';$('todayServices').textContent=recordsToday().length;$('todayRevenue').textContent=money(recordsToday().reduce((a,r)=>a+r.price,0));$('todayAttendance').textContent=Object.keys(db.attendance[dateKey(today)]||{}).length;
 const ranking=workersStats().sort((a,b)=>b.revenue-a.revenue);const max=Math.max(1,...ranking.map(w=>w.revenue));$('rankingList').innerHTML=ranking.map((w,i)=>`<div class="rank-row"><div class="rank-number">${i+1}</div><div class="rank-name"><strong>${w.name}</strong><small>${w.count} servicios · ${w.clients} clientes</small></div><div class="mini-track"><span style="width:${w.revenue/max*100}%"></span></div><div class="rank-value">${money(w.revenue)}</div></div>`).join('')||'<div class="empty">Todavía no hay registros.</div>';
 if(!isOwner()){const w=workersStats().find(x=>x.id===Number(currentUser));$('revenueStat').textContent=money(w.revenue);$('servicesStat').textContent=w.count;$('clientsStat').textContent=w.clients;$('goalRemaining').textContent='Tu comisión: '+money(w.commission);$('goalMessage').textContent='Este es tu rendimiento personal del mes.';$('rankingList').innerHTML=`<div class="empty">Tu comisión acumulada este mes es ${money(w.commission)}. La administración puede consultar el ranking completo.</div>`}
}
function renderServices(){ $('serviceType').innerHTML=db.services.map((s,i)=>`<option value="${i}">${s.name} · ${money(s.price)}</option>`).join('');$('workerSelect').innerHTML=db.workers.map(w=>`<option value="${w.id}">${w.name} — ${w.specialty}</option>`).join('');$('serviceDate').value=dateKey(today);if(!isOwner()){$('workerSelect').value=currentUser;$('workerSelect').disabled=true}else $('workerSelect').disabled=false;renderRecent()}
function renderRecent(){const rows=[...db.records].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,8);$('recentServices').innerHTML=rows.length?`<table><thead><tr><th>Cliente</th><th>Servicio</th><th>Trabajador</th><th>Total</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.client}</td><td>${r.service}</td><td>${r.worker}</td><td><strong>${money(r.price)}</strong></td></tr>`).join('')}</tbody></table>`:'<div class="empty">No hay servicios registrados.</div>'}
function renderTeam(){const stats=workersStats();$('teamCards').innerHTML=stats.map(w=>`<article class="worker-card"><div class="worker-top"><div class="worker-avatar">${w.name[0]}</div><div><strong>${w.name}</strong><small>${w.specialty}</small></div></div><div class="worker-metrics"><div><span>Facturación</span><strong>${money(w.revenue)}</strong></div><div><span>Comisión</span><strong>${money(w.commission)}</strong></div><div><span>Servicios</span><strong>${w.count}</strong></div><div><span>Clientes</span><strong>${w.clients}</strong></div></div></article>`).join('');$('teamTable').innerHTML=`<table><thead><tr><th>Trabajador</th><th>Especialidad</th><th>Servicios</th><th>Clientes</th><th>Facturación</th><th>Comisión</th></tr></thead><tbody>${stats.sort((a,b)=>b.revenue-a.revenue).map(w=>`<tr><td><strong>${w.name}</strong></td><td>${w.specialty}</td><td>${w.count}</td><td>${w.clients}</td><td>${money(w.revenue)}</td><td>${money(w.commission)}</td></tr>`).join('')}</tbody></table>`}
function renderAttendance(){const day=db.attendance[dateKey(today)]||{};const w=currentWorker();$('attendanceUser').textContent=isOwner()?'Selecciona un trabajador para registrar su jornada':w.name;$('checkInBtn').disabled=isOwner()||!!day[currentUser]?.in;$('checkOutBtn').disabled=isOwner()||!day[currentUser]?.in||!!day[currentUser]?.out;$('attendanceState').textContent=isOwner()?'Cambia a la vista de un trabajador para registrar asistencia':day[currentUser]?.out?`Jornada cerrada · Entrada ${day[currentUser].in} · Salida ${day[currentUser].out}`:day[currentUser]?.in?`Entrada registrada a las ${day[currentUser].in}`:'Sin registro de entrada';$('attendanceTable').innerHTML=`<table><thead><tr><th>Trabajador</th><th>Entrada</th><th>Salida</th><th>Estado</th></tr></thead><tbody>${db.workers.map(x=>{const a=day[x.id]||{};return `<tr><td><strong>${x.name}</strong></td><td>${a.in||'—'}</td><td>${a.out||'—'}</td><td>${a.out?'Completa':a.in?'En jornada':'Sin registro'}</td></tr>`}).join('')}</tbody></table>`}
function renderSettings(){$('goalInput').value=db.goal;$('startTime').value=db.start;$('endTime').value=db.end}
function renderAll(){renderUser();renderDashboard();renderServices();renderTeam();renderAttendance();renderSettings()}
function showPage(page){document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===page));document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===page));const titles={dashboard:'Panel principal',services:'Registrar servicio',team:'Equipo y rendimiento',attendance:'Asistencia',settings:'Meta y configuración'};$('pageTitle').textContent=titles[page];}
document.querySelectorAll('.nav-link').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
$('userSelect').addEventListener('change',e=>{currentUser=e.target.value;renderAll();toast('Vista de usuario cambiada.')});
$('serviceType').addEventListener('change',()=>{$('servicePrice').value=db.services[Number($('serviceType').value)].price;updateCommission()});
$('servicePrice').addEventListener('input',updateCommission);$('commissionRate').addEventListener('input',updateCommission);
function updateCommission(){$('commissionPreview').textContent=money((Number($('servicePrice').value)||0)*(Number($('commissionRate').value)||0)/100)}
$('serviceForm').addEventListener('submit',e=>{e.preventDefault();const worker=db.workers.find(w=>w.id===Number($('workerSelect').value));const price=Number($('servicePrice').value),rate=Number($('commissionRate').value);if(!worker||price<=0||rate<0||rate>100)return toast('Revisa los datos del servicio.');db.records.push({id:Date.now(),client:$('clientName').value.trim(),service:db.services[Number($('serviceType').value)].name,workerId:worker.id,worker:worker.name,price,rate,commission:price*rate/100,date:$('serviceDate').value});save();e.target.reset();$('serviceDate').value=dateKey(today);$('servicePrice').value=db.services[0].price;renderAll();toast('Servicio registrado correctamente.')});
$('goalForm').addEventListener('submit',e=>{e.preventDefault();const val=Number($('goalInput').value);if(val<=0)return toast('Ingresa una meta válida.');db.goal=val;save();renderAll();toast('Meta mensual actualizada.')});
$('scheduleForm').addEventListener('submit',e=>{e.preventDefault();db.start=$('startTime').value;db.end=$('endTime').value;save();toast('Horario esperado guardado.')});
function timeNow(){return new Date().toLocaleTimeString('es-BO',{hour:'2-digit',minute:'2-digit',hour12:false})}
$('checkInBtn').addEventListener('click',()=>{if(isOwner())return;const day=db.attendance[dateKey(today)] ||= {};day[currentUser] ||= {};day[currentUser].in=timeNow();save();renderAll();toast('Entrada registrada.')});
$('checkOutBtn').addEventListener('click',()=>{if(isOwner())return;const day=db.attendance[dateKey(today)]||{};if(day[currentUser])day[currentUser].out=timeNow();save();renderAll();toast('Salida registrada.')});
$('resetBtn').addEventListener('click',()=>{if(confirm('¿Restablecer todos los datos de demostración?')){localStorage.removeItem('beautycrm_data');db=JSON.parse(JSON.stringify(initial));seedDemo();renderAll();showPage('dashboard');toast('Datos de demostración restablecidos.')}});
$('monthChip').textContent=monthName.charAt(0).toUpperCase()+monthName.slice(1);$('todayLabel').textContent=today.toLocaleDateString('es-BO',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();$('servicePrice').value=db.services[0].price;renderAll();updateCommission();
