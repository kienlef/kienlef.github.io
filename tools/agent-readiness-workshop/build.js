import pptxgen from 'pptxgenjs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import sharp from 'sharp';
import * as Phosphor from '@phosphor-icons/react';
import { copyFile, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const OUT = resolve(ROOT, 'assets/downloads');
const QA = resolve(HERE, 'qa');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SOFFICE = '/opt/homebrew/bin/soffice';
const deckPptx = resolve(OUT, 'agent-readiness-workshop-v0.2-2026-09-06.pptx');
const deckPdf = resolve(OUT, 'agent-readiness-workshop-v0.2-2026-09-06.pdf');
const kitPdf = resolve(OUT, 'agent-readiness-workshop-print-kit-v0.2-2026-09-06.pdf');

const C = {
  primary: '2F2FE4', primaryActive: '162E93', primarySoft: 'E8EAFF', primaryMuted: '6F76F4',
  indigo: '1A1953', ink: '080616', body: '4B5068', muted: '74798F', hairline: 'DDE2F0',
  soft: 'F6F7FB', blueSoft: 'F1F4FF', white: 'FFFFFF', darkElevated: '12102B', darkSoft: 'B7BCD1',
  cyan: '1F8BFF', violet: '7A6FF0', warm: 'D89A2B', plum: 'A64A6A', warning: 'B87512'
};
const FONT = 'Arial';
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Frank Kienle';
pptx.company = 'Frank Kienle';
pptx.subject = 'A tactile workshop for assessing whether an operational workflow is ready for bounded AI-agent support.';
pptx.title = 'Agent Readiness Workshop for Operations Professionals';
pptx.lang = 'en-US';
pptx.theme = { headFontFace: FONT, bodyFontFace: FONT, lang: 'en-US' };
pptx.defineSlideMaster({
  title: 'LIGHT', background: { color: C.white }, objects: [
    { text: { text: 'FRANK KIENLE  |  AGENT READINESS WORKSHOP  v0.2', options: { x: 0.58, y: 6.80, w: 5.8, h: 0.18, fontFace: FONT, fontSize: 10, color: C.muted, margin: 0, charSpacing: 1.0 } } },
    { text: { text: 'PERSONAL EDUCATIONAL MATERIAL  ·  SYNTHETIC EXAMPLES', options: { x: 6.95, y: 6.80, w: 5.72, h: 0.18, fontFace: FONT, fontSize: 10, color: C.muted, margin: 0, align: 'right', charSpacing: 0.6 } } }
  ], slideNumber: { x: 12.38, y: 0.52, color: C.body, fontFace: FONT, fontSize: 10 }
});
pptx.defineSlideMaster({
  title: 'DARK', background: { color: C.ink }, objects: [
    { text: { text: 'FRANK KIENLE  |  AGENT READINESS WORKSHOP  v0.2', options: { x: 0.58, y: 6.80, w: 6.1, h: 0.18, fontFace: FONT, fontSize: 10, color: C.darkSoft, margin: 0, charSpacing: 1.0 } } },
    { text: { text: 'DECISION OWNERSHIP BEFORE AUTOMATION', options: { x: 7.0, y: 6.80, w: 5.67, h: 0.18, fontFace: FONT, fontSize: 10, color: C.darkSoft, margin: 0, align: 'right', charSpacing: 0.6 } } }
  ], slideNumber: { x: 12.38, y: 0.52, color: C.darkSoft, fontFace: FONT, fontSize: 10 }
});

const iconCache = new Map();
async function iconPng(name, color = `#${C.primary}`, weight = 'duotone') {
  const key = `${name}-${color}-${weight}`;
  if (iconCache.has(key)) return iconCache.get(key);
  const Component = Phosphor[name] || Phosphor[`${name}Icon`];
  if (!Component) throw new Error(`Missing Phosphor icon: ${name}`);
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Component, { color, size: 256, weight }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const data = `data:image/png;base64,${png.toString('base64')}`;
  iconCache.set(key, data);
  return data;
}
function shadow() { return { type: 'outer', color: '000000', blur: 2, angle: 45, distance: 1, opacity: 0.08 }; }
function addText(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, { x, y, w, h, fontFace: FONT, margin: 0, color: C.ink, fontSize: 16, breakLine: false, valign: 'mid', ...opts });
}
function rect(slide, x, y, w, h, fill, line = C.hairline, radius = true) {
  slide.addShape(radius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, { x, y, w, h, rectRadius: radius ? 0.08 : undefined, fill: { color: fill }, line: { color: line, width: 1 } });
}
async function iconTile(slide, name, x, y, color = C.primary, bg = C.primarySoft, size = 0.46) {
  slide.addShape(pptx.ShapeType.ellipse, { x, y, w: size, h: size, fill: { color: bg }, line: { color: bg } });
  slide.addImage({ data: await iconPng(name, `#${color}`), x: x + 0.095, y: y + 0.095, w: size - 0.19, h: size - 0.19, altText: `${name} icon` });
}
function header(slide, headline, action, dark = false) {
  addText(slide, action.toUpperCase(), 0.58, 0.50, 2.2, 0.22, { fontSize: 10, bold: true, color: dark ? C.primaryMuted : C.primaryActive, charSpacing: 1.4 });
  addText(slide, headline, 0.58, 0.82, 11.85, 0.62, { fontSize: 30, bold: true, color: dark ? C.white : C.indigo, valign: 'top', breakLine: false, fit: 'shrink' });
}
function actionBar(slide, verb, instruction, artifact, dark = false) {
  const y = 6.14;
  rect(slide, 0.58, y, 12.17, 0.48, dark ? C.darkElevated : C.blueSoft, dark ? C.primaryActive : C.hairline, true);
  addText(slide, verb.toUpperCase(), 0.78, y + 0.13, 1.0, 0.22, { fontSize: 11, bold: true, color: dark ? C.primaryMuted : C.primaryActive, charSpacing: 1 });
  addText(slide, instruction, 1.72, y + 0.09, 7.25, 0.30, { fontSize: 13, bold: true, color: dark ? C.white : C.indigo });
  addText(slide, `OUTPUT  ${artifact}`, 9.06, y + 0.09, 3.45, 0.30, { fontSize: 11.5, bold: true, color: dark ? C.darkSoft : C.body, align: 'right' });
}
function note(slide, text) { if (typeof slide.addNotes === 'function') slide.addNotes(text); }
function token(slide, label, x, y, fill, color = C.white, w = 0.72) {
  slide.addShape(pptx.ShapeType.ellipse, { x, y, w, h: w, fill: { color: fill }, line: { color: fill, width: 1.2 }, shadow: shadow() });
  addText(slide, label, x, y + 0.01, w, w - 0.02, { fontSize: label.length > 1 ? 15 : 25, bold: true, color, align: 'center' });
}
async function infoCard(slide, { x, y, w, h, icon, title, body, accent = C.primary, fill = C.white, number }) {
  rect(slide, x, y, w, h, fill, C.hairline, true);
  if (number) token(slide, number, x + 0.22, y + 0.21, accent, C.white, 0.48);
  else if (icon) await iconTile(slide, icon, x + 0.22, y + 0.2, accent, accent === C.warm ? 'FFF7E8' : C.primarySoft, 0.46);
  addText(slide, title, x + 0.22, y + 0.82, w - 0.44, 0.34, { fontSize: 16, bold: true, color: C.indigo, valign: 'top' });
  addText(slide, body, x + 0.22, y + 1.21, w - 0.44, h - 1.42, { fontSize: 12.5, color: C.body, valign: 'top', breakLine: false, fit: 'shrink' });
}

// 1
{
  const s = pptx.addSlide('DARK');
  addText(s, 'WORKSHOP DECK + PRINTABLE KIT', 0.72, 0.62, 4.4, 0.25, { fontSize: 11, bold: true, color: C.primaryMuted, charSpacing: 1.5 });
  addText(s, 'Agent readiness is a decision-system check, not an AI capability pitch.', 0.72, 1.18, 7.2, 2.0, { fontSize: 38, bold: true, color: C.white, valign: 'top', breakLine: false, fit: 'shrink' });
  addText(s, 'A 30-minute tabletop session for operations professionals. Make boundaries, evidence, ownership, failure paths, and permissions physically visible before anyone builds.', 0.72, 3.58, 6.7, 1.1, { fontSize: 17, color: C.darkSoft, valign: 'top', breakLine: false });
  rect(s, 8.25, 1.02, 4.18, 4.86, C.darkElevated, C.primaryActive, true);
  addText(s, 'THE TABLE', 8.62, 1.38, 2.2, 0.28, { fontSize: 11, bold: true, color: C.primaryMuted, charSpacing: 1.5 });
  const labels = [['WORKFLOW CARD', 8.62, 1.92, 2.62, 0.72, C.primary], ['BOUNDARY STRING', 9.18, 2.93, 2.65, 0.36, C.cyan], ['EVIDENCE CARDS', 8.62, 3.62, 2.62, 0.72, C.primaryActive], ['0  1  2 TOKENS', 9.78, 4.64, 2.10, 0.72, C.violet]];
  for (const [t,x,y,w,h,c] of labels) { rect(s,x,y,w,h,c,c,true); addText(s,t,x,y,w,h,{fontSize:11,bold:true,color:C.white,align:'center'}); }
  s.addShape(pptx.ShapeType.line,{x:8.9,y:3.12,w:2.45,h:0,line:{color:C.cyan,width:5,beginArrowType:'none',endArrowType:'triangle'}});
  addText(s, 'By Frank Kienle  ·  Version 0.2  ·  6 September 2026', 0.72, 5.55, 6.8, 0.32, { fontSize: 12, color: C.darkSoft });
  note(s, 'Open by asking participants to point at one workflow where decisions currently slow down, fragment, or disappear. Do not discuss models or tools yet.');
}
// 2
{
  const s = pptx.addSlide('LIGHT'); header(s, 'One workflow should leave the room with one defensible next decision.', 'Point');
  await infoCard(s,{x:0.7,y:1.68,w:3.75,h:3.95,icon:'Timer',title:'30 minutes',body:'Work quickly enough to expose disagreement. The goal is not perfect documentation.',accent:C.primary});
  await infoCard(s,{x:4.8,y:1.68,w:3.75,h:3.95,icon:'Cards',title:'One workflow',body:'Choose one repeated operational flow. Use generic, non-confidential wording.',accent:C.cyan,fill:C.blueSoft});
  await infoCard(s,{x:8.9,y:1.68,w:3.75,h:3.95,icon:'Signpost',title:'One decision',body:'Leave with one label, one next evidence action, and one named owner.',accent:C.violet});
  actionBar(s,'POINT','Show where the current decision slows down, fragments, or disappears.','decision-friction mark');
  note(s, 'Ask for a single finger-point to the decision friction. If the team starts ideating solutions, return to the current workflow.');
}
// 3
{
  const s = pptx.addSlide('LIGHT'); header(s, 'The safest starting point is one repeated workflow with a visible handoff.', 'Write');
  rect(s,0.82,1.72,7.55,3.74,C.primarySoft,C.primarySoft,true);
  addText(s,'WORKFLOW CARD',1.18,2.02,2.0,0.28,{fontSize:11,bold:true,color:C.primaryActive,charSpacing:1.3});
  addText(s,'When __________ happens,\nthe team must __________,\nso that __________ can decide or hand off.',1.18,2.46,6.7,1.55,{fontSize:23,bold:true,color:C.indigo,valign:'top',breakLine:true,fit:'shrink'});
  addText(s,'Write what happens today. Avoid “use AI for…” and avoid private names, system screenshots, or identifiable cases.',1.18,4.35,6.55,0.62,{fontSize:14,color:C.body,valign:'top'});
  await infoCard(s,{x:8.72,y:1.72,w:3.78,h:1.65,icon:'CheckSquareOffset',title:'Good',body:'Draft a weekly status summary for planner review.',accent:C.primary});
  await infoCard(s,{x:8.72,y:3.63,w:3.78,h:1.65,icon:'XCircle',title:'Too vague',body:'Improve operations with an AI agent.',accent:C.plum,fill:'FFF7FA'});
  actionBar(s,'WRITE','Complete the sentence on one blue workflow card.','candidate workflow card');
  note(s, 'Reject “automate reporting” and similar abstractions. Require a trigger, a repeated task, and a handoff or decision.');
}
// 4
{
  const s = pptx.addSlide('LIGHT'); header(s, 'A workflow is not ready until its start, stop, and exception path are explicit.', 'Place');
  const nodes=[['TRIGGER','Bell'],['INPUTS','Database'],['AGENT ROLE','Robot'],['HUMAN GATE','UserCircleCheck'],['OUTPUT','FileText'],['STOP','StopCircle']];
  const xs=[0.68,2.73,4.78,6.83,8.88,10.93];
  s.addShape(pptx.ShapeType.line,{x:1.05,y:3.42,w:10.35,h:0,line:{color:C.cyan,width:5,endArrowType:'triangle'}});
  for(let i=0;i<nodes.length;i++){
    const [lab,ic]=nodes[i]; rect(s,xs[i],2.35,1.72,2.05,i===3?C.primarySoft:C.white,i===3?C.primary:C.hairline,true); await iconTile(s,ic,xs[i]+0.61,2.68,i===5?C.plum:C.primary,i===5?'FFF7FA':C.primarySoft,0.5); addText(s,lab,xs[i]+0.13,3.45,1.46,0.45,{fontSize:12,bold:true,color:C.indigo,align:'center'});
  }
  addText(s,'EXCEPTION / ESCALATION',5.18,4.72,2.95,0.46,{fontSize:12,bold:true,color:C.white,align:'center',fill:{color:C.warning}});
  s.addShape(pptx.ShapeType.line,{x:6.60,y:4.86,w:1.06,h:-0.52,line:{color:C.warning,width:2.5,dash:'dash'}});
  actionBar(s,'PLACE','Lay string or arrows from trigger to stop; branch to the exception route.','workflow boundary map');
  note(s, 'If the team cannot place the path cleanly, Workflow Boundary scores 0. Ask what happens immediately before and after the agent.');
}
// 5
{
  const s = pptx.addSlide('LIGHT'); header(s, 'Every consequential agent action needs one accountable decision owner.', 'Pass');
  rect(s,0.72,1.7,4.1,4.3,C.ink,C.ink,true); await iconTile(s,'Gavel',2.35,2.12,C.white,C.primary,0.82); addText(s,'DECISION OWNER',1.16,3.22,3.25,0.48,{fontSize:22,bold:true,color:C.white,align:'center'}); addText(s,'Only the baton holder may confirm who owns, approves, or stops the decision.',1.18,4.05,3.2,0.92,{fontSize:15,color:C.darkSoft,align:'center',valign:'top'});
  const roles=[['OWNS','Who carries the outcome?'],['APPROVES','Who authorizes the action?'],['REVIEWS','Who checks evidence in time?'],['STOPS','Who can halt or override?']];
  for(let i=0;i<4;i++){const y=1.72+i*1.03;rect(s,5.28,y,7.25,0.82,i===0?C.primarySoft:C.soft,i===0?C.primary:C.hairline,true);token(s,String(i+1),5.55,y+0.16,i===0?C.primary:C.primaryActive,C.white,0.48);addText(s,roles[i][0],6.23,y+0.13,1.14,0.28,{fontSize:12,bold:true,color:C.primaryActive,charSpacing:0.7});addText(s,roles[i][1],7.62,y+0.10,4.48,0.34,{fontSize:15,bold:true,color:C.indigo});}
  actionBar(s,'PASS','Name the current owner, approver, reviewer, and stop authority.','decision ownership map');
  note(s, 'Do not accept “the business” or “the user.” If ownership is collective or split, place an ownership blocker.');
}
// 6
{
  const s = pptx.addSlide('LIGHT'); header(s, 'The agent can operate only inside a declared permission envelope.', 'Sort');
  const lanes=[['OBSERVE','Read approved inputs',C.primarySoft,C.primaryActive],['DRAFT','Prepare for review',C.blueSoft,C.primary],['RECOMMEND','Suggest a priority',C.white,C.cyan],['EXECUTE','Change a record', 'FFF7E8',C.warning],['ESCALATE','Route an exception',C.white,C.violet],['NEVER','Commit or approve', 'FFF7FA',C.plum]];
  for(let i=0;i<6;i++){const x=0.72+(i%3)*4.08;const y=1.58+Math.floor(i/3)*2.03;rect(s,x,y,3.72,1.72,lanes[i][2],lanes[i][3],true);addText(s,lanes[i][0],x+0.2,y+0.23,1.32,0.32,{fontSize:13,bold:true,color:lanes[i][3],charSpacing:0.5});addText(s,lanes[i][1],x+1.48,y+0.19,2.0,0.42,{fontSize:15,bold:true,color:C.indigo,align:'right'});addText(s,i<3?'LOWER AUTHORITY':i===3?'HIGHER CONTROL':'BOUNDARY',x+0.2,y+1.16,3.26,0.28,{fontSize:10,bold:true,color:C.muted,align:'center',charSpacing:0.6});}
  actionBar(s,'SORT','Place each workflow step in exactly one authority lane.','allowed and forbidden actions');
  note(s, 'Prefer the smallest safe authority. “Support” is not a permission level. Force each step into one lane.');
}
// 7
{
  const s = pptx.addSlide('LIGHT'); header(s, 'Readiness is visible only when all seven dimensions have evidence and an owner.', 'Place');
  const cards=[['Problem','Target','Pain + baseline'],['Boundary','Path','Start + stop'],['Data','Database','Source + permission'],['Scope','SlidersHorizontal','Allowed + forbidden'],['Review','UserCircleCheck','Role + timing'],['Failure','WarningOctagon','Detection + fallback'],['Governance','ShieldCheck','Controls + change owner']];
  for(let i=0;i<cards.length;i++){
    const top=i<4; const x=0.65+(top?i:(i-4)+0.5)*3.03; const y=top?1.62:3.78; const w=2.78; const h=1.74;
    rect(s,x,y,w,h,i===6?'FFF7E8':C.white,i===6?C.warning:C.hairline,true);await iconTile(s,cards[i][1],x+0.2,y+0.22,i===6?C.warning:C.primary,i===6?'FFF7E8':C.primarySoft,0.42);addText(s,cards[i][0],x+0.78,y+0.2,w-0.98,0.3,{fontSize:15,bold:true,color:C.indigo});addText(s,cards[i][2],x+0.2,y+0.92,w-0.4,0.34,{fontSize:12.5,bold:true,color:C.body,align:'center'});
  }
  actionBar(s,'PLACE','Put a named evidence card and owner beside each dimension.','seven-dimension canvas');
  note(s, 'Evidence can be an artifact, system, policy, metric, or named owner. Opinions do not count as evidence.');
}
// 8
{
  const s = pptx.addSlide('LIGHT'); header(s, 'Score what is on the table: no evidence means zero.', 'Score');
  const scores=[['0','NO EVIDENCE','Not safe to proceed',C.ink],['1','PARTIAL EVIDENCE','Assumptions exposed',C.warning],['2','CONCRETE EVIDENCE','Owner accepts it',C.primary]];
  for(let i=0;i<3;i++){const x=0.9+i*4.17;rect(s,x,1.78,3.72,3.72,i===2?C.primarySoft:C.soft,i===2?C.primary:C.hairline,true);token(s,scores[i][0],x+1.31,2.1,scores[i][3],C.white,1.10);addText(s,scores[i][1],x+0.3,3.56,3.12,0.33,{fontSize:13,bold:true,color:scores[i][3],align:'center',charSpacing:0.6});addText(s,scores[i][2],x+0.45,4.23,2.82,0.54,{fontSize:15,bold:true,color:C.indigo,align:'center'});}
  addText(s,'A blocker caps the dimension at 1. “No owner” or “no evidence” means ZERO.',2.15,5.72,9.0,0.38,{fontSize:14,bold:true,color:C.plum,align:'center'});
  actionBar(s,'SCORE','Place one 0 / 1 / 2 token on every dimension.','evidence-backed score');
  note(s, 'Do not average optimism. Ask “show me the evidence” before allowing a score of 2.');
}
// 9
{
  const s = pptx.addSlide('DARK'); header(s, 'A single hard blocker can stop the pilot, even when the total looks attractive.', 'Stop', true);
  const flags=[['NO OWNER','UserMinus'],['NO HUMAN GATE','UserCircleMinus'],['UNCLEAR DATA USE','LockKey'],['SILENT FAILURE','EyeSlash'],['HIDDEN AUTHORITY','WarningOctagon'],['IRREVERSIBLE HARM','ShieldWarning']];
  for(let i=0;i<6;i++){const x=0.72+(i%3)*4.13,y=1.68+Math.floor(i/3)*1.58;rect(s,x,y,3.72,1.24,C.darkElevated,i<2?C.plum:C.primaryActive,true);await iconTile(s,flags[i][1],x+0.24,y+0.33,i<2?C.plum:C.primaryMuted,i<2?'2B1321':C.indigo,0.52);addText(s,flags[i][0],x+0.94,y+0.31,2.52,0.5,{fontSize:14,bold:true,color:C.white});}
  rect(s,3.95,5.08,5.45,0.7,C.plum,C.plum,true);addText(s,'STOP  ·  RESOLVE THE MISSING CONTROL FIRST',4.15,5.26,5.05,0.28,{fontSize:14,bold:true,color:C.white,align:'center',charSpacing:0.7});
  actionBar(s,'STOP','Any participant may place the Stop Card on a critical blocker.','hard-blocker record',true);
  note(s, 'Hard blockers: no accountable owner, no review gate, unclear permission, unreviewed sensitive data, direct consequential action without approval, or failure that harms before detection.');
}
// 10
{
  const s = pptx.addSlide('LIGHT'); header(s, 'If the agent is confidently wrong, the design must still make the failure visible.', 'Drill');
  const steps=[['1','BREAK IT','Choose one plausible wrong, stale, missing, or late output.'],['2','NOTICE IT','Name who sees the problem first and what signal they receive.'],['3','CONTAIN IT','Mark the exact point where the workflow pauses or escalates.'],['4','RECOVER','Write the manual fallback and the evidence retained.']];
  for(let i=0;i<4;i++){const x=0.72+i*3.12;rect(s,x,1.78,2.82,3.95,i===0?'FFF7FA':i===2?'FFF7E8':C.white,i===0?C.plum:i===2?C.warning:C.hairline,true);token(s,steps[i][0],x+0.22,2.02,i===0?C.plum:i===2?C.warning:C.primary,C.white,0.55);addText(s,steps[i][1],x+0.94,2.08,1.55,0.28,{fontSize:13,bold:true,color:C.indigo,charSpacing:0.5});addText(s,steps[i][2],x+0.22,3.18,2.38,1.42,{fontSize:15,bold:true,color:C.body,valign:'top'});}
  actionBar(s,'DRILL','Run one failure from wrong output to visible recovery.','failure and fallback chain');
  note(s, 'Require at least two plausible failures before allowing Failure Visibility to score 2. “Users will notice” is not a control.');
}
// 11
{
  const s = pptx.addSlide('LIGHT'); header(s, 'Human review belongs where judgment changes the consequence, not everywhere.', 'Sort');
  const modes=[['NO REVIEW','Reversible, low-risk preparation','EyeClosed',C.muted],['SAMPLED','Quality trend and drift check','Eye',C.cyan],['PRE-ACTION','Approval before consequential action','UserCircleCheck',C.primary],['EXPERT','Regulated, safety, quality, legal','SealCheck',C.warning]];
  for(let i=0;i<4;i++){const x=0.72+i*3.12;rect(s,x,1.72,2.82,4.0,i===2?C.primarySoft:i===3?'FFF7E8':C.white,i===2?C.primary:i===3?C.warning:C.hairline,true);await iconTile(s,modes[i][2],x+1.14,2.09,modes[i][3],i===3?'FFF7E8':C.primarySoft,0.55);addText(s,modes[i][0],x+0.22,3.05,2.38,0.38,{fontSize:14,bold:true,color:modes[i][3],align:'center'});addText(s,modes[i][1],x+0.32,3.75,2.18,0.95,{fontSize:14,bold:true,color:C.indigo,align:'center',valign:'top'});}
  actionBar(s,'SORT','Place each decision into one review mode and name the reviewer role.','human review matrix');
  note(s, 'Ask what the reviewer sees, when they see it, whether they can override, and what happens when no reviewer is available.');
}
// 12
{
  const s = pptx.addSlide('LIGHT'); header(s, 'Governance must name who changes, monitors, audits, and retires the workflow.', 'Write');
  const life=[['CHANGE','PencilSimpleLine'],['VALIDATE','CheckCircle'],['MONITOR','Pulse'],['AUDIT','MagnifyingGlass'],['RETIRE','ArchiveBox']];
  s.addShape(pptx.ShapeType.line,{x:1.2,y:3.08,w:10.9,h:0,line:{color:C.primarySoft,width:10,endArrowType:'triangle'}});
  for(let i=0;i<5;i++){const x=0.78+i*2.45;token(s,String(i+1),x+0.72,2.58,i===4?C.violet:C.primary,C.white,0.72);addText(s,life[i][0],x+0.2,3.67,1.76,0.35,{fontSize:13,bold:true,color:C.indigo,align:'center'});rect(s,x+0.18,4.26,1.80,0.44,C.soft,C.hairline,true);addText(s,'OWNER',x+0.26,4.34,0.70,0.22,{fontSize:10,bold:true,color:C.muted});addText(s,'______',x+1.00,4.32,0.78,0.22,{fontSize:14,color:C.indigo});}
  rect(s,2.28,5.12,8.78,0.62,'FFF7E8',C.warning,true);addText(s,'Governance starts before the pilot and continues after the process changes.',2.58,5.3,8.18,0.28,{fontSize:14,bold:true,color:C.indigo,align:'center'});
  actionBar(s,'WRITE','Assign one role to each lifecycle responsibility.','governance responsibility strip');
  note(s, 'Governance is not a late approval step. Include data classification, approved environment, retention, monitoring, change control, and retirement.');
}
// 13
{
  const s = pptx.addSlide('LIGHT'); header(s, 'Readiness is decided by blockers and controls, not by an average score alone.', 'Decide');
  const bands=[['0–5','NOT READY','Clarify process, data, owner, and controls.',C.ink],['6–9','DISCOVERY ONLY','Evidence and control gaps remain.',C.warning],['10–12','CONTAINED PILOT','Bounded scope, human gate, visible failures.',C.primaryActive],['13–14','CONTROLLED PILOT','Strong pilot signal, not production approval.',C.primary]];
  for(let i=0;i<4;i++){const y=1.55+i*1.12;rect(s,0.72,y,7.65,0.89,i===2?C.primarySoft:C.white,i===0?C.ink:i===1?C.warning:C.primary,true);addText(s,bands[i][0],0.98,y+0.22,0.85,0.32,{fontSize:18,bold:true,color:bands[i][3],align:'center'});addText(s,bands[i][1],2.02,y+0.21,1.8,0.32,{fontSize:13,bold:true,color:C.indigo});addText(s,bands[i][2],3.82,y+0.19,4.15,0.36,{fontSize:13.5,color:C.body});}
  rect(s,8.78,1.55,3.75,4.25,C.ink,C.ink,true);addText(s,'GATE OVERRIDES SCORE',9.16,1.98,2.98,0.4,{fontSize:15,bold:true,color:C.white,align:'center'});addText(s,'A zero in scope, review, failure visibility, or governance blocks a pilot.',9.22,2.92,2.86,1.18,{fontSize:19,bold:true,color:C.white,align:'center',valign:'top',fit:'shrink'});addText(s,'A low score is useful when it prevents a weak pilot.',9.27,4.72,2.75,0.55,{fontSize:13,color:C.darkSoft,align:'center'});
  actionBar(s,'DECIDE','Place the workflow card in one lane; apply blocker rules first.','readiness decision');
  note(s, 'Do not call 13–14 production-ready. This is only a strong signal for a controlled pilot after governance and access validation.');
}
// 14
{
  const s = pptx.addSlide('LIGHT'); header(s, 'A boring coordination workflow becomes useful when the agent drafts and the planner owns.', 'Test');
  addText(s,'SYNTHETIC EXAMPLE',0.72,1.52,2.0,0.25,{fontSize:10,bold:true,color:C.primaryActive,charSpacing:1.2});
  const flow=[['KNOWN INPUTS','Status fields + documents'],['AGENT','Collect + flag gaps + draft'],['PLANNER','Review + edit + approve'],['OUTPUT','Human-approved status summary']];
  for(let i=0;i<4;i++){const x=0.72+i*3.11;rect(s,x,2.02,2.65,2.1,i===2?C.primarySoft:C.white,i===2?C.primary:C.hairline,true);addText(s,flow[i][0],x+0.2,2.34,2.25,0.32,{fontSize:12,bold:true,color:i===2?C.primary:C.indigo,align:'center'});addText(s,flow[i][1],x+0.28,3.12,2.09,0.62,{fontSize:14,bold:true,color:C.body,align:'center',valign:'top'});if(i<3)s.addShape(pptx.ShapeType.chevron,{x:x+2.72,y:2.75,w:0.32,h:0.55,fill:{color:C.primaryMuted},line:{color:C.primaryMuted}});}
  rect(s,0.72,4.55,5.72,0.9,'FFF7E8',C.warning,true);addText(s,'MAY NOT: approve, commit, or contact outside parties.',1.03,4.83,5.1,0.34,{fontSize:15,bold:true,color:C.indigo,align:'center'});
  rect(s,6.82,4.55,5.55,0.9,C.blueSoft,C.primary,true);addText(s,'VISIBLE FAILURES: missing input, stale source, conflicting status.',7.12,4.72,4.95,0.52,{fontSize:14,bold:true,color:C.indigo,align:'center'});
  actionBar(s,'TEST','Challenge the example, then transfer only the structure to your case.','worked readiness pattern');
  note(s, 'This example is generic and synthetic. It demonstrates a narrow agent role with clear human review and visible failures.');
}
// 15
{
  const s = pptx.addSlide('DARK'); header(s, 'Leave with one label, one evidence action, and one named owner.', 'Commit', true);
  const outputs=[['1','LABEL','Not ready · Discovery · Contained · Controlled'],['2','ACTION','One task that produces the missing evidence'],['3','OWNER','One accountable role for the next decision']];
  for(let i=0;i<3;i++){const x=0.78+i*4.12;rect(s,x,1.7,3.72,3.65,C.darkElevated,i===1?C.primary:C.primaryActive,true);token(s,outputs[i][0],x+1.45,2.02,i===1?C.primary:C.violet,C.white,0.78);addText(s,outputs[i][1],x+0.35,3.12,3.02,0.34,{fontSize:14,bold:true,color:C.primaryMuted,align:'center',charSpacing:0.7});addText(s,outputs[i][2],x+0.38,3.85,2.96,0.84,{fontSize:15,bold:true,color:C.white,align:'center',valign:'top'});}
  addText(s,'Interactive canvas',0.82,5.76,1.7,0.25,{fontSize:11,bold:true,color:C.primaryMuted});addText(s,'kienlef.github.io/labs/agent-readiness-canvas.html',2.28,5.72,4.35,0.3,{fontSize:12,color:C.white,hyperlink:{url:'https://kienlef.github.io/labs/agent-readiness-canvas.html'}});
  addText(s,'AI in Operations',7.0,5.76,1.65,0.25,{fontSize:11,bold:true,color:C.primaryMuted});addText(s,'kienlef.github.io/ai-agents-in-operations/',8.58,5.72,3.88,0.3,{fontSize:12,color:C.white,hyperlink:{url:'https://kienlef.github.io/ai-agents-in-operations/'}});
  actionBar(s,'COMMIT','Write the label, evidence action, and owner on the canvas.','one-page handover',true);
  note(s, 'Close by praising a precise “not ready” result. Readiness work is successful when uncertainty becomes visible before the agent makes it expensive.');
}

function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
const htmlSlides = [
['Agent readiness is a decision-system check, not an AI capability pitch.','A 30-minute tabletop session for operations professionals. Make boundaries, evidence, ownership, failure paths, and permissions physically visible before anyone builds.','POINT','decision friction'],
['One workflow should leave the room with one defensible next decision.','30 minutes · one workflow · one decision','POINT','decision-friction mark'],
['The safest starting point is one repeated workflow with a visible handoff.','When ______ happens, the team must ______, so that ______ can decide or hand off.','WRITE','candidate workflow card'],
['A workflow is not ready until its start, stop, and exception path are explicit.','TRIGGER → INPUTS → AGENT ROLE → HUMAN GATE → OUTPUT → STOP  ↘ EXCEPTION','PLACE','workflow boundary map'],
['Every consequential agent action needs one accountable decision owner.','OWNS · APPROVES · REVIEWS · STOPS','PASS','decision ownership map'],
['The agent can operate only inside a declared permission envelope.','OBSERVE · DRAFT · RECOMMEND · EXECUTE · ESCALATE · NEVER','SORT','allowed and forbidden actions'],
['Readiness is visible only when all seven dimensions have evidence and an owner.','Problem · Boundary · Data · Scope · Review · Failure · Governance','PLACE','seven-dimension canvas'],
['Score what is on the table: no evidence means zero.','ZERO = no evidence   ·   1 = partial   ·   2 = concrete evidence accepted by an owner','SCORE','evidence-backed score'],
['A single hard blocker can stop the pilot, even when the total looks attractive.','No owner · no human gate · unclear data use · silent failure · hidden authority · irreversible harm','STOP','hard-blocker record'],
['If the agent is confidently wrong, the design must still make the failure visible.','BREAK IT → NOTICE IT → CONTAIN IT → RECOVER','DRILL','failure and fallback chain'],
['Human review belongs where judgment changes the consequence, not everywhere.','No review · sampled review · pre-action approval · mandatory expert review','SORT','human review matrix'],
['Governance must name who changes, monitors, audits, and retires the workflow.','CHANGE → VALIDATE → MONITOR → AUDIT → RETIRE','WRITE','governance responsibility strip'],
['Readiness is decided by blockers and controls, not by an average score alone.','0–5 not ready · 6–9 discovery · 10–12 contained pilot · 13–14 controlled pilot signal','DECIDE','readiness decision'],
['A boring coordination workflow becomes useful when the agent drafts and the planner owns.','Known inputs → agent drafts and flags gaps → planner reviews → human-approved summary','TEST','worked readiness pattern'],
['Leave with one label, one evidence action, and one named owner.','Not ready · Discovery · Contained · Controlled','COMMIT','one-page handover']
];
function deckHtml(){
  return `<!doctype html><html><head><meta charset="utf-8"><title>Agent Readiness Workshop v0.2</title><style>
  @page{size:13.333in 7.5in;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:#${C.ink};background:#fff}.slide{width:13.333in;height:7.5in;page-break-after:always;padding:.58in;position:relative;overflow:hidden;background:#fff}.slide:last-child{page-break-after:auto}.slide.dark{background:#${C.ink};color:#fff}.eyebrow{font-size:11px;letter-spacing:1.8px;font-weight:700;color:#${C.primaryActive};margin-bottom:18px}.dark .eyebrow{color:#${C.primaryMuted}}h1{font-size:40px;line-height:1.08;margin:0;max-width:11.8in;color:#${C.indigo}}.dark h1{color:#fff}.body{margin-top:.62in;border:1px solid #${C.hairline};border-radius:24px;padding:.48in;background:#${C.soft};font-size:24px;line-height:1.38;font-weight:600;min-height:3.75in;display:flex;align-items:center;justify-content:center;text-align:center}.dark .body{background:#${C.darkElevated};border-color:#${C.primaryActive};color:#fff}.action{position:absolute;left:.58in;right:.58in;bottom:.55in;border-radius:16px;background:#${C.blueSoft};padding:14px 18px;display:flex;justify-content:space-between;align-items:center;border:1px solid #${C.hairline};font-size:14px;font-weight:700}.dark .action{background:#${C.darkElevated};border-color:#${C.primaryActive}}.verb{color:#${C.primary};letter-spacing:1px}.footer{position:absolute;left:.58in;bottom:.18in;font-size:9px;color:#${C.muted};letter-spacing:1px}.dark .footer{color:#${C.darkSoft}}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body>${htmlSlides.map((x,i)=>`<section class="slide ${[0,8,14].includes(i)?'dark':''}"><div class="eyebrow">${esc(x[2])} · SLIDE ${i+1}</div><h1>${esc(x[0])}</h1><div class="body">${esc(x[1])}</div><div class="action"><span><span class="verb">${esc(x[2])}</span> · perform the physical move</span><span>OUTPUT · ${esc(x[3])}</span></div><div class="footer">FRANK KIENLE · AGENT READINESS WORKSHOP v0.2 · PERSONAL EDUCATIONAL MATERIAL</div></section>`).join('')}</body></html>`;
}
function renderedDeckHtml(){
  const slides=Array.from({length:15},(_,i)=>`<figure><img src="slide-${String(i+1).padStart(2,'0')}.png" alt="Rendered workshop slide ${i+1}"><figcaption>Slide ${i+1}</figcaption></figure>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Rendered Agent Readiness Workshop v0.2</title><style>*{box-sizing:border-box}body{margin:24px;font-family:Arial,sans-serif;color:#${C.ink};background:#${C.soft}}h1{color:#${C.indigo};font-size:30px;margin:0 0 18px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:18px}figure{margin:0;background:#fff;border:1px solid #${C.hairline};border-radius:16px;padding:10px}img{display:block;width:100%;height:auto;border-radius:8px}figcaption{font-size:12px;color:#${C.muted};margin-top:8px}</style></head><body><h1>Agent Readiness Workshop v0.2 · PowerPoint render</h1><div class="grid">${slides}</div></body></html>`;
}

const dims = [
['Business problem','What operational pain changes?','Baseline / current evidence'],['Workflow boundary','Where does it start and stop?','Trigger / handoff / exception'],['Data readiness','Which source is authoritative?','Owner / quality / permission'],['Decision & action scope','What may the agent do?','Allowed / forbidden / threshold'],['Human review','Who checks before harm?','Role / timing / override'],['Failure visibility','How is wrong output noticed?','Signal / fallback / retained evidence'],['Governance & confidentiality','Which controls apply?','Classification / environment / change owner']
];
function kitHtml(){
  const dimCards=dims.map((d,i)=>`<div class="dim"><div class="num">${i+1}</div><h2>${esc(d[0])}</h2><p>${esc(d[1])}</p><div class="write">PLACE / WRITE EVIDENCE: ____________</div><div class="write">OWNER: ____________________________</div><div class="scores">SCORE <b>0</b> <b>1</b> <b>2</b></div></div>`).join('');
  const evidence=dims.flatMap((d,i)=>[[d[0],d[1]],[d[0],d[2]]]).map((d,i)=>`<div class="ecard"><small>DIMENSION ${Math.floor(i/2)+1}</small><h3>${esc(d[0])}</h3><p>${esc(d[1])}</p><div class="line">Source / artifact / role</div></div>`);
  const blockers=['NO OWNER','NO EVIDENCE','UNCLEAR BOUNDARY','SILENT FAILURE','SENSITIVE DATA','HUMAN GATE MISSING','ACTION AUTHORITY UNCLEAR','METRIC THEATRE'];
  return `<!doctype html><html><head><meta charset="utf-8"><title>Agent Readiness Workshop Print Kit v0.2</title><style>
  @page{size:A4 landscape;margin:8mm}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:#${C.ink}}.page{height:190mm;page-break-after:always;position:relative;padding:3mm;overflow:hidden}.page:last-child{page-break-after:auto}.kicker{font-size:9pt;letter-spacing:1.2pt;font-weight:700;color:#${C.primaryActive}}h1{font-size:20pt;color:#${C.indigo};margin:2mm 0 4mm}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}.dim{border:1.5px solid #${C.body};border-radius:4mm;padding:3.5mm;min-height:61mm;background:#${C.soft};position:relative}.dim .num{width:8mm;height:8mm;border-radius:50%;background:#${C.primary};color:#fff;display:grid;place-items:center;font-weight:700}.dim h2{font-size:11.5pt;color:#${C.indigo};margin:2.5mm 0 1mm}.dim p{font-size:9.5pt;min-height:10mm;margin:1mm 0}.write{font-size:9pt;border-bottom:1px solid #${C.body};padding:2mm 0}.scores{font-size:9pt;margin-top:2mm}.scores b{display:inline-grid;place-items:center;width:7mm;height:7mm;border:1px solid #${C.primary};border-radius:50%;margin-left:1.5mm}.decision{border:2px solid #${C.primary};border-radius:4mm;padding:3mm;margin-top:3mm;display:grid;grid-template-columns:2fr 1fr 2fr 2fr;gap:3mm;font-size:10pt}.decision div{border-right:1px solid #${C.hairline}}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm}.ecard{height:51mm;border:1.5px dashed #${C.body};border-radius:4mm;padding:4mm;overflow:hidden}.ecard small{font-size:9pt;color:#${C.primaryActive};font-weight:700;letter-spacing:.7pt}.ecard h3{font-size:12pt;color:#${C.indigo};margin:2mm 0}.ecard p{font-size:10pt;line-height:1.25}.line{margin-top:4mm;border-bottom:1.5px solid #${C.body};font-size:9pt;color:#${C.muted};padding-bottom:1mm}.tokens{display:grid;grid-template-columns:repeat(7,1fr);gap:3mm}.tok{height:33mm;border-radius:5mm;border:2px solid #${C.body};display:grid;place-items:center;font-size:24pt;font-weight:700;color:#${C.primaryActive};page-break-inside:avoid}.label{border:2px dashed #${C.primary};border-radius:4mm;padding:5mm;font-size:12pt;font-weight:700;text-align:center}.blockers{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}.blocker{border:2px dashed #${C.plum};background:#fff;border-radius:4mm;padding:5mm 3mm;font-size:10.5pt;font-weight:700;text-align:center;color:#${C.plum};min-height:26mm;display:grid;place-items:center}.utilities{display:grid;grid-template-columns:2fr 1fr 1fr;gap:3mm;margin-top:5mm}.stop{background:#fff;color:#${C.ink};border:4px solid #${C.ink};border-radius:4mm;padding:6mm;text-align:center;font-size:20pt;font-weight:700}.guide{display:grid;grid-template-columns:repeat(5,1fr);gap:4mm}.phase{border:1px solid #${C.hairline};border-radius:4mm;padding:4mm;min-height:72mm}.phase b{color:#${C.primaryActive}}ul{font-size:10pt;line-height:1.35;padding-left:4mm}.footer{position:absolute;bottom:0;left:3mm;right:3mm;border-top:1px solid #${C.hairline};padding-top:2mm;font-size:8.5pt;color:#${C.muted};display:flex;justify-content:space-between}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body>
  <section class="page"><div class="kicker">PRINT 1 PER TEAM · READINESS CANVAS</div><h1>Place evidence. Name the owner. Score what is visible.</h1><div class="grid">${dimCards}<div class="dim" style="background:#fff;border:3px solid #${C.primaryActive}"><div class="kicker">FINAL DECISION</div><h2>One label. One action. One owner.</h2><p>□ Not ready<br>□ Discovery only<br>□ Contained pilot<br>□ Controlled pilot signal</p></div></div><div class="decision"><div>WORKFLOW: ____________________</div><div>TOTAL: ____ / 14</div><div>NEXT EVIDENCE ACTION: ____________________</div><div>OWNER: ____________________</div></div><div class="footer"><span>Agent Readiness Workshop v0.2</span><span>Frank Kienle · Personal educational material · Use synthetic or approved data only</span></div></section>
  <section class="page"><div class="kicker">CUT ALONG THE DASHED LINES · EVIDENCE CARDS</div><h1>Evidence beats optimism.</h1><div class="cards">${evidence.slice(0,8).join('')}</div><div class="footer"><span>Evidence cards 1/2</span><span>Write one source, artifact, policy, metric, or owner on each card</span></div></section>
  <section class="page"><div class="kicker">CUT ALONG THE DASHED LINES · EVIDENCE CARDS</div><h1>Name the source, owner, permission, or control.</h1><div class="cards">${evidence.slice(8).join('')}</div><div class="footer"><span>Evidence cards 2/2</span><span>No evidence means zero</span></div></section>
  <section class="page"><div class="kicker">CUT-OUT TOKENS · SCORES AND DECISION LABELS</div><h1>Score what is physically on the canvas.</h1><div class="tokens">${Array.from({length:21},(_,i)=>`<div class="tok">${Math.floor(i/7)}</div>`).join('')}</div><div class="cards" style="margin-top:7mm"><div class="label">NOT READY</div><div class="label">DISCOVERY ONLY</div><div class="label">CONTAINED PILOT</div><div class="label">CONTROLLED PILOT SIGNAL</div></div><div class="footer"><span>0 no evidence · 1 partial · 2 concrete evidence accepted by an owner</span><span>A hard blocker overrides the total</span></div></section>
  <section class="page"><div class="kicker">CUT-OUT TOKENS · BLOCKERS, STOP CARD, BATON</div><h1>Make missing control visible.</h1><div class="blockers">${blockers.map(x=>`<div class="blocker">${x}</div>`).join('')}</div><div class="utilities"><div class="stop">STOP<br><small style="font-size:11pt;color:#${C.body}">NO EVIDENCE MEANS NOT READY</small></div><div class="label">DECISION OWNER BATON</div><div class="label">BOUNDARY STRING / ARROWS</div></div><div class="footer"><span>Any participant may place the Stop Card</span><span>Resolve the missing evidence before scoring</span></div></section>
  <section class="page"><div class="kicker">FACILITATOR GUIDE · 25–35 MINUTES</div><h1>Cut → place → score → decide. Keep the evidence visible.</h1><div class="guide"><div class="phase"><b>0–3 min</b><h3>Frame</h3><ul><li>One workflow</li><li>No tools discussion</li><li>Low score is useful</li></ul></div><div class="phase"><b>3–7 min</b><h3>Boundary</h3><ul><li>Lay the string</li><li>Mark trigger, gate, stop</li><li>Add exception path</li></ul></div><div class="phase"><b>7–17 min</b><h3>Evidence</h3><ul><li>Place cards</li><li>Name sources and owners</li><li>Use blockers for assumptions</li></ul></div><div class="phase"><b>17–23 min</b><h3>Score</h3><ul><li>Place 0 / 1 / 2</li><li>Blockers cap scores</li><li>Critical zero blocks pilot</li></ul></div><div class="phase"><b>23–35 min</b><h3>Skeptic + decide</h3><ul><li>Remove unsupported tokens</li><li>Choose one label</li><li>Write one action + owner</li></ul></div></div><div class="decision" style="margin-top:7mm"><div>SHOW THE EVIDENCE.</div><div>NAME THE OWNER.</div><div>WHERE DOES IT STOP?</div><div>WHAT CAN FAIL SILENTLY?</div></div><div class="footer"><span>Educational workshop, not legal, compliance, financial, or employer-specific advice</span><span>© Frank Kienle</span></div></section>
  </body></html>`;
}

async function main(){
  await mkdir(OUT,{recursive:true}); await mkdir(QA,{recursive:true});
  await pptx.writeFile({fileName:deckPptx});
  const deckOutlinePath=resolve(QA,'deck-outline-preview.html'); const deckHtmlPath=resolve(QA,'deck-preview.html'); const kitHtmlPath=resolve(QA,'print-kit-preview.html');
  await writeFile(deckOutlinePath,deckHtml(),'utf8'); await writeFile(kitHtmlPath,kitHtml(),'utf8');
  const loExportDir=await mkdtemp(resolve(tmpdir(),'agent-readiness-lo-'));
  execFileSync(SOFFICE,['--headless','--convert-to','pdf','--outdir',loExportDir,deckPptx],{stdio:'inherit'});
  await copyFile(resolve(loExportDir,'agent-readiness-workshop-v0.2-2026-09-06.pdf'),deckPdf);
  execFileSync('/opt/homebrew/bin/pdftoppm',['-png','-r','110',deckPdf,resolve(QA,'slide')],{stdio:'inherit'});
  await writeFile(deckHtmlPath,renderedDeckHtml(),'utf8');
  execFileSync(CHROME,['--headless','--disable-gpu','--no-sandbox','--print-to-pdf-no-header',`--print-to-pdf=${kitPdf}`,`file://${kitHtmlPath}`],{stdio:'inherit'});
  console.log(JSON.stringify({deckPptx,deckPdf,kitPdf,slides:15,kitPages:6},null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
