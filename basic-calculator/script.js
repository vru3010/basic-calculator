// Basic Calculator logic
// Features: BODMAS via Shunting-yard (operator precedence), keyboard input,
// error handling, percentage, square root, memory functions (M+, M-, MR, MC),
// clear, backspace, decimals.

// Elements
const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const buttons = document.querySelectorAll('.btn');

// State
let expr = ''; // user-visible expression string using JS operators (*,/,+,-)
let lastResult = null; // numeric last result
let memory = 0; // memory storage

// Utilities: tokenization, shunting-yard to RPN, evaluate RPN
// Tokenize supports numbers (with decimal), operators + - * / and parentheses
function tokenize(s){
  const tokens = [];
  let i = 0;
  while(i < s.length){
    const c = s[i];
    if(c === ' ') { i++; continue }
    if(/\d|\./.test(c)){
      let num = c; i++;
      while(i < s.length && /[0-9\.]/.test(s[i])){ num += s[i++]; }
      tokens.push(num);
      continue;
    }
    if(/[+\-*/()%]/.test(c)){
      // treat percent sign as operator token '%'
      tokens.push(c);
      i++; continue;
    }
    // unknown char -> throw
    throw new Error('Invalid character: ' + c);
  }
  return tokens;
}

function toRPN(tokens){
  const out = [];
  const ops = [];
  const prec = { '+':1, '-':1, '*':2, '/':2 };
  const isOp = t => ['+','-','*','/'].includes(t);

  for(let i=0;i<tokens.length;i++){
    const t = tokens[i];
    if(!isNaN(t)) { out.push(t); continue }
    if(t === '%'){
      // percent applies to previous number: convert n -> n/100 in place by pushing operator marker
      // We'll convert by applying as unary during evaluation: push '%'
      out.push('%');
      continue;
    }
    if(isOp(t)){
      while(ops.length && isOp(ops[ops.length-1]) && prec[ops[ops.length-1]] >= prec[t]){
        out.push(ops.pop());
      }
      ops.push(t);
      continue;
    }
    if(t === '('){ ops.push(t); continue }
    if(t === ')'){
      while(ops.length && ops[ops.length-1] !== '(') out.push(ops.pop());
      if(!ops.length) throw new Error('Mismatched parentheses');
      ops.pop();
      continue;
    }
  }
  while(ops.length){
    const op = ops.pop();
    if(op === '(' || op === ')') throw new Error('Mismatched parentheses');
    out.push(op);
  }
  return out;
}

function evalRPN(rpn){
  const st = [];
  for(let t of rpn){
    if(!isNaN(t)) { st.push(parseFloat(t)); continue }
    if(t === '%'){
      if(!st.length) throw new Error('Invalid expression');
      const n = st.pop(); st.push(n / 100); continue;
    }
    // binary ops
    const b = st.pop(); const a = st.pop();
    if(a === undefined || b === undefined) throw new Error('Invalid expression');
    let res;
    if(t === '+') res = a + b;
    else if(t === '-') res = a - b;
    else if(t === '*') res = a * b;
    else if(t === '/'){
      if(b === 0) throw new Error('Division by zero');
      res = a / b;
    } else throw new Error('Unknown operator ' + t);
    st.push(res);
  }
  if(st.length !== 1) throw new Error('Invalid expression');
  return st[0];
}

function evaluateExpression(s){
  if(!s || s.trim() === '') return 0;
  // wrap unary minus support: transform leading -number or ( -number ) cases by inserting 0- ...
  // Simple approach: replace leading '-' with '0-' and '(-' with '(0-'
  let expr = s.replace(/\(\-/g, '(0-');
  expr = expr.replace(/^\-/, '0-');

  const tokens = tokenize(expr);
  const rpn = toRPN(tokens);
  const value = evalRPN(rpn);
  if(!isFinite(value)) throw new Error('Invalid result');
  return value;
}

// Display helpers
function refreshDisplay(){
  expressionEl.textContent = expr || '0';
  if(lastResult !== null){
    resultEl.textContent = String(lastResult);
  } else {
    resultEl.textContent = '';
  }
}

function appendToExpr(text){
  // prevent multiple operators in a row (except '-' as unary handled by parser)
  if(text === '.' ){
    // avoid multiple decimals in current number
    const m = expr.match(/(\d*\.?\d*)$/);
    if(m && m[0].includes('.')) return;
  }
  if(/[+\-*/]/.test(text)){
    if(expr === ''){
      // if starting with +*/ ignore, but allow leading - (handled earlier)
      if(text !== '-') return;
    }
    // replace trailing operator with new one
    if(/[+\-*/]$/.test(expr)){
      expr = expr.slice(0, -1) + text; refreshDisplay(); return;
    }
  }
  expr += text; refreshDisplay();
}

function doClear(){ expr = ''; lastResult = null; refreshDisplay(); }
function doBackspace(){ expr = expr.slice(0, -1); refreshDisplay(); }

function doEquals(){
  try{
    const val = evaluateExpression(expr);
    lastResult = val;
    expr = String(val); // allow chaining further operations
    refreshDisplay();
  } catch(e){
    lastResult = 'Error';
    resultEl.textContent = 'Error';
  }
}

function doPercent(){
  // convert last number to percentage (n -> n/100)
  // find last number in expr and replace
  const m = expr.match(/(\d*\.?\d+)$/);
  if(m){
    const n = parseFloat(m[1]);
    const rep = (n / 100).toString();
    expr = expr.slice(0, -m[1].length) + rep;
    refreshDisplay();
  }
}

function doSqrt(){
  // apply sqrt to current expression: evaluate and then sqrt
  try{
    const val = evaluateExpression(expr || '0');
    if(val < 0) throw new Error('Invalid');
    const r = Math.sqrt(val);
    lastResult = r;
    expr = String(r);
    refreshDisplay();
  } catch(e){ resultEl.textContent = 'Error'; lastResult = 'Error'; }
}

// Memory functions
function memoryClear(){ memory = 0; flashMessage('MC'); }
function memoryRecall(){ expr = String(memory); lastResult = memory; refreshDisplay(); }
function memoryAdd(){
  try{ const v = evaluateExpression(expr || '0'); memory += v; flashMessage('M+'); } catch(e){ flashMessage('Error'); }
}
function memorySubtract(){
  try{ const v = evaluateExpression(expr || '0'); memory -= v; flashMessage('M-'); } catch(e){ flashMessage('Error'); }
}

// small transient UI feedback
function flashMessage(msg){ const prev = resultEl.textContent; resultEl.textContent = msg; setTimeout(()=>{ resultEl.textContent = prev; }, 800); }

// Button wiring
buttons.forEach(b=>{
  b.addEventListener('click', ()=>{
    const action = b.dataset.action;
    const value = b.dataset.value;
    if(action){
      switch(action){
        case 'clear': doClear(); break;
        case 'back': doBackspace(); break;
        case 'equals': doEquals(); break;
        case 'percent': doPercent(); break;
        case 'sqrt': doSqrt(); break;
        case 'mc': memoryClear(); break;
        case 'mr': memoryRecall(); break;
        case 'mplus': memoryAdd(); break;
        case 'mminus': memorySubtract(); break;
        default: break;
      }
    } else if(value){
      appendToExpr(value);
    }
  });
});

// Keyboard support
document.addEventListener('keydown', (ev)=>{
  const k = ev.key;
  if(/^[0-9]$/.test(k)){ appendToExpr(k); ev.preventDefault(); return }
  if(k === '.') { appendToExpr('.'); ev.preventDefault(); return }
  if(k === '+' || k === '-' || k === '*' || k === '/'){ appendToExpr(k); ev.preventDefault(); return }
  if(k === 'Enter') { doEquals(); ev.preventDefault(); return }
  if(k === 'Backspace') { doBackspace(); ev.preventDefault(); return }
  if(k === 'Escape') { doClear(); ev.preventDefault(); return }
  if(k === '%') { doPercent(); ev.preventDefault(); return }
  if(k.toLowerCase() === 's'){ doSqrt(); ev.preventDefault(); return }
  if(k.toLowerCase() === 'm'){
    // quick keyboard memory recall using 'm' (toggle MR), ctrl+shift+M etc. Not overloading many combos
    memoryRecall(); ev.preventDefault(); return
  }
});

// initial display
doClear();

// Expose for developer console (optional)
window._calc = { evaluateExpression, memory: () => memory };
