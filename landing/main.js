const productButton = document.querySelector('.dropdown > button');
const menu = document.querySelector('.menu');
function closeMenu() { productButton.setAttribute('aria-expanded', 'false'); menu.hidden = true; }
productButton.addEventListener('click', () => { const open = productButton.getAttribute('aria-expanded') !== 'true'; productButton.setAttribute('aria-expanded', String(open)); menu.hidden = !open; });
document.addEventListener('click', event => { if (!event.target.closest('.dropdown')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => document.querySelector('#start-dialog').showModal()));
document.querySelectorAll('.janus-link').forEach(button => button.addEventListener('click', () => { closeMenu(); document.querySelector('#janus-dialog').showModal(); }));
document.querySelectorAll('dialog').forEach(dialog => { dialog.querySelector('.close').addEventListener('click', () => dialog.close()); dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close(); }); });

// A moving contour with independently flowing filaments. No remote runtime or tracking.
const canvas = document.querySelector('#strands');
const ctx = canvas.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let width = 0, height = 0, frame = 0, visible = true, clock = 0, last = 0;
const pointer = {x: -1000, y: -1000, dx: 0, dy: 0, strength: 0, active:false};
function resize() {
  const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
  if (reduced.matches) draw(0);
}
// Fixed random seed keeps the plume stable between frames without repeating a grid.
let eruptionSeed = 7319;
function eruptionRandom() {
  eruptionSeed = (Math.imul(eruptionSeed, 1664525) + 1013904223) >>> 0;
  return eruptionSeed / 4294967296;
}
const ejecta = Array.from({length: 145}, () => ({
  delay: eruptionRandom() * 6.8,
  life: 1.8 + eruptionRandom() * 1.65,
  x: (eruptionRandom() - .5) * 47,
  vx: (eruptionRandom() - .5) * 98,
  vy: -90 - eruptionRandom() * 81,
  size: .45 + eruptionRandom() * .9,
  phase: eruptionRandom() * Math.PI * 2,
  warm: eruptionRandom() > .48
}));
// Project flowing mountain ridges around an open elliptical crater.
function draw(time) {
  if (!ctx || !width || !height) return;
  ctx.clearRect(0, 0, width, height);
  const scale = Math.min(width / 640, height / 620);
  const ox = (width - 640 * scale) / 2, oy = (height - 620 * scale) / 2;
  pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * .07;
  function project(x, y) {
    x = ox + x * scale; y = oy + y * scale;
    const dx = x - pointer.x, dy = y - pointer.y;
    const force = Math.exp(-(dx * dx + dy * dy) / 9000) * pointer.strength * .13;
    return [x + dx * force, y + dy * force];
  }
  function ridge(angle, t) {
    const spread = Math.pow(t, 1.6);
    const radius = 65 + 205 * spread;
    const ripple = Math.sin(angle * 11 + t * 12 + time * .23) * 3 * Math.sin(t * Math.PI);
    const x = 325 + Math.cos(angle) * (radius + ripple) + 7 * Math.sin(t * 3);
    const y = 225 + t * 250 + Math.sin(angle) * (20 + 51 * spread);
    return project(x, y);
  }
  // Far ridges first, near ridges last, retaining an airy wire sculpture.
  for (const front of [false, true]) {
    for (let i = 0; i < 156; i++) {
      const angle = i / 156 * Math.PI * 2;
      if ((Math.sin(angle) >= 0) !== front) continue;
      const alpha = front ? .20 + .10 * Math.sin(angle) : .045;
      ctx.strokeStyle = `rgba(202,200,186,${alpha})`;
      ctx.lineWidth = .65 * scale;
      ctx.beginPath();
      for (let j = 0; j <= 52; j++) {
        const p = ridge(angle, j / 52);
        if (j === 0) ctx.moveTo(...p); else ctx.lineTo(...p);
      }
      ctx.stroke();
      if (front || i % 3 === 0) {
        const t = ((i * .618 + time * .035) % 1);
        const p = ridge(angle, t);
        ctx.fillStyle = `rgba(228,222,203,${front ? .65 : .2})`;
        ctx.beginPath();ctx.arc(...p, .75 * scale, 0, Math.PI * 2);ctx.fill();
      }
    }
  }
  // A visible crater, with a second inset rim for depth.
  for (let ring = 0; ring < 3; ring++) {
    ctx.strokeStyle = ring === 0 ? 'rgba(232,218,190,.68)' : 'rgba(192,167,128,.22)';
    ctx.lineWidth = (ring === 0 ? .9 : .55) * scale;
    ctx.beginPath();
    for (let i = 0; i <= 160; i++) {
      const a = i / 160 * Math.PI * 2;
      const p = project(325 + (65 - ring * 5) * Math.cos(a), 225 + ring * 4 + (20 - ring * 2) * Math.sin(a));
      if (!i) ctx.moveTo(...p); else ctx.lineTo(...p);
    }
    ctx.stroke();
  }
  // Overlapping irregular bursts rise, spread under gravity, and fade on descent.
  for (const particle of ejecta) {
    const age = ((time + 8 - particle.delay) % 8 + 8) % 8;
    if (age > particle.life) continue;
    const progress = age / particle.life;
    const fade = Math.min(1, age * 9) * Math.pow(1 - progress, 1.3);
    const position = t => project(
      325 + particle.x + particle.vx * t + Math.sin(t * 2.8 + particle.phase) * t * 6,
      218 + particle.vy * t + 36 * t * t
    );
    const tip = position(age);
    const tint = particle.warm ? '224,167,103' : '228,225,211';
    const tail = Math.max(0, age - .10 - particle.size * .035);
    const start = position(tail);
    const gradient = ctx.createLinearGradient(start[0], start[1], tip[0], tip[1] + .001);
    gradient.addColorStop(0, `rgba(${tint},0)`);
    gradient.addColorStop(1, `rgba(${tint},${fade * .46})`);
    ctx.strokeStyle = gradient;ctx.lineWidth = particle.size * scale * .65;
    ctx.beginPath();ctx.moveTo(...start);
    const middle = position((tail + age) / 2);
    ctx.quadraticCurveTo(...middle, ...tip);ctx.stroke();
    ctx.fillStyle = `rgba(${tint},${fade * .8})`;
    ctx.beginPath();ctx.arc(...tip, particle.size * scale, 0, Math.PI * 2);ctx.fill();
  }

}
function tick(now) { frame = 0; if (document.hidden || !visible) return; if(last) clock += Math.min((now-last)/1000,.05); last=now; draw(reduced.matches ? 0 : clock); if(!reduced.matches) frame=requestAnimationFrame(tick); }
function resume() { if(frame) cancelAnimationFrame(frame); frame=0; last=0; if(!document.hidden&&visible) frame=requestAnimationFrame(tick); }
canvas.addEventListener('pointermove', event => { const rect = canvas.getBoundingClientRect(); pointer.x=event.clientX-rect.left;pointer.y=event.clientY-rect.top;pointer.active=!reduced.matches; });
canvas.addEventListener('pointerleave',()=>{pointer.active=false;});
new ResizeObserver(resize).observe(canvas);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();}).observe(canvas);
document.addEventListener('visibilitychange',resume);
reduced.addEventListener('change',resume);
resize();resume();

const languageToggle = document.querySelector('.language-toggle');
const languageMenu = document.querySelector('.language-menu');
function closeLanguages(){languageMenu.hidden=true;languageToggle.setAttribute('aria-expanded','false');}
languageToggle.addEventListener('click',()=>{const open=languageMenu.hidden;closeMenu();languageMenu.hidden=!open;languageToggle.setAttribute('aria-expanded',String(open));});
document.addEventListener('click',event=>{if(!event.target.closest('.language-picker'))closeLanguages();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!languageMenu.hidden){closeLanguages();languageToggle.focus();}});
const translations={
'AgentKit 产品文档':'AgentKit product docs',
'Python 开发工具包':'Python SDK','构建应用并接入 AgentKit 服务':'Build apps and connect to AgentKit services',
'产品文档':'Product docs','开发者文档':'Developer docs','AgentKit 控制台':'AgentKit Console','产品介绍':'Overview','查看产品':'Explore products','产品':'Products','文档':'Docs','开始使用':'Get started','AgentKit 生态':'AgentKit ecosystem','从本地开发，到云上运行与真实业务':'From local development to production',
'让智能体':'Build agents','从开发走向生产':'Bring them to life',
'以 AgentKit 云上基础设施为底座，连接开发工具、一站式平台与浏览器应用，让构建、部署和使用 Agent 成为连贯的体验':'An ecosystem built on AgentKit cloud infrastructure, connecting developer tools, an integrated platform, and browser apps to build, deploy, and use agents.',
'开始构建 Agent':'Start building','阅读文档':'Read the docs','云上 Agent Infra':'Cloud agent infrastructure','承载智能体全生命周期':'Support the entire agent lifecycle','开箱即用的开发框架':'A ready-to-use framework','快速构建你的 Agent':'Build your agents faster','AI-friendly 命令行':'An AI-friendly CLI','让 AI 调用与管理云上能力':'Let AI manage cloud capabilities','开发、运维、评测与观测优化':'Develop, operate, evaluate and observe','到上线服务的一站式平台':'One platform through production','浏览器上下文增强':'Browser context for agents','零成本无改造接入存量数据系统':'Connect existing data systems at zero cost, with no changes required','一站式智能体平台':'An integrated agent platform','浏览器上下文与企业数据':'Browser context and enterprise data',
'开始使用 AgentKit':'Get started with AgentKit','选择你的云环境':'Choose your cloud environment','火山引擎':'Volcengine','先阅读开发文档':'Read the developer docs first','以浏览器上下文增强 Agent，零成本无改造接入存量数据系统，让智能体理解你正在进行的工作':'Enrich agents with browser context and enterprise data so they understand the work you are doing.','访问入口待确认':'Access link to be confirmed'
};
const localizedNodes=[];
const textWalker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
while(textWalker.nextNode()){const node=textWalker.currentNode;const key=node.textContent.trim();if(translations[key])localizedNodes.push({node,original:node.textContent,key});}
const localizedLabels=[...document.querySelectorAll('[aria-label]')].map(node=>({node,label:node.getAttribute('aria-label')}));
const labelTranslations={'AgentKit 首页':'AgentKit home','主导航':'Main navigation','AgentKit 产品生态':'AgentKit ecosystem','关闭':'Close','切换语言':'Change language'};
function setLanguage(language){
 const english=language==='en'; document.documentElement.lang=english?'en':'zh-CN';
 localizedNodes.forEach(({node,original,key})=>{node.textContent=english?original.replace(key,translations[key]):original;});
 localizedLabels.forEach(({node,label})=>node.setAttribute('aria-label',english?(labelTranslations[label]||label):label));
 document.title=english?'AgentKit | From development to production':'AgentKit | 从开发走向生产';
 languageToggle.title=english?'Change language':'切换语言';
 document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
 try{localStorage.setItem('agentkit-language',language);}catch{}
 closeLanguages();
}
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{setLanguage(button.dataset.language);languageToggle.focus();}));
try{if(localStorage.getItem('agentkit-language')==='en')setLanguage('en');}catch{}
