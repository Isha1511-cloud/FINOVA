// Converts raw backend/network failures into friendly FINOVA messages (never show "401 Unauthorized").
const M={invalid:'Unable to sign you in. Please check your email and password.',locked:'Your account is temporarily locked. Please contact FINOVA support.',notfound:'We could not find an account with those details.',otp:'That code is not correct. Please try again.',expired:'This code has expired. Request a new one.',session:'Your session has expired. Please log in again.',server:'Something went wrong on our side. Please try again shortly.',network:'Unable to reach FINOVA. Check your connection and try again.'};
export const friendly=(e,ctx)=>{const s=e?.status,m=(e?.message||'').toLowerCase();
 if(e instanceof TypeError||/failed to fetch|network/.test(m))return M.network;
 if(s===429)return 'Too many attempts. Please wait a few minutes and try again.';if(s===409)return 'An account with this email already exists. Try logging in instead.';if(s===423||/lock/.test(m))return M.locked;if(/expired/.test(m))return ctx==='otp'?M.expired:M.session;
 if(s===404||/not found/.test(m))return M.notfound;if(s>=500)return M.server;
 if(ctx==='otp')return M.otp;if(s===401||s===400||s===403||/invalid|incorrect|password/.test(m))return M.invalid;return M.server};
