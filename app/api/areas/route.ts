import {allAreas} from '../neighbourhoods';
export async function GET(){return Response.json({areas:await allAreas()},{headers:{'Cache-Control':'no-store'}})}
