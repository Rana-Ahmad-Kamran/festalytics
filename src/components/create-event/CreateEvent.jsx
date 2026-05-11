import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

import DashboardHeader from '../DashboardHeader';
import Footer from '../Footer';
import EventStepper from './EventStepper';
import { INITIAL_TASKS } from './data';

// Import Steps
import BasicDetails from './steps/BasicDetails';
import VenueSelection from './steps/VenueSelection';
import Vendors from './steps/Vendors';

import Budget from './steps/Budget';
import Timeline from './steps/Timeline';
import Review from './steps/Review';

const CreateEvent = () => {
    const router = useRouter();
    const { id } = useParams();
    const [step, setStep] = useState(1);

    // Global Event State
    const [eventData, setEventData] = useState({
        eventType: '',
        title: '',
        date: '',
        time: '',
        guestCount: '',
        location: '',
        selectedVenueId: null,
        selectedVendorIds: [],
        tasks: INITIAL_TASKS
    });

    useEffect(() => {
        if (id) {
            const events = JSON.parse(localStorage.getItem('festalytics_events') || '[]');
            const existingEvent = events.find(e => e.id.toString() === id);
            if (existingEvent) {
                setEventData(existingEvent);
            }
        }
    }, [id]);

    const updateFormData = (field, value) => {
        setEventData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step === 6) {
            const events = JSON.parse(localStorage.getItem('festalytics_events') || '[]');

            if (id) {
                // Edit Mode
                const updatedEvents = events.map(ev =>
                    ev.id.toString() === id ? { ...eventData, id: ev.id } : ev
                );
                localStorage.setItem('festalytics_events', JSON.stringify(updatedEvents));
            } else {
                // Create Mode
                const newEvent = {
                    ...eventData,
                    id: Date.now(),
                    status: 'Active',
                    createdAt: new Date().toISOString()
                };
                localStorage.setItem('festalytics_events', JSON.stringify([...events, newEvent]));
            }
            router.push('/my-events');
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => setStep(prev => prev - 1);

    const TOTAL_STEPS = 7;

    // Step Logic
    const renderStep = () => {
        switch (step) {
            case 1:
                return <BasicDetails eventData={eventData} updateFormData={updateFormData} />;
            case 2:
                return <VenueSelection eventData={eventData} updateFormData={updateFormData} />;
            case 3:
                return <Vendors eventData={eventData} updateFormData={updateFormData} />;
            case 4:
                return <Budget eventData={eventData} />;
            case 5:
                return <Timeline eventData={eventData} updateFormData={updateFormData} />;
            case 6:
                return <Review eventData={eventData} onNext={handleNext} isEditing={!!id} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <DashboardHeader />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 relative overflow-hidden min-h-[700px] flex flex-col"
                >
                    {/* Stepper Progress */}
                    {step < 8 && <EventStepper currentStep={step} totalSteps={TOTAL_STEPS} />}

                    {/* Step Content */}
                    <div className="flex-1 flex flex-col">
                        {renderStep()}
                    </div>

                    {/* Footer Buttons */}
                    {step < 6 && (
                        <div className="flex justify-between items-center pt-6 mt-auto border-t border-gray-50">
                            {step > 1 ? (
                                <button onClick={handleBack} className="px-6 py-2 text-gray-500 hover:text-gray-700 font-semibold transition-colors">
                                    Back
                                </button>
                            ) : (
                                <div></div> // Spacer
                            )}

                            <button
                                onClick={handleNext}
                                disabled={step === 1 && !eventData.title}
                                className="px-8 py-3 bg-[#D6336C] text-white rounded-full font-bold shadow-lg shadow-pink-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
                            >
                                Next Step <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default CreateEvent;
