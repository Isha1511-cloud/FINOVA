import {Send,ArrowDownToLine,ArrowUpFromLine,UserPlus,FileText,Zap} from 'lucide-react';
// Legacy quick-action list (previously exported from Dashboard.jsx). Kept so existing imports keep working.
export const QUICK=[['Transfer Money',Send,'/transfer'],['Deposit',ArrowDownToLine,'/deposit'],['Withdraw',ArrowUpFromLine,'/withdraw'],['Add Beneficiary',UserPlus,'/beneficiaries?add=1'],['View Statement',FileText,'/statements'],['Pay Bills',Zap,null]];
