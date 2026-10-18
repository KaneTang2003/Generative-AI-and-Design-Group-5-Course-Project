import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
// Load the pure TypeScript modules without starting the application or contacting AI.
async function load(path){
 const source=fs.readFileSync(new URL(path,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 const rewritten=js.replace('from "zod"',`from ${JSON.stringify(import.meta.resolve('zod'))}`);
 return import('data:text/javascript;base64,'+Buffer.from(rewritten).toString('base64'));
}
const {validateResult,promptFor,outputSchema}=await load('../lib/clustering.ts');
const {exportBoard}=await load('../lib/export-board.ts');
const {moveInstance}=await load('../lib/ideas.ts');
const ideas=[{id:'I001',text:'Provide a quiet shared room'},{id:'I002',text:'Allow conversation in the shared room'},{id:'I003',text:'Build a submarine'}];
const notes=['G1','T1'].map(targetId=>({targetId,sourceIdeaIds:['I001','I002'],alternatives:[{interpretation:'This may concern control over shared space.',sourceIdeaIds:['I001']}],tensions:[{interpretation:'The proposals may express competing expectations of sound in the same space.',sourceIdeaIds:['I001','I002']}]}));
const raw={themes:[{id:'T1',title:'Shared spaces',explanation:'These ideas may concern shared space.'}],groups:[{id:'G1',title:'Room sound',explanation:'These ideas may express different expectations of sound.',themeId:'T1',ideaIds:['I001','I002']}],outliers:[{ideaId:'I003',suggestedGroupId:'G1',reason:'Different context.'}],warnings:[],interpretationNotes:notes};
let checks=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
function invalid(change){const copy=structuredClone(raw);change(copy);assert.throws(()=>validateResult(copy,ideas,1,true));}
check('Valid interpretation and unchanged memberships',()=>{const b=validateResult(raw,ideas,1,true);assert.deepEqual(b.groups,raw.groups);assert.deepEqual(b.interpretationNotes,notes);});
check('Unknown source rejected',()=>invalid(b=>b.interpretationNotes[0].sourceIdeaIds=['I999']));
check('Duplicate source rejected',()=>invalid(b=>b.interpretationNotes[0].sourceIdeaIds=['I001','I001']));
check('Source outside target rejected',()=>invalid(b=>b.interpretationNotes[0].sourceIdeaIds=['I003']));
check('Unknown target rejected',()=>invalid(b=>b.interpretationNotes[0].targetId='G99'));
check('Duplicate target rejected',()=>invalid(b=>b.interpretationNotes[1].targetId='G1'));
check('Missing target rejected',()=>invalid(b=>b.interpretationNotes.pop()));
check('Live response requires notes',()=>invalid(b=>delete b.interpretationNotes));
check('Unrelated alternative rejected',()=>invalid(b=>b.interpretationNotes[0].alternatives[0].sourceIdeaIds=['I003']));
check('Single-source tension rejected',()=>invalid(b=>b.interpretationNotes[0].tensions[0].sourceIdeaIds=['I001']));
check('Cross-group/outlier references do not assign membership',()=>{const b=structuredClone(raw);b.interpretationNotes[0].alternatives[0].sourceIdeaIds=['I001','I003'];assert.equal(validateResult(b,ideas,1,true).outliers.length,1);});
check('Unsupported alternatives and tensions may be empty',()=>{const b=structuredClone(raw);b.interpretationNotes.forEach(n=>{n.alternatives=[];n.tensions=[];});validateResult(b,ideas,1,true);});
check('Existing exact group count remains enforced',()=>assert.throws(()=>validateResult(raw,ideas,2,true)));
check('Existing coverage remains enforced',()=>invalid(b=>b.outliers=[]));
check('Legacy demo remains valid without notes',()=>{const b=JSON.parse(fs.readFileSync(new URL('../lib/demo-board.json',import.meta.url),'utf8'));assert.equal(validateResult(b,b.ideas,null).ideas.length,34);});
check('Manual move retains original notes',()=>assert.deepEqual(moveInstance(validateResult(raw,ideas,1,true),'I001','G1','outliers').interpretationNotes,notes));
check('JSON retains complete notes',()=>assert.deepEqual(JSON.parse(exportBoard(validateResult(raw,ideas,1,true),'json',false).content).interpretationNotes,notes));
check('Text exports interpretations, references and edit caveat',()=>{const text=exportBoard(validateResult(raw,ideas,1,true),'txt',true).content;for(const fragment of ['Alternative reading','Tension / contrasting reading','Sources: I001, I002','not regenerated after manual edits'])assert.ok(text.includes(fragment));});
check('Output schema requires notes and prompt preserves core grouping',()=>{assert.ok(outputSchema.required.includes('interpretationNotes'));const prompt=promptFor(3,null);for(const fragment of ['Return EXACTLY 3 groups','overlap audit','INTERPRETATIONS REMAIN PROVISIONAL','CONTRADICTIONS AND TENSIONS'])assert.ok(prompt.includes(fragment));});
console.log(`${checks} checks passed. No AI requests made.`);
