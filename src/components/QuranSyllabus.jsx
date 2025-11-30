import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSupabaseData } from '../hooks/useSupabaseData';

const QURAN_SYLLABUS = {
    iqra: { title: 'Tahap 1: Iqra 1-6', items: ['Iqra 1', 'Iqra 2', 'Iqra 3', 'Iqra 4', 'Iqra 5', 'Iqra 6'] },
    tahap2: {
        title: 'Tahap 2: Hafalan Al-Dhuha - Al-Nas', items: [
            'Al-Dhuha', 'Al-Insyirah', 'At-Tin', 'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah',
            'Az-Zalzalah', 'Al-Adiyat', 'Al-Qariah', 'At-Takathur', 'Al-Asr',
            'Al-Humazah', 'Al-Fil', 'Quraish', 'Al-Maun', 'Al-Kauthar',
            'Al-Kafirun', 'An-Nasr', 'Al-Lahab', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
        ]
    },
    tahap3: {
        title: 'Tahap 3: Hafalan Al-Naba - Al-Lail', items: [
            'Al-Naba', 'An-Naziat', 'Abasa', 'At-Takwir', 'Al-Infitar',
            'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj', 'At-Tariq', 'Al-A\'la',
            'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad', 'Ash-Shams', 'Al-Lail'
        ]
    },
    tahap4: {
        title: 'Tahap 4: Surah Pilihan', items: [
            'Al-Mulk', 'Al-Sajdah', 'Al-Insan', 'Al-Waqiah', 'Yasin', 'Al-Dukhan'
        ]
    },
    tahap5: { title: 'Tahap 5: Hafalan Juz 1-30', items: Array.from({ length: 30 }, (_, i) => `Juzuk ${i + 1}`) }
};

export default function QuranSyllabus({ childId }) {
    const [expandedSection, setExpandedSection] = useState(null);
    const [completedMilestones, setCompletedMilestones] = useState({});
    const navigate = useNavigate();
    const { fetchLogs } = useSupabaseData();

    useEffect(() => {
        loadAllProgress();
    }, [childId]);

    const loadAllProgress = async () => {
        // Fetch ALL logs for this child's Quran syllabus
        const logs = await fetchLogs('quran-syllabus', null, childId);

        const statusMap = {};
        logs.forEach(log => {
            // Case insensitive check for 'SELESAI'
            if (log.page && log.page.toUpperCase() === 'SELESAI') {
                statusMap[log.milestone_name] = true;
            }
        });
        setCompletedMilestones(statusMap);
    };

    return (
        <div className="space-y-4">
            {Object.entries(QURAN_SYLLABUS).map(([key, section]) => (
                <div
                    key={key}
                    className={cn(
                        "overflow-hidden rounded-2xl border transition-all duration-200",
                        expandedSection === key
                            ? "bg-white border-emerald-200 shadow-lg shadow-emerald-50 ring-1 ring-emerald-100"
                            : "bg-white border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md"
                    )}
                >
                    <button
                        onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors"
                    >
                        <span className={cn(
                            "font-bold text-base",
                            expandedSection === key ? "text-emerald-700" : "text-slate-700"
                        )}>
                            {section.title}
                        </span>
                        <div className={cn(
                            "p-2 rounded-full transition-all duration-200",
                            expandedSection === key ? "bg-emerald-100 text-emerald-600 rotate-180" : "bg-slate-50 text-slate-400"
                        )}>
                            <ChevronDown className="h-5 w-5" />
                        </div>
                    </button>

                    {expandedSection === key && (
                        <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 gap-3 pt-2">
                                {section.items.map((item) => {
                                    const isCompleted = completedMilestones[item];
                                    return (
                                        <div
                                            key={item}
                                            onClick={() => navigate(`/child/${childId}/subject/quran-syllabus/milestone/${encodeURIComponent(item)}`)}
                                            className={cn(
                                                "cursor-pointer rounded-xl border transition-all duration-200 group",
                                                isCompleted
                                                    ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                                                    : "bg-white border-slate-100 hover:border-emerald-100 hover:shadow-sm hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between p-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "text-sm font-semibold block",
                                                        isCompleted ? "text-emerald-800" : "text-slate-700"
                                                    )}>
                                                        {item}
                                                    </span>
                                                    {isCompleted && (
                                                        <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 shadow-sm">
                                                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                                            <span className="text-xs font-bold text-emerald-700">Selesai</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-1 text-slate-300 group-hover:text-emerald-600 transition-colors">
                                                    <ChevronRight className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
