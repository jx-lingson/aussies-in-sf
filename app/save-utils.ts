export function deadline<T>(task:Promise<T>,ms:number,message:string):Promise<T>{
 let timer:ReturnType<typeof setTimeout>;
 return Promise.race([task,new Promise<T>((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),ms)})]).finally(()=>clearTimeout(timer));
}
export async function requestJSON(url:string,init:RequestInit={},ms=20000):Promise<any>{
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),ms);
 try{const response=await fetch(url,{...init,signal:controller.signal});let data:any;try{data=await response.json()}catch{if(controller.signal.aborted)throw new Error('The connection timed out. Your details are still in the form.');throw new Error('The server returned an unexpected response. Please try again.')}if(!response.ok)throw new Error(data.error||'The request failed. Please try again.');return data}
 catch(error){if(controller.signal.aborted)throw new Error('The connection timed out. Your details are still in the form.');throw error}finally{clearTimeout(timer)}
}
