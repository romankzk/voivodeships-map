import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TIME_PERIODS } from '@/utils/constants.ts';
import {
    getOverride,
    setOverride,
    clearOverride,
    getOverrideCount,
    clearAllOverrides,
    subscribe,
    type LayerType,
} from '@/store/overrides.ts';
import type { PeriodData } from '@/types/index.ts';

type FeatureEntry = {
    index: number;
    properties: Record<string, unknown>;
    hasOverride: boolean;
};

const LAYER_TYPES: { value: LayerType; label: string }[] = [
    { value: 'areas', label: 'Регіони (areas)' },
    { value: 'borders', label: 'Кордони (borders)' },
    { value: 'points', label: 'Міста (points)' },
];

/**
 * Admin page for editing GeoJSON feature properties.
 * Loads features from the same data files as the map, allows inline editing,
 * and stores overrides in browser memory.
 */
export function EditorPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const periodId = searchParams.get('period') ?? Object.values(TIME_PERIODS)[0].id;
    const layerType = (searchParams.get('layer') ?? 'areas') as LayerType;

    const [data, setData] = useState<PeriodData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
    const [overrideVersion, setOverrideVersion] = useState(0);

    // Subscribe to override store changes
    useEffect(() => {
        return subscribe(() => setOverrideVersion(v => v + 1));
    }, []);

    // Fetch GeoJSON data for the selected period
    useEffect(() => {
        const periodConfig = Object.values(TIME_PERIODS).find(p => p.id === periodId);
        if (!periodConfig) return;

        const controller = new AbortController();
        setIsLoading(true);
        setData(null);
        setExpandedFeature(null);

        Promise.all([
            fetch(`./data/${periodConfig.areasFile}.geojson`, { signal: controller.signal }).then(r => r.json()),
            fetch(`./data/${periodConfig.bordersFile}.geojson`, { signal: controller.signal }).then(r => r.json()),
            fetch(`./data/${periodConfig.pointsFile}.geojson`, { signal: controller.signal }).then(r => r.json()),
        ])
            .then(([areas, borders, points]) => {
                setData({ areas, borders, points });
                setIsLoading(false);
            })
            .catch(error => {
                if (error.name === 'AbortError') return;
                console.error('Failed to load geojson:', error);
                setIsLoading(false);
            });

        return () => controller.abort();
    }, [periodId]);

    // Build the feature list for the selected layer
    const features: FeatureEntry[] = useMemo(() => {
        if (!data) return [];
        const collection = data[layerType];
        return collection.features.map((feature, index) => ({
            index,
            properties: { ...(feature.properties ?? {}) },
            hasOverride: !!getOverride(periodId, layerType, index),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, layerType, periodId, overrideVersion]);

    const overrideCount = useMemo(() => getOverrideCount(), [overrideVersion]);

    const updateParam = (key: string, value: string) => {
        setSearchParams(prev => {
            prev.set(key, value);
            return prev;
        });
    };

    /** Get the display name for a feature (for the list). */
    const featureLabel = (entry: FeatureEntry): string => {
        const p = entry.properties;
        const override = getOverride(periodId, layerType, entry.index);
        const merged = override ? { ...p, ...override } : p;

        const name = merged.name as string | undefined;
        if (name) return name;
        return `Feature #${entry.index}`;
    };

    return (
        <div className="editor-page">
            <header className="editor-header">
                <div className="editor-header-left">
                    <Link to="/" className="editor-back-link">&larr; Карта</Link>
                    <h1>Редактор властивостей</h1>
                </div>
                <div className="editor-header-right">
                    {overrideCount > 0 && (
                        <span className="editor-badge">
                            {overrideCount} {overrideCount === 1 ? 'зміна' : 'змін'}
                        </span>
                    )}
                    {overrideCount > 0 && (
                        <button
                            className="editor-clear-btn"
                            onClick={() => {
                                if (confirm('Скинути всі зміни?')) clearAllOverrides();
                            }}
                        >
                            Скинути все
                        </button>
                    )}
                </div>
            </header>

            <div className="editor-toolbar">
                <div className="editor-select-group">
                    <label>Період:</label>
                    <select
                        value={periodId}
                        onChange={e => updateParam('period', e.target.value)}
                    >
                        {Object.values(TIME_PERIODS).map(p => (
                            <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                    </select>
                </div>

                <div className="editor-select-group">
                    <label>Шар:</label>
                    <select
                        value={layerType}
                        onChange={e => updateParam('layer', e.target.value)}
                    >
                        {LAYER_TYPES.map(lt => (
                            <option key={lt.value} value={lt.value}>{lt.label}</option>
                        ))}
                    </select>
                </div>

                <span className="editor-feature-count">
                    {features.length} об'єктів
                </span>
            </div>

            {isLoading && <div className="editor-loading">Завантаження...</div>}

            {!isLoading && features.length > 0 && (
                <div className="editor-feature-list">
                    {features.map(entry => (
                        <FeatureRow
                            key={`${periodId}-${layerType}-${entry.index}`}
                            entry={entry}
                            periodId={periodId}
                            layerType={layerType}
                            isExpanded={expandedFeature === entry.index}
                            onToggle={() =>
                                setExpandedFeature(
                                    expandedFeature === entry.index ? null : entry.index,
                                )
                            }
                            label={featureLabel(entry)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Feature Row ────────────────────────────────────────────────────────────

interface FeatureRowProps {
    entry: FeatureEntry;
    periodId: string;
    layerType: LayerType;
    isExpanded: boolean;
    onToggle: () => void;
    label: string;
}

function FeatureRow({ entry, periodId, layerType, isExpanded, onToggle, label }: FeatureRowProps) {
    const override = getOverride(periodId, layerType, entry.index);
    const merged = override ? { ...entry.properties, ...override } : entry.properties;

    return (
        <div className={`editor-feature-row ${entry.hasOverride ? 'has-override' : ''}`}>
            <button className="editor-feature-header" onClick={onToggle}>
                <span className="editor-feature-index">#{entry.index}</span>
                <span className="editor-feature-name">{label}</span>
                {entry.hasOverride && <span className="editor-modified-dot" title="Змінено" />}
                <span className={`editor-chevron ${isExpanded ? 'expanded' : ''}`}>&#9654;</span>
            </button>

            {isExpanded && (
                <FeatureEditor
                    properties={merged}
                    originalProperties={entry.properties}
                    periodId={periodId}
                    layerType={layerType}
                    featureIndex={entry.index}
                />
            )}
        </div>
    );
}

// ─── Feature Editor (expanded property form) ────────────────────────────────

interface FeatureEditorProps {
    properties: Record<string, unknown>;
    originalProperties: Record<string, unknown>;
    periodId: string;
    layerType: LayerType;
    featureIndex: number;
}

function FeatureEditor({
    properties,
    originalProperties,
    periodId,
    layerType,
    featureIndex,
}: FeatureEditorProps) {
    const propKeys = Object.keys(properties);
    const override = getOverride(periodId, layerType, featureIndex);

    const handleChange = (key: string, value: string) => {
        const original = originalProperties[key];
        // Parse back to number if original was number
        let parsed: unknown = value;
        if (typeof original === 'number') {
            const num = Number(value);
            if (!isNaN(num)) parsed = num;
        }
        // If empty string and original was null/undefined, store null
        if (value === '' && (original === null || original === undefined)) {
            parsed = null;
        }

        setOverride(periodId, layerType, featureIndex, { [key]: parsed });
    };

    const handleRevert = (key: string) => {
        if (!override) return;
        const { [key]: _, ...rest } = override;
        if (Object.keys(rest).length === 0) {
            clearOverride(periodId, layerType, featureIndex);
        } else {
            // Replace the entire override (remove one key)
            clearOverride(periodId, layerType, featureIndex);
            if (Object.keys(rest).length > 0) {
                setOverride(periodId, layerType, featureIndex, rest);
            }
        }
    };

    const handleRevertAll = () => {
        clearOverride(periodId, layerType, featureIndex);
    };

    const isModified = (key: string): boolean => {
        if (!override) return false;
        return key in override;
    };

    return (
        <div className="editor-property-form">
            {propKeys.map(key => {
                const value = properties[key];
                const displayValue = value === null || value === undefined ? '' : String(value);
                const modified = isModified(key);

                return (
                    <div key={key} className={`editor-property-row ${modified ? 'modified' : ''}`}>
                        <label className="editor-property-label" title={key}>{key}</label>
                        <input
                            className="editor-property-input"
                            type="text"
                            value={displayValue}
                            onChange={e => handleChange(key, e.target.value)}
                        />
                        {modified && (
                            <button
                                className="editor-revert-btn"
                                onClick={() => handleRevert(key)}
                                title="Скасувати зміну"
                            >
                                &#8634;
                            </button>
                        )}
                    </div>
                );
            })}

            {override && Object.keys(override).length > 0 && (
                <div className="editor-property-actions">
                    <button className="editor-revert-all-btn" onClick={handleRevertAll}>
                        Скасувати всі зміни для цього об'єкту
                    </button>
                </div>
            )}
        </div>
    );
}
