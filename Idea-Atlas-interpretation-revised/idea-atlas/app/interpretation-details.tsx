import type {Board} from "../lib/ideas";

export default function InterpretationDetails({board,targetId}:{board:Board;targetId:string}){
 const note=board.interpretationNotes?.find(item=>item.targetId===targetId);
 if(!note)return null;
 function sources(ids:string[]){return <details><summary>Source ideas · {ids.join(", ")}</summary><ul>{ids.map(id=><li key={id}><strong>{id}</strong> — {board.ideas.find(idea=>idea.id===id)?.text||"Source unavailable"}</li>)}</ul></details>;}
 return <div className="interpretation-details">
  <p><strong>One possible interpretation</strong></p>
  <p>Based on supplied ideas, not verified research findings. These notes reflect the original AI grouping and are not regenerated after manual edits.</p>
  {sources(note.sourceIdeaIds)}
  {note.alternatives.map((item,index)=><section key={`alternative-${index}`}><h4>Alternative reading</h4><p>{item.interpretation}</p>{sources(item.sourceIdeaIds)}</section>)}
  {note.tensions.map((item,index)=><section key={`tension-${index}`}><h4>Tension / contrasting reading</h4><p>{item.interpretation}</p>{sources(item.sourceIdeaIds)}</section>)}
 </div>;
}
