import {Database,FlaskConical} from 'lucide-react';import {isReal} from '../../services/config.js';
// Small pill that tells reviewers/users whether a module is reading live MongoDB data or demo data.
export const SourceBadge=({module})=>{const live=isReal(module);const Ic=live?Database:FlaskConical;
 return<span title={live?'Data is loaded from the FINOVA backend (MongoDB).':'Demo data. This module is not connected to the backend yet.'} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${live?'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300':'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'}`}><Ic className="h-3 w-3" aria-hidden="true"/>{live?'Live data':'Demo data'}</span>};
// Shown on modules that are still in demo mode while other modules are already connected.
export const DemoBanner=()=><p role="note" className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200"><FlaskConical className="mr-1 inline h-3.5 w-3.5" aria-hidden="true"/>Demo mode: this module still uses sample data and is not connected to the backend yet.</p>;
