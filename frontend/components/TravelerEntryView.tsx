
import React from 'react';
import PassengerDetailsPage from '../app/booking/passenger-details/page';
import { db } from '../services/mockDatabase';

interface Props {
  flight: any;
  onConfirm: () => void;
  onBack: () => void;
}

const TravelerEntryView: React.FC<Props> = ({ flight, onConfirm }) => {
  const handleNext = async (formData: any) => {
    try {
      // حفظ المسودة محلياً مع ربط بيانات الرحلة والمسافر
      const pendingBooking = {
        flightId: flight.id,
        ...formData,
        totalAmount: flight.prices.selling,
        flightSnapshot: {
          flightNumber: flight.flightNumber,
          departure: flight.departureAirport,
          arrival: flight.arrivalAirport,
          departureTime: flight.departureTime,
          airlineName: db.getAirlines().find(a => a.id === flight.airlineId)?.name,
          airlineLogo: db.getAirlines().find(a => a.id === flight.airlineId)?.logo,
        }
      };

      localStorage.setItem('pending_booking_data', JSON.stringify(pendingBooking));
      onConfirm(); // التوجه لصفحة الدفع
    } catch (e) {
      alert("عفواً، تعذر معالجة بيانات الحجز حالياً.");
    }
  };

  return (
    <div className="container mx-auto px-6 py-6 animate-in fade-in duration-700">
       <PassengerDetailsPage flight={flight} onNext={handleNext} />
    </div>
  );
};

export default TravelerEntryView;
