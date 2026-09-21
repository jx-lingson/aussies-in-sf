import {getChatGPTUser} from '../../chatgpt-auth';
import {areas} from '../../shared';
import {database,photos,sameOrigin,fail} from '../helpers';
import {z} from 'zod';
export const dynamic='force-dynamic';
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s);
const schema=z.object({name:z.string().trim().min(2).max(80),title:z.string().trim().min(2).max(120),email:z.string().email().max(254),linkedin:z.string().url().max(300).refine(s=>{const u=new URL(s);return u.protocol==='https:'&&['linkedin.com','www.linkedin.com'].includes(u.hostname)&&/^\/in\/[^/]+\/?$/.test(u.pathname)},'Use a LinkedIn profile URL'),area:z.string().refine(s=>areas.some(a=>a.name===s)),status:z.enum(['resident','visitor']),arrival:date.optional(),departure:date.optional(),consent:z.literal('yes'),australian:z.literal('yes')}).refine(p=>p.status!=='visitor'||(p.arrival&&p.departure&&p.arrival<=p.departure),'Enter a valid arrival and departure date');
export async function GET(){try{const today=new Date().toISOString().slice(0,10);const data=await database().prepare("SELECT id,name,title,email,linkedin,photo_key,CASE WHEN area IN ('Inner Richmond','Outer Richmond') THEN 'Richmond' ELSE area END AS area,status,arrival,departure FROM profiles WHERE suspended_until <= ? AND (status = ? OR (arrival <= ? AND departure >= ?)) ORDER BY name").bind(Date.now(),'resident',today,today).all();return Response.json({profiles:data.results.map((p:any)=>{const {photo_key,...rest}=p;return {...rest,photoUrl:photo_key?`/api/photos/${encodeURIComponent(photo_key)}`:null}})},{headers:{'Cache-Control':'no-store'}})}catch(e){console.error(e);return fail('The directory is temporarily unavailable.',503)}}
export async function POST(r:Request){
 if(!sameOrigin(r))return fail('Request origin rejected.',403);
 const user=await getChatGPTUser();if(!user)return fail('Please sign in with ChatGPT before saving your profile.',401);
 if(Number(r.headers.get('content-length'))>2300000)return fail('Photo is too large.',413);
 let key:string|null=null;
 try{
  const form=await r.formData();const parsed=schema.safeParse(Object.fromEntries(form));if(!parsed.success)return fail(parsed.error.issues[0].message);
  const photo=form.get('photo');if(!(photo instanceof File)||photo.size===0)return fail('Add a profile photo.');
  if(photo.size>2*1024*1024||photo.type!=='image/jpeg')return fail('Please choose a JPEG, PNG or WebP photo using the form.');
  const bytes=new Uint8Array(await photo.arrayBuffer());if(bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)return fail('Invalid photo file.');
  const p=parsed.data,db=database(),bucket=photos();
  const previous=await db.prepare('SELECT photo_key FROM profiles WHERE id = ?').bind(user.userId).first<{photo_key:string|null}>();
  key=crypto.randomUUID();await bucket.put(key,bytes,{httpMetadata:{contentType:'image/jpeg'}});
  await db.prepare('INSERT INTO profiles (id,name,title,email,linkedin,area,status,arrival,departure,created_at,photo_key) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,title=excluded.title,email=excluded.email,linkedin=excluded.linkedin,area=excluded.area,status=excluded.status,arrival=excluded.arrival,departure=excluded.departure,photo_key=excluded.photo_key').bind(user.userId,p.name,p.title,p.email,p.linkedin,p.area,p.status,p.status==='visitor'?p.arrival:null,p.status==='visitor'?p.departure:null,Date.now(),key).run();
  key=null;if(previous?.photo_key)await bucket.delete(previous.photo_key).catch(console.error);
  return Response.json({ok:true});
 }catch(e){if(key)await photos().delete(key).catch(console.error);console.error(e);return fail('Could not save. Your form is still here; please try again.',503)}
}
export async function DELETE(r:Request){if(!sameOrigin(r))return fail('Request origin rejected.',403);const user=await getChatGPTUser();if(!user)return fail('Sign in to remove your profile.',401);try{const db=database();const previous=await db.prepare('SELECT photo_key FROM profiles WHERE id = ?').bind(user.userId).first<{photo_key:string|null}>();await db.prepare('DELETE FROM profiles WHERE id = ?').bind(user.userId).run();if(previous?.photo_key)await photos().delete(previous.photo_key).catch(console.error);return Response.json({ok:true})}catch{return fail('Could not remove your profile.',503)}}
