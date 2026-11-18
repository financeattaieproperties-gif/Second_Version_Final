#!/usr/bin/env node
// Read actual Codex CLI JSONL events; never invent agent percentages.
import { spawn } from 'node:child_process';
import readline from 'node:readline';

const argv = process.argv.slice(2);
if (argv.includes('--help') || (!argv.length)) {
  console.log('Usage: node roheen-monitor.mjs [--demo] "prompt"\nRuns codex exec --json and displays observed progress. Use interactive codex for approval-gated work.');
  process.exit(0);
}
const demo = argv.includes('--demo');
const prompt = argv.filter(x => x !== '--demo').join(' ');
if (!demo && !prompt.trim()) { console.error('Missing prompt'); process.exit(2); }
const ansi = process.stdout.isTTY;
const c = (code,s) => ansi ? `\x1b[${code}m${s}\x1b[0m` : s;
const state = { events:0, agents:new Map(), tools:new Map(), messages:[], phase:'Starting', errors:0, start:Date.now() };
const trim = (s,n=100) => String(s ?? '').replace(/\s+/g,' ').slice(0,n);
function add(msg) { state.messages.push(msg); if(state.messages.length>7) state.messages.shift(); }
function render() {
  if (ansi) process.stdout.write('\x1b[2J\x1b[H');
  console.log(c('1;36','◆ ROHEEN DEVELOPMENT') + '  ' + c('2', 'Codex CLI event monitor'));
  console.log('Phase: ' + state.phase + '  |  Events: ' + state.events + '  |  Errors: ' + state.errors + '  |  Elapsed: ' + Math.floor((Date.now()-state.start)/1000)+'s');
  console.log('─'.repeat(62));
  if (state.agents.size) {
    console.log('Agents / threads (observed):');
    for(const [id,info] of state.agents) console.log('  '+(info.done?'✓':'◉')+' '+trim(id,24)+'  '+trim(info.status,65));
  } else console.log('Agents: no separate agent/thread events observed');
  if (state.tools.size) {
    console.log('Tools / commands:');
    for(const [id,info] of [...state.tools].slice(-5)) console.log('  '+(info.done?'✓':'◉')+' '+trim(info.title||id,88));
  }
  console.log('Recent activity:');
  for(const m of state.messages) console.log('  '+trim(m,112));
  console.log('─'.repeat(62));
  console.log(c('2','Statuses reflect observed Codex JSON events; no estimated % values.'));
}
function onEvent(e) {
  state.events++;
  const type=String(e.type||'event');
  const item=e.item||{};
  const id=String(item.id||e.id||e.thread_id||'');
  const lower=type.toLowerCase();
  if(lower.includes('error')||lower.includes('failed')) state.errors++;
  if(type==='thread.started') state.phase='Thread started';
  if(type==='turn.started') state.phase='Working';
  if(type==='turn.completed') state.phase='Completed';
  if(type==='turn.failed') state.phase='Failed';
  if(type==='item.started' || type==='item.updated' || type==='item.completed') {
    const kind=String(item.type||'item');
    const done=type==='item.completed';
    const title=trim(item.command||item.title||item.text||kind,90);
    if(kind.includes('agent') || kind.includes('collab') || kind.includes('thread')) {
      state.agents.set(id||kind,{status:title,done});
    } else if(kind.includes('command') || kind.includes('tool')) {
      state.tools.set(id||kind,{title,done});
    }
    if(done && (kind==='agent_message' || kind==='reasoning')) add(`${kind}: ${title}`);
    else if(kind==='agent_message' && type==='item.completed') add(title);
    else if(type==='item.started') add(`${kind}: ${title}`);
  } else if(type==='error') add('ERROR: '+trim(e.message||e.error||'unknown'));
  else if(!['thread.started','turn.started','turn.completed'].includes(type)) add(type);
  if(!ansi || state.events%2===0 || lower.includes('failed')) render();
}
if(demo) {
  console.log('SIMULATED DEMO — no Codex process launched');
  for(const e of [{type:'thread.started'},{type:'turn.started'},{type:'item.started',item:{id:'cmd1',type:'command_execution',command:'npm run build'}},{type:'item.completed',item:{id:'cmd1',type:'command_execution',command:'npm run build'}},{type:'turn.completed'}]) onEvent(e);
  process.exit(0);
}
const child=spawn('codex',['exec','--json',prompt],{stdio:['inherit','pipe','pipe'],shell:process.platform==='win32'});
const rl=readline.createInterface({input:child.stdout});
rl.on('line',line=>{try{onEvent(JSON.parse(line));}catch{add('Non-JSON stdout: '+trim(line));render();}});
const err=readline.createInterface({input:child.stderr});
err.on('line',line=>{add('stderr: '+trim(line));render();});
child.on('error',e=>{console.error('Unable to launch Codex:',e.message);process.exitCode=1;});
child.on('close',code=>{state.phase=code===0?'Finished':'Exited with error';render();console.log('Codex exit code:',code);process.exitCode=code||0;});
process.on('SIGINT',()=>{child.kill('SIGINT');});
