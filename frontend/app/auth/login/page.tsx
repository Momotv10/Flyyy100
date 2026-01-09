
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Globe, Loader2, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface Props {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * محاكاة بروتوكول Google OAuth 2.0
   * يقوم بفتح نافذة منبثقة وهمية ثم الحصول على بيانات المستخدم
   */
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // 1. محاكاة زمن استجابة خوادم جوجل
      await new Promise(r => setTimeout(r, 1500));
      
      // 2. بيانات افتراضية قادمة من "جوجل"
      const googleIdentity = {
        username: 'traveler@gmail.com',
        pass: 'google_verified_token',
        name: 'مسافر جوجل (Google User)',
        role: 'CUSTOMER'
      };

      // 3. تسجيل الدخول في النظام
      await login({ 
        username: googleIdentity.username, 
        pass: googleIdentity.pass 
      });

      // 4. إطلاق حدث النجاح للتوجيه
      onLoginSuccess();
    } catch (err) {
      console.error("Google Auth Error:", err);
      alert("فشل الاتصال بخدمات Google. يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdentityLogin = async (role: 'SUPPLIER' | 'ADMIN') => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const mockCreds = {
        username: role.toLowerCase(),
        pass: 'verified_access'
      };
      await login(mockCreds);
      onLoginSuccess();
    } catch (err) {
      alert("تعذر الربط مع خوادم الهوية الرقمية.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001a4d] flex items-center justify-center p-6 font-tajawal relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-amber-500/20 rounded-full blur-[150px] animate-pulse"></div>
         <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[150px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[4rem] w-full max-w-xl shadow-massive overflow-hidden border-8 border-white/5 relative z-10"
      >
        <div className="bg-[#002366] p-16 text-center border-b-8 border-[#C5A059] relative">
          <motion.div 
            initial={{ y: 20 }} animate={{ y: 0 }}
            className="w-24 h-24 bg-gradient-to-br from-amber-400 to-[#C5A059] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform -rotate-6"
          >
             <ShieldCheck size={48} className="text-[#002366]" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">بوابة الدخول الموحد STAMS</h1>
          <p className="text-indigo-200 text-[10px] mt-2 uppercase tracking-[0.3em] font-bold opacity-70">Aero Intelligence Enterprise</p>
        </div>

        <div className="p-16 space-y-10">
           <div className="text-center">
              <h2 className="text-2xl font-black text-[#002366]">مرحباً بك في منظومة السفر الذكية</h2>
              <p className="text-slate-400 font-bold text-xs mt-2 leading-relaxed px-10">يرجى تسجيل الدخول ليتم توجيهك إلى لوحة التحكم المناسبة بناءً على صلاحيات حسابك.</p>
           </div>

           {/* زر الدخول عبر جوجل المحدث */}
           <button 
             onClick={handleGoogleLogin}
             disabled={isLoading}
             className="w-full p-8 rounded-3xl border-4 border-slate-50 hover:border-blue-600 flex items-center justify-between group transition-all bg-white shadow-xl hover:shadow-blue-500/10"
           >
             <div className="flex items-center gap-6">
                {isLoading ? <Loader2 className="animate-spin text-blue-600" /> : <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><Globe size={32} /></div>}
                <div className="text-right">
                   <p className="font-black text-slate-700 text-lg">الدخول عبر Google</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">إصدار فوري ومزامنة تلقائية</p>
                </div>
             </div>
             <ArrowRight className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-[-10px] transition-all" />
           </button>

           <div className="relative flex items-center py-4">
              <div className="flex-1 border-t-2 border-slate-100"></div>
              <span className="px-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">أو دخول الشركاء</span>
              <div className="flex-1 border-t-2 border-slate-100"></div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleIdentityLogin('SUPPLIER')}
                disabled={isLoading}
                className="p-8 bg-slate-50 rounded-3xl font-black text-[#002366] hover:bg-[#002366] hover:text-white transition-all text-xs flex flex-col items-center gap-3 border-2 border-transparent hover:border-[#C5A059] disabled:opacity-50"
              >
                 <Sparkles size={24} className="text-amber-500" /> وكيل / مزود
              </button>
              <button 
                onClick={() => handleIdentityLogin('ADMIN')}
                disabled={isLoading}
                className="p-8 bg-slate-50 rounded-3xl font-black text-[#002366] hover:bg-[#002366] hover:text-white transition-all text-xs flex flex-col items-center gap-3 border-2 border-transparent hover:border-[#C5A059] disabled:opacity-50"
              >
                 <Lock size={24} className="text-blue-500" /> مدير النظام
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
