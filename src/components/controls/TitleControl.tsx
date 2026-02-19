import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLeafletControl } from '@/hooks/useLeafletControl.ts';
import { useMapContext } from '@/context/MapContext.tsx';
import { SOURCES } from '@/utils/constants.ts';
import { BookOpenText,  ChevronsDown, ChevronsUp, MapPinned } from 'lucide-react';

/**
 * Displays the map title, disclaimer, legend, and a collapsible list of academic sources.
 */
export function TitleControl() {
    const { map } = useMapContext();
    const container = useLeafletControl(map, 'topleft');
    const [sourcesHidden, setSourcesHidden] = useState(true);
    const [bodyExpanded, setBodyExpanded] = useState(false);

    if (!container) return null;

    return createPortal(
        <div className="p-4 max-w-[500px]">
            {/* Heading */}
            <div className="flex flex-row items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold m-0 text-slate-900 dark:text-slate-200">
                    Українські землі у XVII-XVIII ст.
                </h1>
            </div>

            {/* Content */}
            <div className={`text-slate-700 dark:text-slate-400 ${bodyExpanded ? 'expanded' : ''}`}>
                <p className="mt-1 mb-2 break-words">
                    Дана карта є лише гіпотетичною реконструкцією на основі аналізу доступних архівних джерел.
                    Якщо помітили помилку або маєте що додати, повідомте про це автора.
                </p>
                <h2 className="flex flex-row items-center gap-1.5 text-base text-slate-900 dark:text-slate-200 font-bold mt-2 mb-2">
                    <MapPinned size={16}/>
                    Умовні позначення
                </h2>
                <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full border border-black bg-orange-600 w-[1em] h-[1em]"></span>
                    <span>Центри воєводств, комітатів, цинутів</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full border border-black bg-orange-600 w-[0.75em] h-[0.75em]"></span>
                    <span>Центри повітів, полків</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full border border-black bg-orange-300 w-[0.5em] h-[0.5em]"></span>
                    <span>Центри староств</span>
                </div>
                <h2 className="flex flex-row items-center gap-1.5 text-base text-slate-900 dark:text-slate-200 font-bold mt-2 mb-2">
                    <BookOpenText size={16}/>
                    Джерела
                </h2>
                <a
                    href="#"
                    className="flex flex-row items-center gap-1 w-fit !text-slate-900 bg-slate-50 px-2 py-1 hover:bg-slate-200 rounded-md transition-colors dark:!text-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700"
                    onClick={(e) => {
                        e.preventDefault();
                        setSourcesHidden(!sourcesHidden);
                    }}
                >
                    {sourcesHidden ? 
                    <><span>показати список</span> <ChevronsDown size={14}/></>
                    : 
                    <><span>приховати</span> <ChevronsUp size={14}/></>}
                </a>
                <ol className={`mt-3 list-decimal text-xs break-words ${sourcesHidden ? 'hidden' : ''}`} id="sources">
                    {SOURCES.map((source, i) => (
                        <li key={i} className="ml-4 my-1">
                            <a target="_blank" rel="noopener noreferrer" href={source.link} className="!text-slate-700 dark:!text-slate-400 no-underline hover:underline hover:underline-offset-1 hover:decoration-2 hover:decoration-blue-400">
                                {source.title}
                            </a>
                        </li>
                    ))}
                </ol>
            </div>
        </div>,
        container
    );
}
