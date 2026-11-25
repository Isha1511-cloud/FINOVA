import {Navigate,useLocation} from 'react-router-dom';import {useApp} from '../context/AppContext.jsx';
export default function ProtectedRoute({children}){const{user}=useApp();const l=useLocation();return user?children:<Navigate to="/login" state={{from:l.pathname}} replace/>}
