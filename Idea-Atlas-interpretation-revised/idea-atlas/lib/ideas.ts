export type Idea = { id: string; text: string; title?:string };
export type Theme = {id:string;title:string;explanation:string};
export type Group = { id: string; title: string; explanation: string; ideaIds: string[];themeId?:string };
export type InterpretationNote = {
 targetId: string;
 sourceIdeaIds: string[];
 alternatives: { interpretation: string; sourceIdeaIds: string[] }[];
 tensions: { interpretation: string; sourceIdeaIds: string[] }[];
};
export type Board = { interpretationNotes?: InterpretationNote[]; ideas: Idea[]; groups: Group[];themes?:Theme[]; outliers: { ideaId: string; suggestedGroupId: string | null; reason: string }[]; warnings: string[] };
export type Practice = { name?: string; examples: {text: string; clusters: string[]; feedback: string}[]; hasClusters: boolean };
export const sampleIdeas = `Plant a shared neighborhood vegetable garden
Offer composting workshops for residents
Install rainwater collection barrels in the garden
Host a monthly repair café for broken appliances
Create a tool library where neighbors can borrow equipment
Teach basic bicycle repair at the community center
Start a neighborhood book exchange
Organize a monthly storytelling evening
Host a seed-and-book swap in the community garden
Build a submarine to explore the Mariana Trench`;
export function csvRows(raw: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let field=""; let quoted=false; let closed=false;
  const value=raw.replace(/^\uFEFF/,"");
  for(let i=0;i<value.length;i++) { const c=value[i];
    if(quoted) { if(c==='"') { if(value[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;} } else field+=c; }
    else if(c==='"') { if(field.length || closed) throw new Error("Unreadable CSV: quotation marks must wrap a complete field."); quoted=true; }
    else if(c===",") { row.push(field);field="";closed=false; }
    else if(c==='\n'||c==='\r') { if(c==='\r'&&value[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field="";closed=false; }
    else { if(closed && c.trim())throw new Error("Unreadable CSV: unexpected text after a quoted field."); if(!closed)field+=c; }
  }
  if(quoted)throw new Error("Unreadable CSV: a quoted field is not closed.");
  row.push(field);if(row.some(x=>x.trim()))rows.push(row); return rows;
}
function checkTexts(texts: string[]) {
  if(texts.length>250)throw new Error("Please use at most 250 ideas per request.");
  if(texts.some(t=>t.length>2000))throw new Error("Each idea must be at most 2,000 characters.");
  if(texts.join("").length>60000)throw new Error("Please shorten the list to at most 60,000 characters.");
  if(texts.some(t=>t.includes("\0")))throw new Error("The input contains unreadable characters.");
}
export function parseIdeas(raw: string, csv=false): Idea[] {
  let texts: string[];
  if(csv) { const rows=csvRows(raw);if(!rows.length)return[];const header=rows[0].map(x=>x.trim().toLowerCase());const column=header.findIndex(x=>["idea","ideas","text"].includes(x));
    if(column>=0)texts=rows.slice(1).map(r=>r[column]??"");
    else { if(rows.some(r=>r.length!==1))throw new Error("CSV needs an “idea” column header, or exactly one column without a header.");texts=rows.map(r=>r[0]); }
  } else texts=raw.replace(/^\uFEFF/,"").split(/\r?\n/);
  texts=texts.filter(t=>t.trim());checkTexts(texts);return texts.map((text,i)=>({id:`I${String(i+1).padStart(3,"0")}`,text}));
}
export function parsePractice(raw: string,csv=false): Practice {
  if(!raw.trim())throw new Error("The practice dataset is empty.");
  let examples: Practice["examples"];
  if(csv) { const rows=csvRows(raw);const h=rows[0].map(s=>s.trim().toLowerCase());const i=h.indexOf("idea"),c=h.indexOf("cluster"),f=h.indexOf("feedback");
    if(i<0)examples=parseIdeas(raw,true).map(x=>({text:x.text,clusters:[],feedback:""}));
    else examples=rows.slice(1).filter(r=>r[i]?.trim()).map(r=>({text:r[i],clusters:c<0?[]:(r[c]||"").split("|").map(x=>x.trim()).filter(Boolean),feedback:f<0?"":r[f]||""}));
  } else examples=parseIdeas(raw).map(x=>({text:x.text,clusters:[],feedback:""}));
  checkTexts(examples.map(x=>x.text));if(!examples.length)throw new Error("The practice dataset contains no example ideas.");
  if(JSON.stringify(examples).length>60000)throw new Error("Please shorten the practice dataset to 60,000 characters.");
  return {examples,hasClusters:examples.some(x=>x.clusters.length>0)};
}
export function moveInstance(board: Board, id: string, from: string, to: string): Board {
  if(from===to || !board.ideas.some(i=>i.id===id))return board;
  if(!board.groups.some(g=>g.id===to) && to!=="outliers")return board;
  if(from==="outliers" ? !board.outliers.some(o=>o.ideaId===id) : !board.groups.some(g=>g.id===from&&g.ideaIds.includes(id)))return board;
  const groups=board.groups.map(g=>({...g,ideaIds:g.ideaIds.filter(x=>g.id!==from||x!==id)}));
  let outliers=board.outliers.filter(o=>!(from==="outliers"&&o.ideaId===id));
  if(to==="outliers") { if(!outliers.some(o=>o.ideaId===id))outliers.push({ideaId:id,suggestedGroupId:from==="outliers"?null:from,reason:"Moved here manually. The original group may still be a possible fit."}); }
  else { const target=groups.find(g=>g.id===to)!;if(!target.ideaIds.includes(id))target.ideaIds.push(id); }
  return {...board,groups,outliers};
}
