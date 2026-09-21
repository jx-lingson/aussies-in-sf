import {getChatGPTUser} from '../chatgpt-auth';
import {database} from './helpers';
const cookieName='aussies_profile';
export const newToken=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
export const validToken=(s:unknown):s is string=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
export async function digest(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('')}
export function tokenFrom(r:Request){const value=r.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);return validToken(value)?value:null}
export function ownerCookie(r:Request,token:string){return `${cookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${new URL(r.url).protocol==='https:'?'; Secure':''}`}
export async function ownedProfile(r:Request){const token=tokenFrom(r);const db=database();if(token){const p=await db.prepare('SELECT * FROM profiles WHERE owner_key = ?').bind(await digest(token)).first<any>();if(p)return {profile:p,token}}
 // Preserve ownership of existing entries during the transition; no sign-in is required for new entries.
 const legacy=await getChatGPTUser();if(legacy){const p=await db.prepare('SELECT * FROM profiles WHERE id = ? AND owner_key IS NULL').bind(legacy.userId).first<any>();if(p)return {profile:p,token:null}}return null}
export function publicProfile(p:any){return {id:p.id,name:p.name,title:p.title,email:p.email,linkedin:p.linkedin,area:['Inner Richmond','Outer Richmond'].includes(p.area)?'Richmond':p.area,status:p.status,arrival:p.arrival,departure:p.departure,photoUrl:p.photo_key?`/api/photos/${p.photo_key}`:null}}
export const todayInSF=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
