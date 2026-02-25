import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CalendarApp() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

    const renderDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty slots before the first day
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
        }

        // The actual days
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = isCurrentMonth && today.getDate() === i;
            days.push(
                <div key={i} className="w-10 h-10 flex flex-col justify-center items-center relative">
                    <button
                        data-clickable="true"
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-medium transition-colors hover:bg-black/10 data-[hovered=true]:bg-black/10 data-[pinched=true]:scale-90 ${isToday ? 'bg-red-500 text-white hover:bg-red-600 data-[hovered=true]:bg-red-600' : 'text-apple-dark'}`}
                    >
                        {i}
                    </button>
                    {/* Mock event dot for some days */}
                    {(i === 4 || i === 12 || i === 15 || i === 24) && !isToday && (
                        <div className="absolute bottom-[2px] w-1 h-1 rounded-full bg-gray-400" />
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="h-full w-full bg-[#f2f2f7] flex select-none pointer-events-auto overflow-hidden">
            {/* Sidebar (Mac style) */}
            <div className="w-[30%] h-full bg-[#e5e5ea]/80 border-r border-[#d1d1d6] flex flex-col py-6 px-4 shrink-0">
                <div
                    data-clickable="true"
                    className="flex justify-between items-center py-2 px-3 rounded-lg bg-blue-500 text-white shadow-sm data-[hovered=true]:bg-blue-600 transition-colors mb-4"
                >
                    <span className="font-semibold">{today.getDate()}</span>
                    <span className="text-sm">Today</span>
                </div>

                <div className="flex-1 overflow-y-auto mt-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Upcoming Events</h3>

                    <button data-clickable="true" className="w-full text-left py-2 px-2 rounded-md hover:bg-black/5 data-[hovered=true]:bg-black/5 transition-colors mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-2" />
                        <span className="text-sm font-medium text-apple-dark tracking-tight">Team Sync</span>
                        <div className="text-xs text-gray-500 ml-4 mt-0.5">10:00 AM - 11:30 AM</div>
                    </button>

                    <button data-clickable="true" className="w-full text-left py-2 px-2 rounded-md hover:bg-black/5 data-[hovered=true]:bg-black/5 transition-colors mb-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500 inline-block mr-2" />
                        <span className="text-sm font-medium text-apple-dark tracking-tight">Design Review</span>
                        <div className="text-xs text-gray-500 ml-4 mt-0.5">2:00 PM - 3:00 PM</div>
                    </button>

                    <button data-clickable="true" className="w-full text-left py-2 px-2 rounded-md hover:bg-black/5 data-[hovered=true]:bg-black/5 transition-colors mb-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500 inline-block mr-2" />
                        <span className="text-sm font-medium text-apple-dark tracking-tight">Dinner w/ Sarah</span>
                        <div className="text-xs text-gray-500 ml-4 mt-0.5">7:30 PM - 9:00 PM</div>
                    </button>
                </div>
            </div>

            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col items-center bg-white p-6 relative">

                {/* Header Navigation */}
                <div className="w-full max-w-sm flex items-center justify-between mb-6 px-2">
                    <h2 className="text-[26px] font-semibold tracking-tight text-apple-dark">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            data-clickable="true"
                            onClick={prevMonth}
                            className="p-1.5 rounded-md hover:bg-black/5 data-[hovered=true]:bg-black/5 data-[pinched=true]:translate-x-[-2px] transition-all"
                        >
                            <ChevronLeft size={20} className="text-apple-dark/70" />
                        </button>
                        <button
                            data-clickable="true"
                            onClick={nextMonth}
                            className="p-1.5 rounded-md hover:bg-black/5 data-[hovered=true]:bg-black/5 data-[pinched=true]:translate-x-[2px] transition-all"
                        >
                            <ChevronRight size={20} className="text-apple-dark/70" />
                        </button>
                    </div>
                </div>

                {/* Days of Week */}
                <div className="w-full max-w-sm grid grid-cols-7 gap-y-2 mb-2">
                    {daysOfWeek.map((day, idx) => (
                        <div key={idx} className="w-10 text-center text-xs font-semibold text-gray-400">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="w-full max-w-sm grid transform-gpu grid-cols-7 gap-y-2 place-items-center">
                    {renderDays()}
                </div>

            </div>
        </div>
    );
}
