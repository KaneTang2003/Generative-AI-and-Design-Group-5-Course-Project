"use client";
import {useEffect,useState} from "react";
import IdeaFriends from "./idea-friends";
import {Check} from "lucide-react";
import type {ProcessingStage} from "../lib/progress";
const stages=[
 {title:"Collecting your data…",detail:"Checking your ideas and gathering the input for this request."},
 {title:"Organizing information…",detail:"Preparing your ideas and group settings for the AI."},
 {title:"Analyzing patterns…",detail:"Gemini is looking for themes, connections, overlaps, and outliers."},
 {title:"Generating insights…",detail:"The AI response has arrived. We’re checking its groups and explanations."},
 {title:"Preparing your overview…",detail:"Every idea has been accounted for. Your editable board is ready to display."}
];
const scattered=[[24,37],[65,23],[106,44],[161,27],[208,51],[266,34],[36,108],[87,145],[140,100],[191,138],[244,110],[285,151]];
const grouped=[[43,62],[67,43],[82,72],[128,58],[151,39],[174,72],[217,60],[243,42],[265,71],[60,131],[153,128],[246,128]];
export default function Processing({stage,retrying}:{stage:ProcessingStage;retrying:boolean}){
 const [elapsed,setElapsed]=useState(0);
 useEffect(()=>{const start=Date.now();const timer=setInterval(()=>setElapsed(Math.floor((Date.now()-start)/1000)),1000);return()=>clearInterval(timer);},[]);
 return <section className={`processing processing-${stage}`} aria-label="Clustering progress"><div className="processing-intro"><h3>Clustering your ideas</h3><IdeaFriends small/></div><div className="processing-art" aria-hidden="true"><svg viewBox="0 0 310 180"><g className="processing-links">{grouped.map((point,index)=>index%3!==2&&<line key={index} x1={point[0]} y1={point[1]} x2={grouped[index+1][0]} y2={grouped[index+1][1]}/>)}</g>{scattered.map((point,index)=>{const destination=stage===0?point:grouped[index];return <g className="processing-point" key={index} style={{transform:`translate(${destination[0]}px, ${destination[1]}px)`}}><circle className="point-halo" r="13" style={{animationDelay:`${index*.17}s`}}/><circle className={`point-dot point-tone-${index%3}`} r={stage>=3?6:5}/></g>;})}</svg></div><div className="processing-current" role="status" aria-live="polite" aria-atomic="true"><h4 key={stage}>{stages[stage].title}</h4><p>{stages[stage].detail}</p></div><ol className="processing-steps" aria-label="Processing stages">{stages.map((item,index)=><li key={item.title} className={index<stage?"is-complete":index===stage?"is-active":"is-waiting"} aria-current={index===stage?"step":undefined}><span className="processing-step-icon" aria-hidden="true">{index<stage?<Check size={15}/>:index+1}</span><span>{item.title.replace("…","")}<span className="sr-only"> — {index<stage?"Completed":index===stage?"In progress":"Not started"}</span></span></li>)}</ol><div className="processing-reassurance" aria-live="polite">{retrying?"Gemini is busy. We’re trying again; your ideas are still here.":elapsed>=25?"A little longer than usual. We’re still waiting for the AI.":""}</div></section>;
}
