"use client";
import React from 'react';
import { motion } from 'framer-motion';

const BookingRow = ({ booking, idx }) => {
    const statusStyles = {
        'Pending': 'bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary/20',
        'Confirmed': 'bg-green-100 text-green-700 border-green-200',
        'Completed': 'bg-surface-variant text-on-surface-variant border-outline-variant',
        'Cancelled': 'bg-error-container text-on-error-container border-error/20',
    };

    return (
        <motion.tr 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`hover:bg-primary-fixed/10 transition-colors group cursor-pointer ${booking.status === 'Cancelled' ? 'opacity-70' : ''}`}
        >
            <td className="p-5">
                <input type="checkbox" className="w-5 h-5 rounded-lg text-primary focus:ring-primary border-outline-variant cursor-pointer" />
            </td>
            <td className="p-5 font-black text-primary text-sm tracking-wider">{booking.id}</td>
            <td className="p-5">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {booking.customer.avatar ? (
                            <img 
                                src={booking.customer.avatar} 
                                alt={booking.customer.name}
                                className="w-12 h-12 rounded-2xl object-cover border-2 border-primary-fixed shadow-sm"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center font-black text-lg">
                                {booking.customer.name.split(' ').map(n => n[0]).join('')}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <p className="font-black text-on-surface leading-tight">{booking.customer.name}</p>
                        <p className="text-xs text-on-surface-variant font-medium mt-1">{booking.customer.email}</p>
                    </div>
                </div>
            </td>
            <td className="p-5">
                <span className="text-[10px] font-black bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full uppercase tracking-widest border border-secondary/10">
                    {booking.service}
                </span>
            </td>
            <td className="p-5 text-center">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Booked: {booking.bookedDate}</span>
                    <span className={`text-sm font-black text-on-surface ${booking.status === 'Cancelled' ? 'line-through text-error' : ''}`}>
                        {booking.eventDate}
                    </span>
                </div>
            </td>
            <td className="p-5 text-center">
                <span className={`${statusStyles[booking.status]} px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm`}>
                    {booking.status}
                </span>
            </td>
            <td className="p-5 text-right font-black text-on-surface text-lg tracking-tight">
                ${booking.amount.toLocaleString()}
            </td>
            <td className="p-5 text-right">
                <button className="material-symbols-outlined text-outline group-hover:text-primary transition-all p-2 hover:bg-white rounded-full">
                    more_vert
                </button>
            </td>
        </motion.tr>
    );
};

const BookingTable = () => {
    const bookings = [
        { 
            id: '#BK-9821', 
            customer: { name: 'Elena Rodriguez', email: 'elena.r@email.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3nJZ87eTfTn0xGvVPaSBmxoK_bKNjw0lxJNe5-1UWwXqIwGVnroC5Kw8CHtDR1u4qYbctnLrlF-X9MiuHCHMCyESsRpJNRdCP6WXEfOrfiWrx6j_aQu1yUU-2xtsJgjvoLolXADAcnM-hLxTRFt5SKFZG90C6eQ9ivNOK1NtNAjmgxtDUXD1MB8OUjtF6h3H6TZMkW99ldlYJk1prHzUqS8bm5PhE6O_KLgWOeTg3CP3kBzSao4V-cyOB7vtXZ69UjoGe3fc7Lc' },
            service: 'Wedding Photography',
            bookedDate: 'Oct 12',
            eventDate: 'Dec 24, 2024',
            status: 'Pending',
            amount: 2450.00
        },
        { 
            id: '#BK-9818', 
            customer: { name: 'Marcus Chen', email: 'm.chen@service.io', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGc2J-sK-BvFCADAZQGVMhf10TyYi6DhD6Yc1atlF1lmKS4EVjSeFJQJMk7I8qhvjZZA6vPQW47J-e6c0K8w-odx25J7CiSl4He_ZSmWSa_xc06cIdJkVU_SRZH5gNH_OUoIUDAM4xxPCCcbVtbWBkmQOSjltWd71pfaOpr8qACJoiVZuJU5eg0_ClQVCIDr7ivBuSLAB3bpadqC1xFqw3iK2m8yCwE9Fsqmoh3ks6dJfuA3nFEiew7CebUxiEeLHTRbP3O81w15w' },
            service: 'DJ & Sound Setup',
            bookedDate: 'Oct 10',
            eventDate: 'Nov 15, 2024',
            status: 'Confirmed',
            amount: 850.00
        },
        { 
            id: '#BK-9805', 
            customer: { name: 'Alice Schmidt', email: 'alice.s@web.de', avatar: null },
            service: 'Gourmet Catering',
            bookedDate: 'Sep 28',
            eventDate: 'Oct 05, 2024',
            status: 'Completed',
            amount: 4120.00
        },
        { 
            id: '#BK-9799', 
            customer: { name: 'Sarah Jenkins', email: 'sj@creative.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOBNKAVUgGlmlpLaSe4La2haaY28ZkjpdB0Xr2QkyoaxZkKWyIzXACSoNVfc46vy5j96WS492SHloM74jBZLJAj8nqy7Fphv0-Ov32kHbtN84BsbivAZTCMafgg9Re4l88AfEQPNvirnDjT8LUGSBgex-JPr_BuL0guWwOEVnqYZTiYTNIRbtB8Fqq3va4tN2BCYD2ViEeWJRXk9kibczN1xkMG8p4YFCu_Y6_nNVUj7bAnhYSfJWSKRR1vuiH8jqEcQqvzv1myXc' },
            service: 'Live Band',
            bookedDate: 'Sep 15',
            eventDate: 'Oct 20, 2024',
            status: 'Cancelled',
            amount: 1200.00
        }
    ];

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-outline-variant">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-variant/30 border-b border-outline-variant">
                        <tr>
                            <th className="p-6 w-16"><input type="checkbox" className="w-5 h-5 rounded-lg text-primary focus:ring-primary border-outline-variant" /></th>
                            <th className="p-6 text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em]">Booking ID</th>
                            <th className="p-6 text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em]">Customer</th>
                            <th className="p-6 text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em]">Service</th>
                            <th className="p-6 text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] text-center">Event Dates</th>
                            <th className="p-6 text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] text-center">Status</th>
                            <th className="p-6 text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] text-right">Amount</th>
                            <th className="p-6 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                        {bookings.map((booking, idx) => (
                            <BookingRow key={booking.id} booking={booking} idx={idx} />
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Footer */}
            <div className="p-8 bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest">
                    Showing <span className="text-primary">1-20</span> of 147 bookings
                </p>
                <div className="flex items-center gap-3">
                    <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-outline hover:bg-white hover:text-primary transition-all border border-transparent hover:border-outline-variant active:scale-90">
                        <span className="material-symbols-outlined">first_page</span>
                    </button>
                    <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-outline hover:bg-white hover:text-primary transition-all border border-transparent hover:border-outline-variant active:scale-90">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    
                    <div className="flex items-center mx-2 gap-2">
                        <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary text-on-primary font-black shadow-lg shadow-primary/30 active:scale-90">1</button>
                        <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-on-surface hover:bg-white font-black transition-all border border-transparent hover:border-outline-variant active:scale-90">2</button>
                        <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-on-surface hover:bg-white font-black transition-all border border-transparent hover:border-outline-variant active:scale-90">3</button>
                        <span className="text-outline px-2 font-black">...</span>
                        <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-on-surface hover:bg-white font-black transition-all border border-transparent hover:border-outline-variant active:scale-90">8</button>
                    </div>

                    <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-outline hover:bg-white hover:text-primary transition-all border border-transparent hover:border-outline-variant active:scale-90">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                    <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-outline hover:bg-white hover:text-primary transition-all border border-transparent hover:border-outline-variant active:scale-90">
                        <span className="material-symbols-outlined">last_page</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingTable;
