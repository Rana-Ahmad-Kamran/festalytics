"use client";
import React from 'react';
import { motion } from 'framer-motion';

const ChatThread = () => {
    return (
        <section className="flex-1 flex flex-col bg-white rounded-3xl shadow-xl border border-outline-variant overflow-hidden">
            {/* Thread Header */}
            <div className="p-6 px-8 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest/50 backdrop-blur-md">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <img 
                            alt="Elena Rodriguez" 
                            className="w-12 h-12 rounded-[1.25rem] object-cover border-2 border-primary-fixed shadow-md" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFdz_oSA5LZonKlRaClGIoa1S-SzdTbvein1vx9WxzJdH5H841ioy3qszdLd7JhNEKP6J5ZfG3WHoeBrEMWzKOPw1gscfRMQx3M4600QkXWEdlHCcufXYzD4m6NkdGpdEh1YDkF-28HWazUWiej3W0wqPhTLlgesfCeIovfy0I5MJo0eQoEnk_kROVOySUOuSD5X2V53cSF_esRbPm52QyLm_jIksgKiRIffiKPLaozIXRF6KbpiQYbUxulnla3ithYk26zOrJqRs"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div>
                        <h3 className="font-black text-on-surface leading-tight text-lg tracking-tight">Elena Rodriguez</h3>
                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.1em] mt-1">Booking #BK-9821 Discussion</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {['archive', 'delete', 'more_vert'].map((icon) => (
                        <button key={icon} className="p-3 text-outline hover:text-primary hover:bg-primary-fixed rounded-full transition-all">
                            <span className="material-symbols-outlined text-xl">{icon}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Message List */}
            <div className="flex-1 flex flex-col overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
                {/* Message (Customer) */}
                <div className="flex gap-5 max-w-[85%]">
                    <img 
                        alt="Elena" 
                        className="w-10 h-10 rounded-2xl object-cover flex-shrink-0 shadow-sm" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDY7AAAvpsU_scOH86Xjd3_RBfMPEyXZvA0aiyieQlDSOG1JR3o6_1mjzy5hVq7EVKTstKZcCwMIqKSUk2xdKTKB7AiV-YHklaVxOTgDmmpb0MZjcBjtUolWoHf0AACG3UvoBdeYE-jeU-stIazHXYqPG944H0CP9YDTWdf2PejF7WAnhDPHUgUelD9ubgsTzTU6d-PnQZYRdb_ERmXEwsOD_kz4l1Y8Qnf7q_H6nzbd6kMJgCZqKgO8Nys3eiZIBviuUu8hO1tc8Y"
                    />
                    <div className="space-y-2">
                        <div className="bg-secondary-container text-on-secondary-container px-6 py-4 rounded-[2rem] rounded-tl-none shadow-sm border border-secondary/10">
                            <p className="text-sm font-medium leading-relaxed">
                                Hi! Regarding my booking <a className="text-tertiary font-black underline decoration-2 underline-offset-2" href="#">#BK-9821</a>, could we adjust the floral arrangement to include more lilies? I saw some in your portfolio and they were stunning!
                            </p>
                        </div>
                        <p className="text-[9px] font-black text-outline uppercase tracking-widest ml-2">10:15 AM</p>
                    </div>
                </div>

                {/* System Message */}
                <div className="flex justify-center">
                    <div className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-tertiary/10 border border-tertiary/20">
                        Booking status changed to Confirmed
                    </div>
                </div>

                {/* Message (Vendor/Me) */}
                <div className="flex flex-row-reverse gap-5 max-w-[85%] ml-auto">
                    <div className="space-y-2 items-end flex flex-col">
                        <div className="bg-primary text-white px-6 py-4 rounded-[2rem] rounded-tr-none shadow-xl shadow-primary/20">
                            <p className="text-sm font-medium leading-relaxed">
                                Absolutely Elena! We can definitely swap the roses for white lilies. I've attached a draft of how that will look with the rest of your palette.
                            </p>
                        </div>
                        
                        {/* Attachment */}
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="mt-3 w-64 h-44 rounded-3xl overflow-hidden border-4 border-white shadow-2xl relative group cursor-zoom-in"
                        >
                            <img 
                                alt="Floral Preview" 
                                className="w-full h-full object-cover" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyNJTBKiIIlvJKPnvuInXZMwND0z8w5z-2GEOD-XIFguK_tZtHozVT5R_-W2ua2NI6nvfjLuo18ae77Os958D3_oAfSyIbVoaP-VIl65rJ3_ykdN8uYOK2KOgfD6e1JRWLrA1mlIJKUpJOaT0ZzhEhe3TkgtQENyu8iEiN7IWJMiopPQW13XVHHpgjVkc4Ovl6WGSUBg_B2zISw5EJM1kkxpuxitQy3hsOLXQzQZhRGGE3DtPFT4Dh38yh5UJzGHC6uUaHu89gvKs"
                            />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                <div className="bg-white/90 p-3 rounded-full text-primary shadow-lg">
                                    <span className="material-symbols-outlined fill-1">zoom_in</span>
                                </div>
                            </div>
                        </motion.div>
                        
                        <p className="text-[9px] font-black text-outline uppercase tracking-widest mr-2 text-right">10:42 AM</p>
                    </div>
                </div>
            </div>

            {/* Composer */}
            <div className="p-6 bg-white border-t border-outline-variant">
                <div className="bg-surface-container-low p-3 rounded-[2.5rem] border border-outline-variant/50 shadow-inner">
                    <div className="flex items-center gap-1 px-4 pb-2 border-b border-outline-variant/20 mb-2">
                        {['format_bold', 'format_italic', 'link', 'attach_file', 'mood'].map((icon) => (
                            <button key={icon} className="p-2 text-on-surface-variant hover:text-primary hover:bg-white rounded-xl transition-all">
                                <span className="material-symbols-outlined text-lg">{icon}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex items-end gap-4 px-4 py-2">
                        <textarea 
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium resize-none min-h-[44px] max-h-32 pt-2 scroll-smooth" 
                            placeholder="Type your message here..." 
                            rows="1"
                        ></textarea>
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0 mb-1"
                        >
                            <span className="material-symbols-outlined fill-1">send</span>
                        </motion.button>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-3 px-6">
                    <p className="text-[9px] font-black text-outline uppercase tracking-widest">Press Enter to send • Shift + Enter for new line</p>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant" />
                        <span className="text-[9px] font-black text-outline uppercase tracking-widest group-hover:text-primary transition-colors">Private Note</span>
                    </label>
                </div>
            </div>
        </section>
    );
};

export default ChatThread;
