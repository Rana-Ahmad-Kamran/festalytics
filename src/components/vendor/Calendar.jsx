"use client";
import React from 'react';
import { motion } from 'framer-motion';

const Calendar = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const dates = [
        { d: 28, muted: true }, { d: 29, muted: true }, { d: 30, muted: true },
        { d: 1 }, { d: 2 }, { d: 3 }, { d: 4 },
        { d: 5, bold: true }, { d: 6 }, { d: 7 }, { d: 8 }, { d: 9 },
        { d: 10, type: 'error' }, { d: 11 },
        { d: 12, type: 'secondary' }, { d: 13 }, { d: 14 },
        { d: 15, type: 'primary' }, { d: 16 }, { d: 17 }, { d: 18 }, { d: 19 },
        { d: 20, type: 'secondary' }, { d: 21 },
        { d: 22, type: 'tertiary' }, { d: 23 }, { d: 24, bold: true }, { d: 25, bold: true }
    ];

    const getDayStyle = (date) => {
        if (date.muted) return "text-outline-variant";
        if (date.type === 'primary') return "bg-primary text-white font-black shadow-lg shadow-primary/30 scale-110";
        if (date.type === 'error') return "bg-error text-white font-black shadow-lg shadow-error/20";
        if (date.type === 'secondary') return "bg-secondary-container text-on-secondary-container font-black";
        if (date.type === 'tertiary') return "bg-tertiary-fixed text-on-tertiary-fixed-variant font-black";
        return "hover:bg-primary-fixed cursor-pointer" + (date.bold ? " font-bold" : "");
    };

    return (
        <div className="card-level-1 rounded-3xl p-6 flex flex-col bg-white">
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-black tracking-tight">Calendar</h4>
                <div className="flex gap-2">
                    <span className="material-symbols-outlined cursor-pointer hover:bg-primary-fixed rounded-full p-2 transition-all">chevron_left</span>
                    <span className="material-symbols-outlined cursor-pointer hover:bg-primary-fixed rounded-full p-2 transition-all">chevron_right</span>
                </div>
            </div>
            <p className="text-sm font-black text-center mb-6 uppercase tracking-widest text-primary">MAY 2024</p>
            <div className="grid grid-cols-7 text-center gap-y-3 mb-8">
                {days.map((day, idx) => (
                    <span key={idx} className="text-[11px] font-black text-on-surface-variant uppercase">{day}</span>
                ))}
                {dates.map((date, idx) => (
                    <div key={idx} className="flex items-center justify-center p-1">
                        <motion.span 
                            whileHover={!date.muted ? { scale: 1.1 } : {}}
                            className={`text-xs w-8 h-8 flex items-center justify-center rounded-full transition-all ${getDayStyle(date)}`}
                        >
                            {date.d}
                        </motion.span>
                    </div>
                ))}
            </div>
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-auto w-full py-3.5 border-2 border-primary text-primary font-black rounded-full hover:bg-primary hover:text-white transition-all shadow-md uppercase tracking-widest text-[11px]"
            >
                Open Full Calendar
            </motion.button>
        </div>
    );
};

export default Calendar;
