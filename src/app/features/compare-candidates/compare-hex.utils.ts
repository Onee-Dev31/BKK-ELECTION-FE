import { DISTRICT_LAYOUTS } from '../../core/constants/map-layout.constants';
import { MiniHex } from './compare-candidates.types';

const HEX_R = 17;
const COL_STEP = HEX_R * Math.sqrt(3);
const ROW_STEP = HEX_R * 1.5;
const ROW_OFFSET = COL_STEP / 2;
const PAD = HEX_R + 8;

export const MINI_HEXES: MiniHex[] = DISTRICT_LAYOUTS.map(d => {
  const cx = PAD + (d.col - 1) * COL_STEP + (d.row % 2 === 0 ? ROW_OFFSET : 0);
  const cy = PAD + (d.row - 1) * ROW_STEP;
  const h = HEX_R * 0.866;
  const h2 = HEX_R * 0.5;
  const pts = [
    `${cx.toFixed(1)},${(cy - HEX_R).toFixed(1)}`,
    `${(cx + h).toFixed(1)},${(cy - h2).toFixed(1)}`,
    `${(cx + h).toFixed(1)},${(cy + h2).toFixed(1)}`,
    `${cx.toFixed(1)},${(cy + HEX_R).toFixed(1)}`,
    `${(cx - h).toFixed(1)},${(cy + h2).toFixed(1)}`,
    `${(cx - h).toFixed(1)},${(cy - h2).toFixed(1)}`,
  ].join(' ');
  return { id: d.id, points: pts };
});

export const MINI_SVG_W = Math.ceil(PAD + (10 - 1) * COL_STEP + ROW_OFFSET + HEX_R + 4);
export const MINI_SVG_H = Math.ceil(PAD + (9 - 1) * ROW_STEP + HEX_R + 4);
