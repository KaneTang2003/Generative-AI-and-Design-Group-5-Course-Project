import type {Board} from "./ideas";

export type ExportFormat="txt"|"json";
export function exportBoard(board:Board,format:ExportFormat,edited:boolean,exportedAt=new Date()){
 const date=exportedAt.toISOString();
 const filename=`idea-atlas-${date.slice(0,10)}.${format}`;
 if(format==="json")return {filename,type:"application/json;charset=utf-8",content:JSON.stringify({exportedAt:date,manuallyEdited:edited,...board},null,2)};
 const ideas=new Map(board.ideas.map(i=>[i.id,i]));
 const lines=["IDEA ATLAS — CLUSTER BOARD",`Exported: ${date}`,`${board.ideas.length} ideas · ${board.groups.length} groups · ${board.outliers.length} outliers`,edited?"Manually edited board. AI explanations and suggestions reflect the original clustering.":"AI clustering, without manual edits.","This file contains the current board, including any manual changes."];
 const others=(id:string,from:string)=>[...board.groups.filter(g=>g.id!==from&&g.ideaIds.includes(id)).map(g=>g.title||"Untitled group"),...(from!=="outliers"&&board.outliers.some(o=>o.ideaId===id)?["Outliers"]:[])];
 function idea(id:string,from:string){const record=ideas.get(id);if(!record)throw new Error("An idea could not be found. Please check the board before downloading.");lines.push("",`[${id}]`,record.text);const locations=others(id,from);if(locations.length)lines.push(`Overlap — also in: ${locations.join("; ")}`);}
 if(board.themes?.length){lines.push("","THEMES");for(const theme of board.themes)lines.push("",theme.title,theme.explanation,`Clusters: ${board.groups.filter(g=>g.themeId===theme.id).map(g=>g.title).join("; ")}`);}
 if(board.interpretationNotes?.length){
  lines.push("","PROVISIONAL INTERPRETATIONS", "References point to original supplied ideas, not verified research evidence. Notes reflect the original AI grouping and are not regenerated after manual edits.");
  for(const note of board.interpretationNotes){
   const target=board.groups.find(g=>g.id===note.targetId)||board.themes?.find(t=>t.id===note.targetId);
   lines.push("", target?.title||note.targetId, "Sources: "+note.sourceIdeaIds.join(", "));
   for(const [label,items] of [["Alternative reading",note.alternatives],["Tension / contrasting reading",note.tensions]] as const){
    for(const item of items)lines.push(label+": "+item.interpretation,"Sources: "+item.sourceIdeaIds.join(", "));
   }
  }
 }
 if(board.warnings.length)lines.push("","NOTES",...board.warnings);
 board.groups.forEach((group,index)=>{lines.push("","────────────────────────────",`${index+1}. ${group.title||"Untitled group"}`,group.explanation,...(board.themes?.length?[`Theme: ${board.themes.find(t=>t.id===group.themeId)?.title||"Other clusters"}`]:[]),`${group.ideaIds.length} idea instances`);group.ideaIds.forEach(id=>idea(id,group.id));if(!group.ideaIds.length)lines.push("No ideas in this group.");});
 lines.push("","────────────────────────────","OUTLIERS");
 if(!board.outliers.length)lines.push("No outliers.");
 board.outliers.forEach(outlier=>{idea(outlier.ideaId,"outliers");lines.push(`Suggested group: ${board.groups.find(g=>g.id===outlier.suggestedGroupId)?.title||"No suitable group"}`,`Limited fit: ${outlier.reason}`);});
 return {filename,type:"text/plain;charset=utf-8",content:lines.join("\n")+"\n"};
}


