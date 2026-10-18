import type {Board} from "./ideas";
export type ProcessingStage=0|1|2|3|4;
type Event={type:"stage";stage:ProcessingStage}|{type:"retry"}|{type:"result";board:Board}|{type:"error";error:string};
export async function readClusterStream(response:Response,onStage:(stage:ProcessingStage)=>void,onRetry:()=>void):Promise<Board>{
 if(!response.ok){const data=await response.json() as {error?:string};throw Error(data.error||"Clustering failed. Please try again.");}
 if(!response.body)throw Error("The connection ended before your board was ready. Please try again.");
 const reader=response.body.getReader();const decoder=new TextDecoder();let buffer="";let board:Board|undefined;let finished=false;
 function line(value:string){if(!value.trim())return;const event=JSON.parse(value) as Event;if(finished)throw Error("Unexpected processing response. Please try again.");if(event.type==="error")throw Error(event.error);if(event.type==="stage"){if(!Number.isInteger(event.stage)||event.stage<0||event.stage>4)throw Error("Invalid processing update.");onStage(event.stage);}else if(event.type==="retry")onRetry();else if(event.type==="result"){board=event.board;finished=true;}else throw Error("Unexpected processing update.");}
 try{while(true){const {value,done}=await reader.read();buffer+=decoder.decode(value,{stream:!done});if(buffer.length>500000)throw Error("The response was too large. Please try fewer ideas.");let end;while((end=buffer.indexOf("\n"))>=0){line(buffer.slice(0,end));buffer=buffer.slice(end+1);}if(done){line(buffer);break;}}if(!board)throw Error("The connection ended before your board was ready. Your ideas are still here; please try again.");return board;}catch(error){await reader.cancel().catch(()=>{});throw error;}finally{reader.releaseLock();}
}

