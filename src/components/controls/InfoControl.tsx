import { createPortal } from 'react-dom';
import { useLeafletControl } from '@/hooks/useLeafletControl.ts';
import { useMapContext } from '@/context/MapContext.tsx';
import { FLAG_ICONS } from '@/utils/constants.ts';

/**
 * Displays detailed information about a hovered map region.
 * Shows region name, division, country with flag, original/Latin names,
 * administrative center, years, and notes.
 */
export function InfoControl() {
    const { map, hoveredRegion } = useMapContext();
    const container = useLeafletControl(map, 'bottomleft', 'info-control');

    if (!container) return null;

    return createPortal(
        hoveredRegion ? <RegionInfo props={hoveredRegion} /> : <DefaultHint />,
        container
    );
}

function DefaultHint() {
    const isTouchDevice = 'ontouchstart' in window;
    const hint = isTouchDevice
        ? 'Натисніть на область на карті, щоб переглянути детальну інформацію'
        : 'Наведіть курсор на карту, щоб переглянути детальну інформацію';

    return <span>{hint}</span>;
}

function RegionInfo({ props }: { props: NonNullable<ReturnType<typeof useMapContext>['hoveredRegion']> }) {
    const countryInfo = FLAG_ICONS.find(i => i.name === props.country);
    const showDivision = props.higherDivision !== props.name && props.higherDivision !== props.country;

    return (
        <>
            <h2>{props.name}</h2>
            <h3>{showDivision ? props.higherDivision : ''}</h3>
            {countryInfo && (
                <h4>
                    <img
                        src={countryInfo.iconUrl}
                        className="country-icon"
                        alt={countryInfo.name}
                        loading="lazy"
                    />
                    {props.country}
                </h4>
            )}
            {!countryInfo && props.country && <h4>{props.country}</h4>}
            <div className="grid-wrapper">
                {props.nameOriginal && countryInfo && <InfoRow label={`Назва ${countryInfo.lang}`} value={props.nameOriginal} />}
                {props.nameLatin && <InfoRow label="Назва латиною" value={props.nameLatin} />}
                {props.center && <InfoRow label="Центр" value={props.center} />}
                {props.years && <InfoRow label="Роки існування" value={props.years} />}
                {props.description && <InfoRow label="Додатково" value={props.description} />}
            </div>
        </>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <>
            <dt>{label}:</dt>
            <dd>{value}</dd>
        </>
    );
}
