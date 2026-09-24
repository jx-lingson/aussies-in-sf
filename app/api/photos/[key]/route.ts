import {directoryData} from '../../directory';
import {ownedProfile,todayInSF} from '../../ownership';
import {database,photos} from '../../helpers';
export const dynamic='force-dynamic';
export async function GET(_request:Request,context:{params:Promise<{key:string}>}){
 try{const {key}=await context.params;if(!/^[a-f0-9-]{36}$/.test(key))return new Response(null,{status:404});
 const owner=await ownedProfile(_request);const data=await directoryData(_request);if(owner?.profile.photo_key!==key&&!data.profiles.some(p=>p.photoUrl===`/api/photos/${key}`))return new Response(null,{status:404});const file=await photos().get(key);if(!file)return new Response(null,{status:404});
 return new Response(file.body,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
 }catch{return new Response(null,{status:503})}
}
