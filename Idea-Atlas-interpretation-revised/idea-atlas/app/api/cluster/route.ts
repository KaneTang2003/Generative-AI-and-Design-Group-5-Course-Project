import {env} from "cloudflare:workers";
import {requestSchema,outputSchema,promptFor,validateResult} from "../../../lib/clustering";
type Runtime={GEMINI_API_KEY?:string;GEMINI_MODEL?:string};
const runtime=()=>env as unknown as Runtime;
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
async function fetchGemini(url:string,options:RequestInit,onRetry:()=>void){
 for(let attempt=0;attempt<3;attempt++){
  options.signal?.throwIfAborted();
  const response=await fetch(url,options);
  if(![500,502,503,504].includes(response.status)||attempt===2)return response;
  onRetry();
  await response.body?.cancel();
  await new Promise(resolve=>setTimeout(resolve,1000*2**attempt+Math.floor(Math.random()*250)));
 }
 throw new Error("Gemini retry limit reached");
}
export async function GET(){return json({ready:Boolean(runtime().GEMINI_API_KEY),provider:"Gemini"});}
export async function POST(request:Request){
 const origin=request.headers.get("Origin");if(origin&&origin!==new URL(request.url).origin)return json({error:"Please submit ideas from this website."},403);
 if(!request.headers.get("Content-Type")?.includes("application/json"))return json({error:"Please send text ideas in the supported format."},415);
 const raw=await request.text();if(raw.length>150000)return json({error:"This request is too large. Please shorten the ideas or practice dataset."},413);
 let input:ReturnType<typeof requestSchema.parse>;try{input=requestSchema.parse(JSON.parse(raw));if(new Set(input.ideas.map(i=>i.id)).size!==input.ideas.length)throw Error();if(input.count!==null&&input.count>input.ideas.length)throw Error();if(input.ideas.some(i=>!i.text.trim()||i.text.includes("\0")))throw Error();}catch{return json({error:"Check your ideas and group count. Use 1–250 nonempty ideas and no more groups than ideas."},400);}
 const {GEMINI_API_KEY,GEMINI_MODEL}=runtime();if(!GEMINI_API_KEY)return json({error:"Gemini clustering needs configuration. The site owner must add a Gemini API key as a server secret. Your ideas have not been sent to AI."},503);
 const model=GEMINI_MODEL||"gemini-3.8-flash";
 if(!/^[a-zA-Z0-9._-]+$/.test(model))return json({error:"The Gemini model configuration is invalid. Ask the site owner to check it."},503);
 const apiKey=GEMINI_API_KEY;
 async function run(stage:(value:number)=>void=()=>{},retry:()=>void=()=>{}){
 stage(1);
 try{
  const requestBody=JSON.stringify({systemInstruction:{parts:[{text:promptFor(input.count,input.practice)}]},contents:[{role:"user",parts:[{text:JSON.stringify({brainstormingIdeas:input.ideas,practiceReference:input.practice?{examples:input.practice.examples}:null})}]}],generationConfig:{responseFormat:{text:{mimeType:"APPLICATION_JSON",schema:outputSchema}},maxOutputTokens:24000,thinkingConfig:{thinkingLevel:"LOW"}}});
  stage(2);
  const response=await fetchGemini(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:"POST",headers:{"x-goog-api-key":apiKey,"Content-Type":"application/json"},body:requestBody,signal:AbortSignal.any([AbortSignal.timeout(100000),request.signal])},retry);
  if(!response.ok)console.error("Gemini request failed",{status:response.status});
  if([500,502,503,504].includes(response.status))return json({error:"Gemini is temporarily busy or unavailable. We tried again automatically. Your ideas are still here; please try again in a few minutes."},503);
  if(!response.ok){if(response.status===400||response.status===401||response.status===403)return json({error:"The Gemini connection could not be authorized or configured. Ask the site owner to check the server key, project access, and model settings."},502);if(response.status===404)return json({error:"The selected Gemini model is not available. Ask the site owner to check the model setting."},502);if(response.status===429)return json({error:"Gemini’s free usage limit has been reached. Please try again later, or use fewer ideas. No automatic paid fallback is used."},429);return json({error:"Gemini could not complete the request. Please try again."},502);}
  const result=await response.json() as {candidates?:{finishReason?:string;content?:{parts?:{text?:string;thought?:boolean}[]}}[];promptFeedback?:{blockReason?:string}};
  const candidate=result.candidates?.[0];
  if(result.promptFeedback?.blockReason||candidate?.finishReason==="SAFETY")return json({error:"Gemini could not process this input because of its content restrictions. Review the ideas and try again."},422);
  if(candidate?.finishReason!=="STOP")return json({error:"The AI response was incomplete. Try fewer ideas or try again."},502);
  const output=candidate.content?.parts?.filter(p=>!p.thought).map(p=>p.text||"").join("");
  try{const parsed=JSON.parse(output||"");stage(3);const board=validateResult(parsed,input.ideas,input.count,true);stage(4);return json(board);}catch{return json({error:"The AI returned an incomplete or inconsistent grouping. No ideas were changed. Please try again."},502);}
 }catch(e){return json({error:e instanceof Error&&(e.name==="TimeoutError"||e.name==="AbortError")?"The AI took too long. Try a smaller list or try again.":"We couldn’t reach the AI service. Please try again."},502);}
 }
 if(!request.headers.get("Accept")?.includes("application/x-ndjson"))return run();
 const encoder=new TextEncoder();let closed=false;
 const stream=new ReadableStream<Uint8Array>({async start(controller){
  const emit=(event:unknown)=>{if(!closed)controller.enqueue(encoder.encode(JSON.stringify(event)+"\n"));};
  try{const response=await run(value=>emit({type:"stage",stage:value}),()=>emit({type:"retry"}));const data=await response.json() as {error?:string};emit(response.ok?{type:"result",board:data}:{type:"error",error:data.error});}catch{if(!closed)emit({type:"error",error:"The connection ended before your board was ready. Please try again."});}finally{if(!closed){closed=true;controller.close();}}
 },cancel(){closed=true;}});
 return new Response(stream,{headers:{"Content-Type":"application/x-ndjson; charset=utf-8","Cache-Control":"no-store, no-transform","X-Content-Type-Options":"nosniff"}});
}

