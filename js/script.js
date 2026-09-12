const levels = {
  iniciante: { number: '01', label: 'TECLAS-GUIA', title: 'Posicione os dedos e comece', summary: '8 teclas · Linha de apoio', chars: 'asdfjklç', groups: ['asdf jklç', 'fdsa çlkj', 'asdf çlkj', 'fada sala', 'jafa lasca'] },
  basico: { number: '02', label: 'TODAS AS LETRAS', title: 'Explore as três fileiras', summary: '27 teclas · Alfabeto completo', chars: 'abcdefghijklmnopqrstuvwxyzç', groups: ['rato azul corre feliz', 'quero digitar melhor', 'pratica leva ao progresso', 'cada tecla no seu lugar'] },
  intermediario: { number: '03', label: 'LETRAS E NÚMEROS', title: 'Ganhe ritmo e precisão', summary: '37 teclas · Letras e números', chars: 'abcdefghijklmnopqrstuvwxyzç0123456789', groups: ['turma 01 pratica 10 minutos', 'digitar 2 vezes por dia', '3 passos para 100 por cento', 'teclado rapido nivel 2026'] },
  avancado: { number: '04', label: 'TECLADO COMPLETO', title: 'Símbolos, acentos e maiúsculas', summary: '60+ teclas · Teclado completo', chars: 'abcdefghijklmnopqrstuvwxyzç0123456789áéíóúâêôãõàüABCDEFGHIJKLMNOPQRSTUVWXYZ.,;:!?@#$%&*()-_=+/\\[]{}<>\'"', groups: ['Olá, Mundo! #TeclaLab_2026', 'E-mail: aluno@exemplo.com', 'Atenção: precisão > velocidade.', 'Senha forte? Use A-z, 0-9 & símbolos!', '[Treino] {completo} = 100%;'] }
};

const keyboardRows = [
  [['`','`'],['1','1'],['2','2'],['3','3'],['4','4'],['5','5'],['6','6'],['7','7'],['8','8'],['9','9'],['0','0'],['-','-'],['=','='],['Backspace','⌫','wide']],
  [['Tab','Tab','wide'],['q','Q'],['w','W'],['e','E'],['r','R'],['t','T'],['y','Y'],['u','U'],['i','I'],['o','O'],['p','P'],['[','['],[']',']'],['\\','\\']],
  [['CapsLock','Caps','wide'],['a','A'],['s','S'],['d','D'],['f','F'],['g','G'],['h','H'],['j','J'],['k','K'],['l','L'],['ç','Ç'],[';', ';'],["'","'"],['Enter','Enter','wide']],
  [['Shift','Shift','wide'],['z','Z'],['x','X'],['c','C'],['v','V'],['b','B'],['n','N'],['m','M'],[',',','],['.','.'],['/','/'],['Shift','Shift','wide']],
  [['Control','Ctrl','wide'],['Alt','Alt','wide'],[' ','Espaço','spacebar'],['AltGraph','Alt Gr','wide'],['ArrowLeft','←'],['ArrowDown','↓'],['ArrowUp','↑'],['ArrowRight','→']]
];

const els = Object.fromEntries(['exercise','progress','feedback','speed','accuracy','errors','time','keyboard','completion','streak','level-summary','lesson-label','training-title','final-speed','final-accuracy','completion-message'].map(id => [id.replace(/-([a-z])/g,(_,c)=>c.toUpperCase()), document.getElementById(id)]));
let currentLevel = 'iniciante', sequence = '', position = 0, attempts = 0, mistakes = 0, startedAt = null, timer = null, lessonIndex = 0;

function buildKeyboard() {
  els.keyboard.innerHTML = '';
  keyboardRows.forEach(row => {
    const rowEl = document.createElement('div'); rowEl.className = 'key-row';
    row.forEach(([value,label,size]) => { const key = document.createElement('span'); key.className = `key ${size || ''}`; key.dataset.key = value; key.textContent = label; rowEl.append(key); });
    els.keyboard.append(rowEl);
  });
}

function renderExercise() {
  els.exercise.innerHTML = '';
  [...sequence].forEach((char, index) => { const span = document.createElement('span'); span.className = `char${char === ' ' ? ' space' : ''}${index === position ? ' current' : ''}`; span.textContent = char === ' ' ? '' : char; els.exercise.append(span); });
  els.progress.style.width = `${(position / sequence.length) * 100}%`;
  highlightKey();
}

function highlightKey() {
  document.querySelectorAll('.key').forEach(key => {
    const available = levels[currentLevel].chars.toLowerCase().includes(key.dataset.key.toLowerCase()) || (key.dataset.key === ' ' && currentLevel !== 'iniciante');
    key.classList.toggle('available', available); key.classList.toggle('inactive', !available);
    key.classList.remove('target');
  });
  const expected = sequence[position];
  const match = [...document.querySelectorAll('.key')].find(key => key.dataset.key.toLowerCase() === (expected || '').toLowerCase());
  if (match) match.classList.add('target');
}

function resetExercise(next = false) {
  if (next) lessonIndex = (lessonIndex + 1) % levels[currentLevel].groups.length;
  sequence = levels[currentLevel].groups[lessonIndex]; position = attempts = mistakes = 0; startedAt = null;
  clearInterval(timer); timer = null; els.time.textContent = '00:00'; els.speed.textContent = '0'; els.accuracy.textContent = '100'; els.errors.textContent = '0';
  els.feedback.textContent = 'Pressione qualquer tecla da sequência para iniciar'; els.feedback.className = 'feedback';
  els.completion.hidden = true; renderExercise(); document.getElementById('exercise-wrap').focus();
}

function chooseLevel(name) {
  currentLevel = name; lessonIndex = 0; const level = levels[name];
  document.querySelectorAll('.level').forEach(button => { const active = button.dataset.level === name; button.classList.toggle('active', active); button.setAttribute('aria-selected', active); });
  els.levelSummary.textContent = level.summary; els.lessonLabel.textContent = `NÍVEL ${level.number} · ${level.label}`; els.trainingTitle.textContent = level.title; resetExercise();
}

function updateStats() {
  if (!startedAt) return;
  const elapsed = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
  const minutes = elapsed / 60; els.speed.textContent = Math.round((position / 5) / minutes);
  els.accuracy.textContent = attempts ? Math.round(((attempts - mistakes) / attempts) * 100) : 100;
  els.time.textContent = `${String(Math.floor(elapsed / 60)).padStart(2,'0')}:${String(elapsed % 60).padStart(2,'0')}`;
}

function complete() {
  clearInterval(timer); updateStats(); const accuracy = els.accuracy.textContent;
  els.finalSpeed.textContent = els.speed.textContent; els.finalAccuracy.textContent = `${accuracy}%`;
  els.completionMessage.textContent = accuracy >= 95 ? 'Excelente precisão! Seus dedos estão encontrando o caminho.' : 'Bom avanço! Repita o exercício para aumentar sua precisão.';
  const streak = Number(localStorage.getItem('typingStreak') || 0) + 1; localStorage.setItem('typingStreak', streak); els.streak.textContent = streak;
  els.completion.hidden = false; document.getElementById('next-lesson').focus();
}

function type(event) {
  if (!els.completion.hidden || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key.length !== 1) return;
  event.preventDefault(); if (!startedAt) { startedAt = Date.now(); timer = setInterval(updateStats, 1000); }
  attempts++; const chars = els.exercise.children;
  if (event.key === sequence[position]) {
    chars[position].classList.remove('current','wrong'); chars[position].classList.add('correct'); position++;
    els.feedback.textContent = 'Muito bem! Continue assim.'; els.feedback.className = 'feedback';
    if (position === sequence.length) { els.progress.style.width = '100%'; updateStats(); setTimeout(complete, 250); return; }
    chars[position].classList.add('current'); els.progress.style.width = `${(position / sequence.length) * 100}%`; highlightKey();
  } else {
    mistakes++; els.errors.textContent = mistakes; chars[position].classList.add('wrong'); setTimeout(() => chars[position]?.classList.remove('wrong'), 220);
    els.feedback.textContent = `Tente novamente: pressione ${sequence[position] === ' ' ? 'Espaço' : sequence[position]}`; els.feedback.className = 'feedback error';
  }
  updateStats();
}

buildKeyboard();
document.querySelectorAll('.level').forEach(button => button.addEventListener('click', () => chooseLevel(button.dataset.level)));
document.getElementById('restart').addEventListener('click', () => resetExercise());
document.getElementById('repeat-lesson').addEventListener('click', () => resetExercise());
document.getElementById('next-lesson').addEventListener('click', () => resetExercise(true));
document.addEventListener('keydown', type);
els.streak.textContent = localStorage.getItem('typingStreak') || '0';
chooseLevel('iniciante');
