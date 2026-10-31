import { Supply } from '../types';

/**
 * Converte uma string de medidas (ex: "15 x 10 x 8 cm", "15x10x8", "20*15*10")
 * em um array de 3 números ordenados do menor para o maior [menor, medio, maior].
 */
export function parseDimensions(str?: string): [number, number, number] | null {
  if (!str) return null;
  const isMm = /mm/i.test(str);

  // 1. Tenta extrair 3 números explícitos: "16x11x6", "16 x 11 x 6 cm", "16*11*6", "16,5 x 11 x 6"
  const matches = str.match(/(\d+[\.,]?\d*)\s*[xX*×]\s*(\d+[\.,]?\d*)\s*[xX*×]\s*(\d+[\.,]?\d*)/);
  if (matches) {
    let nums = [
      parseFloat(matches[1].replace(',', '.')),
      parseFloat(matches[2].replace(',', '.')),
      parseFloat(matches[3].replace(',', '.'))
    ];

    if (!nums.some(isNaN) && !nums.some((n) => n <= 0)) {
      if (isMm || (nums[0] >= 50 && nums[1] >= 50 && nums[2] >= 50 && !/cm/i.test(str))) {
        nums = nums.map((n) => Number((n / 10).toFixed(1)));
      }
      return nums.sort((a, b) => a - b) as [number, number, number];
    }
  }

  // 2. Fallback inteligente para nomes padronizados sem dimensões explícitas
  const lower = str.toLowerCase();
  if (/\b(nº\s*1|n1|tam\s*p|pequena|tipo p)\b/.test(lower)) {
    return [6, 11, 16]; // 16x11x6 cm
  }
  if (/\b(nº\s*2|n2|tam\s*m|média|media|tipo m)\b/.test(lower)) {
    return [10, 15, 20]; // 20x15x10 cm
  }
  if (/\b(nº\s*3|n3|tam\s*g|grande|tipo g)\b/.test(lower)) {
    return [15, 20, 25]; // 25x20x15 cm
  }

  return null;
}

export interface BoxMatchResult {
  box: Supply;
  boxDims: [number, number, number] | null;
  isExactFit: boolean;
  boxVolume: number;
}

/**
 * Localiza a caixa de papelão mais adequada para a peça cadastrada.
 * Prioriza a menor caixa em volume que consiga acomodar a peça (com folga mínima para proteção).
 */
export function findBestFittingBox(
  pieceDimsStr: string,
  supplies: Supply[],
  safetyPaddingCm = 0.5
): BoxMatchResult | null {
  const boxes = supplies.filter((s) => s.type === 'Caixa de papelão');
  if (boxes.length === 0) return null;

  const piece = parseDimensions(pieceDimsStr);
  if (!piece) {
    const firstBoxDims = parseDimensions(boxes[0].name) || parseDimensions(boxes[0].notes || '');
    return {
      box: boxes[0],
      boxDims: firstBoxDims,
      isExactFit: false,
      boxVolume: firstBoxDims ? firstBoxDims[0] * firstBoxDims[1] * firstBoxDims[2] : 0
    };
  }

  const analyzed = boxes.map((box) => {
    const dims = parseDimensions(box.name) || parseDimensions(box.notes || '');
    if (!dims) {
      return { box, boxDims: null, isExactFit: false, boxVolume: 999999 };
    }
    const vol = dims[0] * dims[1] * dims[2];
    const fits =
      piece[0] + safetyPaddingCm <= dims[0] &&
      piece[1] + safetyPaddingCm <= dims[1] &&
      piece[2] + safetyPaddingCm <= dims[2];

    return {
      box,
      boxDims: dims,
      isExactFit: fits,
      boxVolume: vol
    };
  });

  const fitting = analyzed.filter((a) => a.isExactFit).sort((a, b) => a.boxVolume - b.boxVolume);
  if (fitting.length > 0) return fitting[0];

  const sortedByVolume = analyzed.filter((a) => a.boxDims !== null).sort((a, b) => b.boxVolume - a.boxVolume);
  return sortedByVolume[0] || { box: boxes[0], boxDims: null, isExactFit: false, boxVolume: 0 };
}
