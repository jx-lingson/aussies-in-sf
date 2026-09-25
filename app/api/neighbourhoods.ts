import {areas,type Area} from '../shared';
import {database} from './helpers';
import {z} from 'zod';
const key=(s:string)=>s.trim().replace(/\s+/g,' ').toLowerCase();
export async function allAreas():Promise<Area[]>{const custom=await database().prepare('SELECT name,region,lat,lng FROM neighbourhoods ORDER BY name').all<Area>();return [...areas,...custom.results.filter(a=>!areas.some(b=>key(a.name)===key(b.name)))];}
const customSchema=z.object({customName:z.string().trim().min(2).max(60).regex(/^[\p{L}\p{M} .’'()-]+$/u,'Use a neighbourhood name, not an address'),customRegion:z.enum(['San Francisco','East Bay','Peninsula']),customLat:z.preprocess(v=>v===''?undefined:v,z.coerce.number().min(37.36).max(37.92)),customLng:z.preprocess(v=>v===''?undefined:v,z.coerce.number().min(-122.57).max(-122.08))});
export async function resolveArea(body:Record<string,unknown>){const list=await allAreas();if(body.area!=='__custom'){const found=list.find(a=>a.name===body.area);if(!found)throw Error('Choose a neighbourhood or add a new one.');return {name:found.name,statement:null};}
 const result=customSchema.safeParse(body);if(!result.success)throw Error(result.error.issues.some(i=>i.path[0]==='customLat'||i.path[0]==='customLng')?'Choose a neighbourhood centre within the Bay Area map.':result.error.issues[0].message);const p=result.data,name=p.customName.replace(/\s+/g,' '),existing=list.find(a=>key(a.name)===key(name));if(existing)return {name:existing.name,statement:null};
 const statement=database().prepare('INSERT OR IGNORE INTO neighbourhoods(key,name,region,lat,lng) VALUES(?,?,?,?,?)').bind(key(name),name,p.customRegion,Math.round(p.customLat*1000)/1000,Math.round(p.customLng*1000)/1000);
 return {name,statement};
}
