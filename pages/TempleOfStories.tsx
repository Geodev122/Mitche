import * as React from 'react';
import { useData } from '../context/DataContext';
import { BookOpen, Zap, Wind, Users, Heart } from 'lucide-react';
import SymbolIcon from '../components/ui/SymbolIcon';
import { TapestryThread, TapestryThreadColor, TapestryThreadPattern } from '../types';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../design-system/Button';

// A component to render the pattern visually
const PatternVisual: React.FC<{ pattern: TapestryThreadPattern }> = ({ pattern }: { pattern: TapestryThreadPattern }) => {
    const commonClasses = "absolute inset-0 opacity-5";
    if (pattern === TapestryThreadPattern.Spirals) {
        return <div className={`${commonClasses} bg-[radial-gradient(#3A3A3A_1px,transparent_1px)] [background-size:20px_20px]`}></div>;
    }
    if (pattern === TapestryThreadPattern.Lines) {
        return <div className={`${commonClasses} bg-transparent bg-[linear-gradient(45deg,#EAE2D6_25%,transparent_25.5%,transparent_74.5%,#EAE2D6_75%),linear-gradient(45deg,#EAE2D6_25%,transparent_25.5%,transparent_74.5%,#EAE2D6_75%)] bg-repeat [background-position:0_0,10px_10px] [background-size:20px_20px]`}></div>;
    }
     if (pattern === TapestryThreadPattern.Waves) {
        return <div className={`${commonClasses} opacity-10 bg-[url('data:image/svg+xml,%3Csvg%20width%3D"40"%20height%3D"40"%20viewBox%3D"0%200%2040%2040"%20xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg"%3E%3Cpath%20d%3D"M0%2020%20C%2010%2010%2030%2010%2040%2020%20C%2030%2030%2010%2030%200%2020%20Z"%20stroke%3D"%233A3A3A"%20fill%3D"transparent"%20stroke-width%3D"1"%2F%3E%3C%2Fsvg%3E')]`}></div>;
    }
    return null;
}

const colorMap: { [key in TapestryThreadColor]: { border: string, text: string, bg: string, glow: string } } = {
    [TapestryThreadColor.Gold]: { border: 'border-yellow-400', text: 'text-yellow-600', bg: 'bg-yellow-50', glow: 'rgba(251, 191, 36,' },
    [TapestryThreadColor.Blue]: { border: 'border-sky-400', text: 'text-sky-600', bg: 'bg-sky-50', glow: 'rgba(56, 189, 248,' },
    [TapestryThreadColor.Amber]: { border: 'border-amber-400', text: 'text-amber-600', bg: 'bg-amber-50', glow: 'rgba(245, 158, 11,' },
};


const ThreadCard: React.FC<{ thread: TapestryThread }> = ({ thread }: { thread: TapestryThread }) => {
    const { echoThread } = useData();
    const { t } = useTranslation();
    const [isPulsing, setIsPulsing] = React.useState(false);
    const colors = colorMap[thread.color as keyof typeof colorMap];

    const handleEcho = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        echoThread(thread.id);
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 800); // Match animation duration
    };

    // Glow effect based on echoes: becomes brighter as impact grows
    const glowOpacity = Math.min(thread.echoes / 50, 0.6);
    const glowRadius = 5 + Math.min(thread.echoes / 5, 15);
    const cardStyle = {
        boxShadow: `0 0 ${glowRadius}px ${colors.glow}${glowOpacity})`,
    };

    return (
        <Card
            className={`relative overflow-hidden border-2 transition-shadow duration-500 ${colors.border} ${isPulsing ? 'animate-pulse-glow' : ''}`}
            style={cardStyle}
        >
            <PatternVisual pattern={thread.pattern} />
            <div className="relative z-10 p-4">
                <div className="flex items-center mb-4">
                    {thread.isAnonymous ? (
                         <div className={`w-14 h-14 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <SymbolIcon name={thread.honoreeSymbolicIcon} className={`w-8 h-8 ${colors.text}`} />
                         </div>
                        ) : (
                        <img src={thread.honoreePhotoUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${thread.honoreeRealName}`} alt={thread.honoreeRealName || ''} width={56} height={56} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                    )}
                   
                    <div className="mx-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            {thread.isAnonymous ? thread.honoreeSymbolicName : thread.honoreeRealName}
                        </h2>
                        <p className={`text-sm font-semibold ${colors.text}`}>{thread.color} {t('tapestry.thread')}</p>
                    </div>
                </div>
                
                <p className="text-gray-700 italic mb-4 leading-relaxed">"{thread.story}"</p>

                <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-3 mt-4">
                    <div className="flex items-center" title={t('tapestry.livesTouched')}>
                        <Zap className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1 text-blue-400" />
                        <span>{thread.rippleTag}</span>
                    </div>
                    <Button onClick={handleEcho} variant="ghost" size="sm" className="flex items-center hover:text-green-500 transition-colors active:scale-95" title="Echo this Story">
                        <Wind className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                        <span>{t('tapestry.echoStory', { count: thread.echoes })}</span>
                    </Button>
                </div>
            </div>
        </Card>
    );
}

const ThreadCardSkeleton: React.FC = () => (
    <Card className="relative overflow-hidden border-2 border-gray-200">
         <div className="relative z-10">
            <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full flex-shrink-0 bg-gray-200 animate-pulse" />
                <div className="mx-4 flex-grow space-y-2">
                    <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-4">
                <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    </Card>
);


const HopeTapestry: React.FC = () => {
    const { tapestryThreads, loading } = useData();
    const { t } = useTranslation();
    const [filter, setFilter] = React.useState<'All' | TapestryThreadColor>('All');

    const totalThreads = tapestryThreads.length;
    const totalEchoes = tapestryThreads.reduce((sum, t) => sum + t.echoes, 0);
    const totalRipples = tapestryThreads.reduce((sum, t) => sum + t.rippleTag, 0);

    const sortedThreads = [...tapestryThreads].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
    const location = useLocation();
    const highlightThreadId = (location.state as any)?.highlightThreadId as string | undefined;
    const refs = React.useRef<Record<string, HTMLDivElement | null>>({});

    React.useEffect(() => {
        if (!highlightThreadId) return;
        const el = refs.current[highlightThreadId];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-amber-300', 'transition-all', 'duration-300');
            setTimeout(() => el.classList.remove('ring-4', 'ring-amber-300'), 3000);
        }
    }, [highlightThreadId, tapestryThreads]);
    
    const filteredThreads = filter === 'All'
        ? sortedThreads
        : sortedThreads.filter(t => t.color === filter);

    return (
        <PageContainer>
            <PageHeader
                icon={<BookOpen size={28} />}
                title={t('tapestry.title')}
                subtitle={t('tapestry.subtitle')}
            />

            <Card className="my-6">
                <div className="grid grid-cols-3 divide-x divide-gray-200 text-center">
                    <div className="p-3">
                        <p className="text-2xl font-bold text-gray-800">{totalThreads}</p>
                        <p className="text-sm text-gray-500">{t('tapestry.totalThreads')}</p>
                    </div>
                    <div className="p-3">
                        <p className="text-2xl font-bold text-gray-800">{totalEchoes}</p>
                        <p className="text-sm text-gray-500 flex items-center justify-center gap-1"><Wind size={14} /> {t('tapestry.totalEchoes')}</p>
                    </div>
                    <div className="p-3">
                        <p className="text-2xl font-bold text-gray-800">{totalRipples}</p>
                        <p className="text-sm text-gray-500 flex items-center justify-center gap-1"><Zap size={14} /> {t('tapestry.totalRipples')}</p>
                    </div>
                </div>
            </Card>

            <div className="mb-4">
                <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto pb-2 -mx-4 px-4">
                    <FilterChip label={t('tapestry.allThreads')} value="All" currentFilter={filter} setFilter={setFilter} />
                    {Object.values(TapestryThreadColor).map(color => (
                        <FilterChip key={color} label={color} value={color} currentFilter={filter} setFilter={setFilter} />
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    <ThreadCardSkeleton />
                    <ThreadCardSkeleton />
                </div>
            ) : filteredThreads.length > 0 ? (
                <div className="space-y-4">
                    {filteredThreads.map(thread => (
                        <div key={thread.id} ref={el => { if(refs.current) refs.current[thread.id] = el; }}>
                            <ThreadCard thread={thread} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="font-semibold">{t('tapestry.emptyTitle')}</p>
                    <p className="text-sm">{t('tapestry.emptySubtitle')}</p>
                </div>
            )}
        </PageContainer>
    );
};

const FilterChip: React.FC<{ label: string; value: any; currentFilter: any; setFilter: (value: any) => void; }> = 
({ label, value, currentFilter, setFilter }) => (
  <button
    onClick={() => setFilter(value)}
    className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors whitespace-nowrap ${
      currentFilter === value
        ? 'bg-[#3A3A3A] text-white border-transparent'
        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
    }`}
  >
    {label}
  </button>
);

export default HopeTapestry;