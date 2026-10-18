import {keywordTitle} from "./idea-title";
import type {Board,Theme} from "./ideas";
export type NetworkNode={id:string;kind:"root"|"theme"|"cluster"|"idea";ideaId?:string;groupId?:string;title:string;x:number;y:number;size:number;tone:number;count:number};
type Circle={x:number;y:number;size:number};
const golden=Math.PI*(3-Math.sqrt(5));
function place(size:number,existing:Circle[],seed:number,gap:number):Circle{
 for(let turn=0;turn<12000;turn++){const angle=seed+turn*golden;const radius=Math.sqrt(turn)*19;const candidate={x:Math.cos(angle)*radius,y:Math.sin(angle)*radius,size};if(existing.every(c=>Math.hypot(c.x-candidate.x,c.y-candidate.y)>=(c.size+size)/2+gap))return candidate;}
 const edge=Math.max(0,...existing.map(c=>c.x+c.size/2));return {x:edge+size/2+gap,y:0,size};
}
export function shortNodeName(title:string){return title.trim().split(/\s+/).length<=4?title:keywordTitle(title);}
function placeCloud(local:NetworkNode[],existing:NetworkNode[],seed:number){
 let best:{x:number;y:number;score:number}|undefined;let valid=0;for(let turn=0;turn<6000;turn++){const angle=seed+turn*golden,x=Math.cos(angle)*Math.sqrt(turn)*24,y=Math.sin(angle)*Math.sqrt(turn)*24;if(local.every(n=>existing.every(c=>Math.hypot(c.x-x-n.x,c.y-y-n.y)>=(c.size+n.size)/2+34))){const all=[...existing,...local.map(n=>({...n,x:n.x+x,y:n.y+y}))];const width=Math.max(...all.map(n=>n.x+n.size/2))-Math.min(...all.map(n=>n.x-n.size/2));const height=Math.max(...all.map(n=>n.y+n.size/2))-Math.min(...all.map(n=>n.y-n.size/2));const score=Math.max(width/1.65,height)+width*height/10000;if(!best||score<best.score)best={x,y,score};if(++valid>=80)break;}}if(best)return best;
 const right=Math.max(0,...existing.map(n=>n.x+n.size/2));const left=Math.min(...local.map(n=>n.x-n.size/2));return {x:right-left+45,y:0};
}
export function networkFor(board:Board,expanded?:string){
 const unassigned=board.groups.filter(g=>!board.themes?.some(t=>t.id===g.themeId));
 const themes:Theme[]=[...(board.themes||[]),...(unassigned.length?[{id:"__unassigned",title:board.themes?.length?"Other clusters":"Your ideas",explanation:"Clusters without an assigned theme."}]:[])];
 const links:{from:string;to:string;overlap?:number}[]=[];
 const clouds=themes.map((theme,index)=>{
  const groups=board.groups.filter(g=>theme.id==="__unassigned"?unassigned.includes(g):g.themeId===theme.id);
  const count=new Set(groups.flatMap(g=>g.ideaIds)).size;
  const themeSize=Math.max(110,70*Math.sqrt(count));
  const local:NetworkNode[]=[{id:theme.id,kind:"theme",title:theme.title,x:0,y:0,size:themeSize,tone:index%5,count}];
  groups.slice().sort((a,b)=>b.ideaIds.length-a.ideaIds.length||a.id.localeCompare(b.id)).forEach((group,i)=>{const size=Math.max(100,52*Math.sqrt(group.ideaIds.length));const point=place(size,local,i*.71,26+Math.sqrt(count)*2);local.push({id:group.id,kind:"cluster",title:group.title||"Untitled cluster",...point,tone:index%5,count:group.ideaIds.length});links.push({from:theme.id,to:group.id});});
  const radius=Math.max(...local.map(n=>Math.hypot(n.x,n.y)+n.size/2))+24+Math.sqrt(count)*3;
  return {local,radius,count};
 });
 const nodes:NetworkNode[]=[];
 if(themes.length>1)nodes.push({id:"__root",kind:"root",title:"All ideas",x:0,y:0,size:112,tone:-1,count:board.ideas.length});
 clouds.forEach((cloud,index)=>{const center=themes.length===1?{x:0,y:0,size:cloud.radius*2}:placeCloud(cloud.local,nodes,index*golden);cloud.local.forEach(node=>nodes.push({...node,x:node.x+center.x,y:node.y+center.y}));if(themes.length>1)links.push({from:"__root",to:cloud.local[0].id});});
 for(let i=0;i<board.groups.length;i++)for(let j=i+1;j<board.groups.length;j++){const count=board.groups[i].ideaIds.filter(id=>board.groups[j].ideaIds.includes(id)).length;if(count)links.push({from:board.groups[i].id,to:board.groups[j].id,overlap:count});}
 const minX=Math.min(0,...nodes.map(n=>n.x-n.size/2))-50,minY=Math.min(0,...nodes.map(n=>n.y-n.size/2))-50;
 const maxX=Math.max(0,...nodes.map(n=>n.x+n.size/2))+50,maxY=Math.max(0,...nodes.map(n=>n.y+n.size/2))+50;
 const positioned=nodes.map(n=>({...n,x:n.x-minX,y:n.y-minY}));
 const expandedGroup=board.groups.find(g=>g.id===expanded);if(expandedGroup){const parent=positioned.find(n=>n.id===expanded)!;for(const id of expandedGroup.ideaIds){const idea=board.ideas.find(i=>i.id===id)!;const relative=positioned.map(n=>({...n,x:n.x-parent.x,y:n.y-parent.y}));const point=place(86,relative,positioned.length*.71,16);positioned.push({id:"idea-"+expandedGroup.id+"-"+id,kind:"idea",ideaId:id,groupId:expandedGroup.id,title:idea.title||keywordTitle(idea.text),x:point.x+parent.x,y:point.y+parent.y,size:86,tone:parent.tone,count:1});links.push({from:parent.id,to:"idea-"+expandedGroup.id+"-"+id});}}
 return {nodes:positioned,links,width:maxX-minX,height:maxY-minY};
}


