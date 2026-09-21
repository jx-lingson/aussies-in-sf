import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw Error('Database unavailable');return env.DB;}
export function sameOrigin(r:Request){const origin=r.headers.get('origin');return !!origin&&origin===new URL(r.url).origin;}
export function fail(message:string,status=400){return Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}})}

export function photos(){if(!env.BUCKET)throw Error('Photo storage unavailable');return env.BUCKET;}
