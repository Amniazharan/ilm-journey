import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

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
    const [expandedSection, setExpandedSection] = useState('iqra');
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            {Object.entries(QURAN_SYLLABUS).map(([key, section]) => (
                <div key={key} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <button
                        onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                        className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left"
                    >
                        <span className="font-semibold text-gray-800">{section.title}</span>
                        {expandedSection === key ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                    </button>

                    {expandedSection === key && (
                        <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
                            {section.items.map((item) => {
                                return (
                                    <button
                                        key={item}
                                        onClick={() => navigate(`/child/${childId}/subject/quran-syllabus/milestone/${encodeURIComponent(item)}`)}
                                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 hover:bg-gray-50"
                                    >
                                        <span className="text-sm font-medium text-gray-700">{item}</span>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
