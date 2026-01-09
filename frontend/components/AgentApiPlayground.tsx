
import React, { useState } from 'react';
import { apiService, ApiResponse } from '../services/apiService';

interface Props { apiKey: string; }

const AgentApiPlayground: React.FC<Props> = ({ apiKey }) => {
  const [endpoint, setEndpoint] = useState<'search' | 'create' | 'status' | 'ticket'>('search');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const defaultPayloads = {
    search: { from: 'SAH', to: 'DXB', date: '2023-12-25', isRoundTrip: false },
    create: { 
      flightId: 'fl-123', 
      traveler: { fullName: 'Ali Mansour', passportNumber: 'Y998877', nationality: 'Yemeni', expiryDate: '2028-10-10' },
      contact: { whatsapp: '+967771234567' },
      visaRequested: true
    },
    status: { bookingId: 'xyz123' },
    ticket: { bookingId: 'xyz123' }
  };

  const handleRun = async () => {
    setIsLoading(true);
    setResponse(null);
    let res: ApiResponse;

    try {
      const payload = requestBody ? JSON.parse(requestBody) : defaultPayloads[endpoint];
      
      if (endpoint === 'search') res = await apiService.searchFlights(apiKey, payload);
      else if (endpoint === 'create') res = await apiService.createBooking(apiKey, payload);
      else if (endpoint === 'status') res = await apiService.getBookingStatus(apiKey, payload.bookingId);
      else res = await apiService.downloadTicket(apiKey, payload.bookingId);

      setResponse(res);
    } catch (err: any) {
      setResponse({ status: 'error', message: 'خطأ في تنسيق الـ JSON المرسل', timestamp: new Date().toISOString() });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
      {/* Request Section */}
      <div className="bg-white p-10 rounded-[3rem] shadow-massive border-4 border-white">
        <h4 className="text-xl font-black text-[#002147] mb-8 flex items-center gap-4">
           <span className="p-3 bg-indigo-50 rounded-2xl text-xl">🔌</span>
           محاكي الطلبات (API Playground)
        </h4>

        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">نقطة النهاية (Endpoint)</label>
              <select 
                value={endpoint} 
                onChange={(e: any) => { setEndpoint(e.target.value); setRequestBody(JSON.stringify(defaultPayloads[e.target.value as keyof typeof defaultPayloads], null, 2)); }}
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-xs border-2 border-transparent focus:border-[#C5A059]"
              >
                 <option value="search">POST /api/v1/flights/search</option>
                 <option value="create">POST /api/v1/bookings</option>
                 <option value="status">GET /api/v1/bookings/{"{id}"}</option>
                 <option value="ticket">GET /api/v1/bookings/{"{id}"}/ticket</option>
              </select>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">جسم الطلب (JSON Body)</label>
              <textarea 
                value={requestBody || JSON.stringify(defaultPayloads[endpoint], null, 2)}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-64 p-6 bg-[#1E1E1E] text-emerald-400 font-mono text-xs rounded-3xl outline-none shadow-inner custom-scrollbar"
              />
           </div>

           <button 
             onClick={handleRun}
             disabled={isLoading}
             className="w-full bg-[#002147] text-[#C5A059] py-5 rounded-2xl font-black shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-4"
           >
              {isLoading ? <div className="loader-dots scale-50"><div></div><div></div><div></div></div> : 'إرسال الطلب (Send Request) 🚀'}
           </button>
        </div>
      </div>

      {/* Response Section */}
      <div className="bg-[#1A1A1A] p-10 rounded-[3rem] shadow-massive border-4 border-[#2A2A2A] flex flex-col h-[700px]">
         <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-black text-white">الاستجابة (Response)</h4>
            {response && (
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${response.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                 {response.status === 'success' ? '200 OK' : '400 Bad Request'}
              </span>
            )}
         </div>

         <div className="flex-1 bg-black/40 rounded-[2rem] p-8 overflow-y-auto custom-scrollbar shadow-inner border border-white/5">
            {response ? (
              <pre className="text-indigo-300 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                 {JSON.stringify(response, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                 <span className="text-6xl mb-4">📥</span>
                 <p className="text-white font-black">بانتظار الطلب...</p>
              </div>
            )}
         </div>

         <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">تلميحات تقنية:</p>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">• جميع الطلبات يجب أن تتضمن Header: <code className="text-[#C5A059]">X-API-KEY</code>.<br/>• يتم الخصم من الرصيد فور نجاح طلب الـ Create Booking.</p>
         </div>
      </div>
    </div>
  );
};

export default AgentApiPlayground;
