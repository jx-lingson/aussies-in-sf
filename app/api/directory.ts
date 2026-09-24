import {database} from './helpers';
import {ownedProfile,todayInSF,publicProfile} from './ownership';
export async function directoryData(r:Request){
 const owner=await ownedProfile(r),unlocked=!!owner&&owner.profile.suspended_until<=Date.now(),today=todayInSF();
 const rows=await database().prepare("SELECT * FROM profiles WHERE suspended_until <= ? AND (status='resident' OR (arrival<=? AND departure>=?)) ORDER BY created_at DESC,id DESC").bind(Date.now(),today,today).all<any>();
 const profiles=rows.results.map(publicProfile);
 const recent=profiles.slice(0,3);
 const counts:Record<string,{resident:number;visitor:number}>={};
 for(const p of profiles){counts[p.area]??={resident:0,visitor:0};if(p.status==='resident')counts[p.area].resident++;else counts[p.area].visitor++;}
 return {unlocked,profiles:unlocked?profiles:recent,recentIds:recent.map(p=>p.id),counts};
}
