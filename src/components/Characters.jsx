// نادر and رنا (Open Peeps CC0 parts; Rana's tunic drawn for Abjad). Built by scripts/art/characters.mjs.
const files = import.meta.glob('../art/characters/*.svg', { eager: true, query: '?url', import: 'default' });
const url = (who, mood) => files[`../art/characters/${who}-${mood}.svg`] || files[`../art/characters/${who}-smile.svg`];

export const NAMES = { nader: 'Nader', rana: 'Rana' };

export function Character({ who, mood = 'smile', size = 80, className = '' }) {
  return <img className={'character ' + className} src={url(who, mood)} width={size} height={Math.round(size * 1.2)} alt="" draggable="false" />;
}
