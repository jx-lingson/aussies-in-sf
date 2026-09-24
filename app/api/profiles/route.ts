import {directoryData} from '../directory';
import {digest,newToken,ownedProfile,ownerCookie,todayInSF} from '../ownership';
import {areas} from '../../shared';
import {database,photos,sameOrigin,fail} from '../helpers';
import {z} from 'zod';
export const dynamic='force-dynamic';
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s);
const schema=z.object({name:z.string().trim().min(2).max(80),title:z.string().trim().min(2).max(120),email:z.union([z.string().trim().email().max(254),z.literal('')]).default(''),linkedin:z.string().url().max(300).refine(s=>{const u=new URL(s);return u.protocol==='https:'&&['linkedin.com','www.linkedin.com'].includes(u.hostname)&&/^\/in\/[^/]+\/?$/.test(u.pathname)},'Use a LinkedIn profile URL'),area:z.string().refine(s=>areas.some(a=>a.name===s)),status:z.enum(['resident','visitor']),arrival:date.optional(),departure:date.optional(),consent:z.literal('yes'),australian:z.literal('yes')}).refine(p=>p.status!=='visitor'||(p.arrival&&p.departure&&p.arrival<=p.departure),'Enter a valid arrival and departure date');
export async function GET(r:Request){try{return Response.json(await directoryData(r),{headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}})}catch(e){console.error(e);return fail('The directory is temporarily unavailable.',503)}}
export async function POST(r:Request){
 if(!sameOrigin(r))return fail('Request origin rejected.',403);

 if(Number(r.headers.get('content-length'))>2300000)return fail('Photo is too large.',413);
 let key:string|null=null;
 try{
  const form=await r.formData();const parsed=schema.safeParse(Object.fromEntries(form));if(!parsed.success)return fail(parsed.error.issues[0].message);
  const owner=await ownedProfile(r);const photo=form.get('photo');const hasPhoto=photo instanceof File&&photo.size>0;if(!hasPhoto&&!owner?.profile.photo_key)return fail('Add a profile photo.');
  if(hasPhoto&&(photo.size>2*1024*1024||photo.type!=='image/jpeg'))return fail('Please choose a JPEG, PNG or WebP photo using the form.');
  const bytes=hasPhoto?new Uint8Array(await photo.arrayBuffer()):null;if(bytes&&(bytes[0]!==255||bytes[1]!==216||bytes[2]!==255))return fail('Invalid photo file.');
  const p=parsed.data,db=database(),bucket=photos(),id=owner?.profile.id||crypto.randomUUID(),token=owner?.token||newToken();
  const photoKey=bytes?crypto.randomUUID():owner!.profile.photo_key;
  if(bytes){key=photoKey;await bucket.put(photoKey,bytes,{httpMetadata:{contentType:'image/jpeg'}})}
  await db.prepare('INSERT INTO profiles (id,name,title,email,linkedin,area,status,arrival,departure,created_at,photo_key,owner_key) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,title=excluded.title,email=excluded.email,linkedin=excluded.linkedin,area=excluded.area,status=excluded.status,arrival=excluded.arrival,departure=excluded.departure,photo_key=excluded.photo_key,owner_key=excluded.owner_key').bind(id,p.name,p.title,p.email,p.linkedin,p.area,p.status,p.status==='visitor'?p.arrival:null,p.status==='visitor'?p.departure:null,Date.now(),photoKey,await digest(token)).run();
  key=null;if(bytes&&owner?.profile.photo_key)await bucket.delete(owner.profile.photo_key).catch(console.error);
  return Response.json({ok:true},{headers:{'Set-Cookie':ownerCookie(r,token),'Cache-Control':'no-store'}});
 }catch(e){if(key)await photos().delete(key).catch(console.error);console.error(e);return fail('Could not save. Your form is still here; please try again.',503)}
}
export async function DELETE(r:Request){if(!sameOrigin(r))return fail('Request origin rejected.',403);try{const owner=await ownedProfile(r);if(!owner)return fail('Use the browser where you created your profile to remove it.',401);await database().prepare('DELETE FROM profiles WHERE id = ?').bind(owner.profile.id).run();if(owner.profile.photo_key)await photos().delete(owner.profile.photo_key).catch(console.error);return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}})}catch{return fail('Could not remove your profile.',503)}}
