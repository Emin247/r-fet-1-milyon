import React, { useState, useRef } from 'react';
import {
  Table,
  Download,
  Trash2,
  Shuffle,
  CheckCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Hash,
  Sparkles,
  Image as ImageIcon,
  Share2,
  X,
  Check,
  Smartphone,
} from 'lucide-react';

const COLUMN_HEADERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ROW_HEADERS = ['1', '2'];

interface TableState {
  id: number;
  title: string;
  data: string[][]; // 2 rows x 10 cols
  activeCell: { row: number; col: number } | null;
}

const TABLE_2_ROW_0 = Array.from({ length: 10 }, (_, i) => (i % 2 === 0 ? 'Tək' : 'Cüt'));
const TABLE_2_ROW_1 = Array.from({ length: 10 }, (_, i) => (i % 2 === 0 ? 'Cüt' : 'Tək'));

const TABLE_3_ROW_0 = ['', 'eyni', 'əks', 'eyni', 'əks', 'eyni', 'əks', 'eyni', 'əks', 'eyni'];
const TABLE_3_ROW_1 = ['', 'əks', 'eyni', 'əks', 'eyni', 'əks', 'eyni', 'əks', 'eyni', 'əks'];

const TABLE_6_DATA: string[][] = [
  Array(10).fill('1'),
  Array(10).fill('2'),
  Array(10).fill('3'),
  Array(10).fill('4'),
];

// 7-ci cədvəlin şablonu (4 sətir, 10 sütun):
// Sətir 1: 1 2
// Sətir 2: 1 3
// Sətir 3: 2 4
// Sətir 4: 3 4
const TABLE_7_DATA: string[][] = [
  Array(10).fill('1 2'),
  Array(10).fill('1 3'),
  Array(10).fill('2 4'),
  Array(10).fill('3 4'),
];

const generateRandomTekCutRow = () => {
  return Array.from({ length: 10 }, () => (Math.random() < 0.5 ? 'Tək' : 'Cüt'));
};

// 1-dən 1024-ə qədər kombinasiya hesablanması (2^10 = 1024):
// 1 = 10 ədəd Tək
// 2 = 9 ədəd Tək, 1 ədəd Cüt
// ...
// 1024 = 10 ədəd Cüt
const getRowFromCombinationNumber = (num: number): string[] => {
  const clamped = Math.max(1, Math.min(1024, Math.floor(num)));
  const index = clamped - 1; // 0-dan 1023-ə qədər indeks
  return Array.from({ length: 10 }, (_, col) => {
    const bit = (index >> (9 - col)) & 1;
    return bit === 1 ? 'Cüt' : 'Tək';
  });
};

const getCombinationNumberFromRow = (row: string[]): number | null => {
  if (!row || row.length !== 10) return null;
  if (row.some((c) => !c || (c.trim().toLowerCase() !== 'tək' && c.trim().toLowerCase() !== 'cüt'))) {
    return null;
  }
  let index = 0;
  for (let col = 0; col < 10; col++) {
    const isCut = row[col].trim().toLowerCase() === 'cüt';
    index = (index << 1) | (isCut ? 1 : 0);
  }
  return index + 1;
};

const computeSecondRowFromFirstRow = (firstRow: string[]): string[] => {
  const result: string[] = ['']; // 1-ci sütun boş qalır
  for (let i = 1; i < 10; i++) {
    const prev = firstRow[i - 1]?.trim().toLowerCase();
    const curr = firstRow[i]?.trim().toLowerCase();
    if (!prev || !curr) {
      result.push('');
    } else if (prev === curr) {
      result.push('eyni');
    } else {
      result.push('əks');
    }
  }
  return result;
};

const getCellStyles = (value: string, isSelected: boolean) => {
  const norm = value.trim().toLowerCase();
  if (norm === 'tək' || norm === 'tek') {
    return {
      tdClass: isSelected
        ? 'bg-yellow-200 ring-2 ring-[#107c41] ring-inset z-10'
        : 'bg-yellow-200/90 hover:bg-yellow-200',
      inputClass: 'text-yellow-950 font-semibold text-center placeholder:text-yellow-700/50',
    };
  }
  if (norm === 'cüt' || norm === 'cut') {
    return {
      tdClass: isSelected
        ? 'bg-blue-200 ring-2 ring-[#107c41] ring-inset z-10'
        : 'bg-blue-200/90 hover:bg-blue-200',
      inputClass: 'text-blue-950 font-semibold text-center placeholder:text-blue-700/50',
    };
  }
  if (norm === 'eyni') {
    return {
      tdClass: isSelected
        ? 'bg-emerald-100 ring-2 ring-[#107c41] ring-inset z-10'
        : 'bg-emerald-50/80 hover:bg-emerald-100/60',
      inputClass: 'text-emerald-900 font-bold text-center placeholder:text-neutral-300',
    };
  }
  if (norm === 'əks' || norm === 'eks') {
    return {
      tdClass: isSelected
        ? 'bg-indigo-100 ring-2 ring-[#107c41] ring-inset z-10'
        : 'bg-indigo-50/80 hover:bg-indigo-100/60',
      inputClass: 'text-indigo-900 font-bold text-center placeholder:text-neutral-300',
    };
  }
  return {
    tdClass: isSelected
      ? 'bg-emerald-50/40 ring-2 ring-[#107c41] ring-inset z-10'
      : 'bg-white hover:bg-neutral-50',
    inputClass: 'text-neutral-900 font-normal placeholder:text-neutral-300',
  };
};

const computeTable4 = (table1Data: string[][]): string[][] => {
  const row0Outcome = table1Data[0] || [];
  const row1Outcome = table1Data[1] || [];

  // 1-ci sətir: 2-ci cədvəldə yaşıl olan sətrin nömrəsi (1 və ya 2)
  const row0: string[] = [];
  for (let c = 0; c < 10; c++) {
    const target = row0Outcome[c]?.trim().toLowerCase();
    if (!target) {
      row0.push('');
    } else if (TABLE_2_ROW_0[c].toLowerCase() === target) {
      row0.push('1');
    } else if (TABLE_2_ROW_1[c].toLowerCase() === target) {
      row0.push('2');
    } else {
      row0.push('');
    }
  }

  // 2-ci sətir: 3-cü cədvəldə yaşıl olan sətrin nömrəsi (1 və ya 2)
  const row1: string[] = [];
  for (let c = 0; c < 10; c++) {
    if (c === 0) {
      row1.push(''); // 1-ci sütun boş qalır
      continue;
    }
    const target = row1Outcome[c]?.trim().toLowerCase();
    if (!target) {
      row1.push('');
    } else if (TABLE_3_ROW_0[c].toLowerCase() === target) {
      row1.push('1');
    } else if (TABLE_3_ROW_1[c].toLowerCase() === target) {
      row1.push('2');
    } else {
      row1.push('');
    }
  }

  return [row0, row1];
};

const computeTable5 = (table4Data: string[][]): string[][] => {
  const t4Row0 = table4Data[0] || [];
  const t4Row1 = table4Data[1] || [];

  const row0: string[] = [];
  for (let c = 0; c < 10; c++) {
    if (c === 0) {
      row0.push(''); // 1-ci sütun boş qalır
      continue;
    }
    const val1 = t4Row0[c]?.trim();
    const val2 = t4Row1[c]?.trim();

    if (val1 === '1' && val2 === '1') {
      row0.push('1');
    } else if (val1 === '1' && val2 === '2') {
      row0.push('2');
    } else if (val1 === '2' && val2 === '1') {
      row0.push('3');
    } else if (val1 === '2' && val2 === '2') {
      row0.push('4');
    } else {
      row0.push('');
    }
  }

  return [row0];
};

export default function App() {
  const [tables, setTables] = useState<TableState[]>(() => {
    const table1Row0 = generateRandomTekCutRow();
    const table1Row1 = computeSecondRowFromFirstRow(table1Row0);
    const table4Data = computeTable4([table1Row0, table1Row1]);
    const table5Data = computeTable5(table4Data);

    return [1, 2, 3, 4, 5, 6, 7].map((id) => ({
      id,
      title: `Cədvəl ${id}`,
      data:
        id === 1
          ? [table1Row0, table1Row1]
          : id === 2
          ? [[...TABLE_2_ROW_0], [...TABLE_2_ROW_1]]
          : id === 3
          ? [[...TABLE_3_ROW_0], [...TABLE_3_ROW_1]]
          : id === 4
          ? table4Data
          : id === 5
          ? table5Data
          : id === 6
          ? TABLE_6_DATA.map((r) => [...r])
          : TABLE_7_DATA.map((r) => [...r]),
      activeCell: null,
    }));
  });

  const cellInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const updateCellValue = (tableId: number, rowIdx: number, colIdx: number, value: string) => {
    if (
      tableId === 2 ||
      tableId === 3 ||
      tableId === 4 ||
      tableId === 5 ||
      tableId === 6 ||
      tableId === 7
    )
      return; // 2, 3, 4, 5, 6 və 7-ci cədvəllər dəyişilməzdir
    setTables((prev) => {
      const updated = prev.map((tbl) => {
        if (tbl.id !== tableId) return tbl;
        const newData = tbl.data.map((r, rIndex) =>
          rIndex === rowIdx ? r.map((c, cIndex) => (cIndex === colIdx ? value : c)) : [...r]
        );
        // Table 1: 1-ci sətir dəyişdikdə 2-ci sətir avtomatik yenilənir
        if (tbl.id === 1 && rowIdx === 0) {
          newData[1] = computeSecondRowFromFirstRow(newData[0]);
        }
        return { ...tbl, data: newData };
      });

      // 4-cü və 5-ci cədvəlləri 1-ci cədvəlin son dəyərlərinə əsasən yenilə
      const t1 = updated.find((t) => t.id === 1);
      if (t1) {
        const t4Data = computeTable4(t1.data);
        const t5Data = computeTable5(t4Data);
        return updated.map((tbl) => {
          if (tbl.id === 4) return { ...tbl, data: t4Data };
          if (tbl.id === 5) return { ...tbl, data: t5Data };
          return tbl;
        });
      }
      return updated;
    });
  };

  const setActiveCell = (tableId: number, rowIdx: number | null, colIdx: number | null) => {
    setTables((prev) =>
      prev.map((tbl) => ({
        ...tbl,
        activeCell:
          tbl.id === tableId && rowIdx !== null && colIdx !== null
            ? { row: rowIdx, col: colIdx }
            : tbl.id === tableId
            ? null
            : tbl.activeCell,
      }))
    );
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    tableId: number,
    rowIdx: number,
    colIdx: number
  ) => {
    const targetTable = tables.find((t) => t.id === tableId);
    const maxRowIdx = (targetTable?.data.length ?? 2) - 1;
    let nextRow = rowIdx;
    let nextCol = colIdx;

    if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
      if (colIdx < 9) {
        e.preventDefault();
        nextCol = colIdx + 1;
      } else if (e.key === 'Tab' && rowIdx < maxRowIdx) {
        e.preventDefault();
        nextRow = rowIdx + 1;
        nextCol = 0;
      }
    } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
      if (colIdx > 0) {
        e.preventDefault();
        nextCol = colIdx - 1;
      } else if (e.key === 'Tab' && rowIdx > 0) {
        e.preventDefault();
        nextRow = rowIdx - 1;
        nextCol = 9;
      }
    } else if (e.key === 'ArrowDown' || (e.key === 'Enter' && !e.shiftKey)) {
      if (rowIdx < maxRowIdx) {
        e.preventDefault();
        nextRow = rowIdx + 1;
      }
    } else if (e.key === 'ArrowUp' || (e.key === 'Enter' && e.shiftKey)) {
      if (rowIdx > 0) {
        e.preventDefault();
        nextRow = rowIdx - 1;
      }
    }

    if (nextRow !== rowIdx || nextCol !== colIdx) {
      setActiveCell(tableId, nextRow, nextCol);
      const targetKey = `${tableId}-${nextRow}-${nextCol}`;
      cellInputRefs.current[targetKey]?.focus();
    }
  };

  const [isManualInputActive, setIsManualInputActive] = useState<boolean>(false);
  const [comboInput, setComboInput] = useState<string>('1');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [imageNotification, setImageNotification] = useState<string | null>(null);

  const applyCombination = (num: number) => {
    if (isNaN(num) || num < 1 || num > 1024) return;
    const clamped = Math.max(1, Math.min(1024, Math.floor(num)));
    const newRow0 = getRowFromCombinationNumber(clamped);
    const newRow1 = computeSecondRowFromFirstRow(newRow0);
    const newT4 = computeTable4([newRow0, newRow1]);
    const newT5 = computeTable5(newT4);

    setTables((prev) =>
      prev.map((tbl) => {
        if (tbl.id === 1) return { ...tbl, data: [newRow0, newRow1] };
        if (tbl.id === 4) return { ...tbl, data: newT4 };
        if (tbl.id === 5) return { ...tbl, data: newT5 };
        return tbl;
      })
    );
    setIsManualInputActive(true);
    setComboInput(String(clamped));
  };

  const handleComboInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComboInput(e.target.value);
  };

  const handleComboSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseInt(comboInput, 10);
    if (!isNaN(val) && val >= 1 && val <= 1024) {
      applyCombination(val);
    }
  };

  const stepCombination = (delta: number) => {
    const current = parseInt(comboInput, 10) || 1;
    const next = Math.max(1, Math.min(1024, current + delta));
    applyCombination(next);
  };

  const appendTekCut = (type: 'Tək' | 'Cüt') => {
    setTables((prev) => {
      const t1 = prev.find((t) => t.id === 1);
      if (!t1) return prev;

      const currentRow0 = [...t1.data[0]];
      // Find the first empty cell in row 0
      const emptyIdx = currentRow0.findIndex((cell) => cell.trim() === '');
      if (emptyIdx === -1) {
        // All 10 cells are already filled
        return prev;
      }

      currentRow0[emptyIdx] = type;
      const newRow1 = computeSecondRowFromFirstRow(currentRow0);
      const newT4 = computeTable4([currentRow0, newRow1]);
      const newT5 = computeTable5(newT4);

      const detected = getCombinationNumberFromRow(currentRow0);
      if (detected !== null) {
        setComboInput(String(detected));
      }

      return prev.map((tbl) => {
        if (tbl.id === 1) return { ...tbl, data: [currentRow0, newRow1] };
        if (tbl.id === 4) return { ...tbl, data: newT4 };
        if (tbl.id === 5) return { ...tbl, data: newT5 };
        return tbl;
      });
    });
  };

  const undoLastTekCut = () => {
    setTables((prev) => {
      const t1 = prev.find((t) => t.id === 1);
      if (!t1) return prev;

      const currentRow0 = [...t1.data[0]];
      // Find the last non-empty cell in row 0
      let lastFilledIdx = -1;
      for (let i = 9; i >= 0; i--) {
        if (currentRow0[i].trim() !== '') {
          lastFilledIdx = i;
          break;
        }
      }
      if (lastFilledIdx === -1) return prev;

      currentRow0[lastFilledIdx] = '';
      const newRow1 = computeSecondRowFromFirstRow(currentRow0);
      const newT4 = computeTable4([currentRow0, newRow1]);
      const newT5 = computeTable5(newT4);

      return prev.map((tbl) => {
        if (tbl.id === 1) return { ...tbl, data: [currentRow0, newRow1] };
        if (tbl.id === 4) return { ...tbl, data: newT4 };
        if (tbl.id === 5) return { ...tbl, data: newT5 };
        return tbl;
      });
    });
  };

  const randomizeFirstRow = (tableId: number) => {
    setIsManualInputActive(false);
    setTables((prev) => {
      const newRow0 = generateRandomTekCutRow();
      const newRow1 = computeSecondRowFromFirstRow(newRow0);
      const newT4 = computeTable4([newRow0, newRow1]);
      const newT5 = computeTable5(newT4);

      const detected = getCombinationNumberFromRow(newRow0);
      if (detected !== null) {
        setComboInput(String(detected));
      }

      return prev.map((tbl) => {
        if (tbl.id === 1) return { ...tbl, data: [newRow0, newRow1] };
        if (tbl.id === 4) return { ...tbl, data: newT4 };
        if (tbl.id === 5) return { ...tbl, data: newT5 };
        return tbl;
      });
    });
  };

  const clearTable = (tableId: number) => {
    if (tableId === 1) {
      setIsManualInputActive(true);
    }
    setTables((prev) => {
      if (tableId === 1) {
        const emptyRows = Array.from({ length: 2 }, () => Array(10).fill(''));
        const emptyT4 = computeTable4(emptyRows);
        const emptyT5 = computeTable5(emptyT4);
        return prev.map((tbl) => {
          if (tbl.id === 1) return { ...tbl, data: emptyRows };
          if (tbl.id === 4) return { ...tbl, data: emptyT4 };
          if (tbl.id === 5) return { ...tbl, data: emptyT5 };
          return tbl;
        });
      }
      if (tableId === 2) {
        return prev.map((tbl) =>
          tbl.id === 2 ? { ...tbl, data: [[...TABLE_2_ROW_0], [...TABLE_2_ROW_1]] } : tbl
        );
      }
      if (tableId === 3) {
        return prev.map((tbl) =>
          tbl.id === 3 ? { ...tbl, data: [[...TABLE_3_ROW_0], [...TABLE_3_ROW_1]] } : tbl
        );
      }
      if (tableId === 6) {
        return prev.map((tbl) =>
          tbl.id === 6 ? { ...tbl, data: TABLE_6_DATA.map((r) => [...r]) } : tbl
        );
      }
      if (tableId === 7) {
        return prev.map((tbl) =>
          tbl.id === 7 ? { ...tbl, data: TABLE_7_DATA.map((r) => [...r]) } : tbl
        );
      }
      return prev.map((tbl) =>
        tbl.id === tableId
          ? {
              ...tbl,
              data: Array.from({ length: tbl.data.length }, () => Array(10).fill('')),
            }
          : tbl
      );
    });
  };

  const drawRoundRectHelper = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    }
  };

  const generateTable7ImageBlob = (): Promise<{ blob: Blob; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const table5 = tables.find((t) => t.id === 5);
      const table5Data = table5?.data || [];
      const table7 = tables.find((t) => t.id === 7);
      const table7Data = table7?.data || TABLE_7_DATA;

      const scale = 2; // High-DPI 2x Retina
      const cardWidth = 1140;
      const padding = 28;
      const bannerHeight = 84;
      const tableHeaderHeight = 44;
      const rowHeight = 64;
      const rowsCount = 4;
      const tableBodyHeight = rowsCount * rowHeight;
      const footerHeight = 52;
      const cardHeight = bannerHeight + tableHeaderHeight + tableBodyHeight + footerHeight;

      const totalWidth = cardWidth + padding * 2;
      const totalHeight = cardHeight + padding * 2;

      const canvas = document.createElement('canvas');
      canvas.width = totalWidth * scale;
      canvas.height = totalHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context could not be created'));
        return;
      }

      ctx.scale(scale, scale);

      // Background
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Card
      const cardX = padding;
      const cardY = padding;
      const radius = 16;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      drawRoundRectHelper(ctx, cardX, cardY, cardWidth, cardHeight, radius);
      ctx.fill();
      ctx.restore();

      // Clip inside card
      ctx.save();
      ctx.beginPath();
      drawRoundRectHelper(ctx, cardX, cardY, cardWidth, cardHeight, radius);
      ctx.clip();

      // Top Banner
      ctx.fillStyle = '#107c41';
      ctx.fillRect(cardX, cardY, cardWidth, bannerHeight);

      ctx.fillStyle = '#0d6535';
      ctx.fillRect(cardX, cardY, cardWidth, 4);

      // Banner text
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('CƏDVƏL 7', cardX + 24, cardY + 38);

      ctx.fillStyle = '#d1fae5';
      ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(
        '5-ci cədvələ uyğun (Hər sütunda 2 xana Yaşıl) • Şablon: 1 2 / 1 3 / 2 4 / 3 4',
        cardX + 24,
        cardY + 63
      );

      // Combination Badge on banner
      const badgeText = comboInput ? `Kombinasiya #${comboInput} / 1024` : '10 Sütun';
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const badgeMetrics = ctx.measureText(badgeText);
      const badgeW = badgeMetrics.width + 24;
      const badgeH = 32;
      const badgeX = cardX + cardWidth - badgeW - 24;
      const badgeY = cardY + (bannerHeight - badgeH) / 2;

      ctx.fillStyle = '#0d6535';
      ctx.beginPath();
      drawRoundRectHelper(ctx, badgeX, badgeY, badgeW, badgeH, 16);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(badgeText, badgeX + 12, badgeY + 21);

      // Table layout
      const tableX = cardX;
      const tableY = cardY + bannerHeight;
      const rowHeaderColWidth = 140;
      const dataColWidth = (cardWidth - rowHeaderColWidth) / 10;

      // Table header row
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(tableX, tableY, cardWidth, tableHeaderHeight);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(tableX, tableY + tableHeaderHeight - 1, cardWidth, 1);

      // Sətir \\ Sütun header
      ctx.textAlign = 'center';
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Sətir \\ Sütun', tableX + rowHeaderColWidth / 2, tableY + 27);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(tableX + rowHeaderColWidth, tableY, 1, tableHeaderHeight + tableBodyHeight);

      // Column headers A-J
      for (let col = 0; col < 10; col++) {
        const colX = tableX + rowHeaderColWidth + col * dataColWidth;
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`Sütun ${COLUMN_HEADERS[col]}`, colX + dataColWidth / 2, tableY + 27);

        if (col > 0) {
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(colX, tableY, 1, tableHeaderHeight + tableBodyHeight);
        }
      }

      // 4 Data Rows
      const table5Row0 = table5Data[0] || [];

      for (let rIdx = 0; rIdx < 4; rIdx++) {
        const currentY = tableY + tableHeaderHeight + rIdx * rowHeight;

        // Row Header
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(tableX, currentY, rowHeaderColWidth, rowHeight);

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Sətir ${rIdx + 1}`, tableX + rowHeaderColWidth / 2, currentY + rowHeight / 2 + 5);

        // Horizontal divider
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(tableX, currentY, cardWidth, 1);

        // 10 Data cells
        for (let cIdx = 0; cIdx < 10; cIdx++) {
          const cellX = tableX + rowHeaderColWidth + cIdx * dataColWidth;
          const cellVal = table7Data[rIdx]?.[cIdx] || '';

          const outcome = table5Row0[cIdx];
          const isGreen =
            Boolean(outcome) &&
            (outcome === '1'
              ? rIdx === 0 || rIdx === 1
              : outcome === '2'
              ? rIdx === 0 || rIdx === 2
              : outcome === '3'
              ? rIdx === 1 || rIdx === 3
              : outcome === '4'
              ? rIdx === 2 || rIdx === 3
              : false);

          if (isGreen) {
            ctx.fillStyle = '#059669';
            ctx.fillRect(cellX + 1, currentY + 1, dataColWidth - 1, rowHeight - 1);

            ctx.fillStyle = '#10b981';
            ctx.fillRect(cellX + 1, currentY + 1, dataColWidth - 1, 2);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            ctx.fillText(cellVal, cellX + dataColWidth / 2, currentY + rowHeight / 2 + 8);
          } else {
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(cellX + 1, currentY + 1, dataColWidth - 1, rowHeight - 1);

            ctx.fillStyle = '#64748b';
            ctx.font = '600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            ctx.fillText(cellVal, cellX + dataColWidth / 2, currentY + rowHeight / 2 + 6);
          }
        }
      }

      // Footer bar
      const footerY = tableY + tableHeaderHeight + tableBodyHeight;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(cardX, footerY, cardWidth, footerHeight);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cardX, footerY, cardWidth, 1);

      // Legend
      ctx.textAlign = 'left';
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      drawRoundRectHelper(ctx, cardX + 24, footerY + 17, 16, 16, 4);
      ctx.fill();

      ctx.fillStyle = '#334155';
      ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Yaşıl: 5-ci cədvələ uyğun aktiv xanalar', cardX + 48, footerY + 30);

      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      drawRoundRectHelper(ctx, cardX + 310, footerY + 17, 16, 16, 4);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Boz: Standart şablon', cardX + 334, footerY + 30);

      ctx.textAlign = 'right';
      const dateStr = new Date().toLocaleDateString('az-AZ', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`${dateStr} • Cədvəl 7 Şəkli`, cardX + cardWidth - 24, footerY + 30);

      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          const dataUrl = canvas.toDataURL('image/png');
          resolve({ blob, dataUrl });
        },
        'image/png',
        1.0
      );
    });
  };

  const exportTable7AsImage = async () => {
    setIsGeneratingImage(true);
    try {
      const { blob, dataUrl } = await generateTable7ImageBlob();
      setImagePreviewUrl(dataUrl);
      setShowImageModal(true);

      const fileName = `cedvel_7_${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Mobile share sheet (has "Save Image" / "Fotoşəkillərə saxla" / Gallery directly!)
      let sharedViaNavigator = false;
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Cədvəl 7',
            text: 'Cədvəl 7 Nəticəsi',
          });
          sharedViaNavigator = true;
          setImageNotification('Şəkil paylaşıldı / galeriyaya saxlanıldı!');
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            return;
          }
        }
      }

      if (!sharedViaNavigator) {
        // Direct download fallback
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        setImageNotification('Şəkil galeriyanıza / cihazınıza yükləndi!');
      }
    } catch (err) {
      console.error('Error generating image', err);
      setImageNotification('Şəkil hazırlanarkən xəta baş verdi');
    } finally {
      setIsGeneratingImage(false);
      setTimeout(() => setImageNotification(null), 4000);
    }
  };

  const handleManualShare = async () => {
    if (!imagePreviewUrl) return;
    try {
      const res = await fetch(imagePreviewUrl);
      const blob = await res.blob();
      const file = new File([blob], `cedvel_7_${Date.now()}.png`, { type: 'image/png' });
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Cədvəl 7',
          text: 'Cədvəl 7 Nəticəsi',
        });
      } else {
        const link = document.createElement('a');
        link.href = imagePreviewUrl;
        link.download = `cedvel_7_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Share error', err);
    }
  };

  const handleDirectDownload = () => {
    if (!imagePreviewUrl) return;
    const link = document.createElement('a');
    link.href = imagePreviewUrl;
    link.download = `cedvel_7_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTableCSV = (table: TableState) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Sətir / Sütun,' + COLUMN_HEADERS.map((h) => `Sütun ${h}`).join(',')]
        .concat(
          table.data.map(
            (row, rIdx) => `Sətir ${rIdx + 1},` + row.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${table.title.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-neutral-800 antialiased font-sans pb-16">
      {/* Top Header bar styled like Excel */}
      <header className="bg-[#107c41] text-white px-6 py-4 shadow-sm border-b border-[#0d6535]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-md backdrop-blur-xs">
              <Table className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Excel Cədvəlləri</h1>
              <p className="text-xs text-emerald-100 font-medium">
                Toplam 7 Ədəd Cədvəl | 10 Sütun | Avtomatik Hesablanma Sistemi
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-100 bg-white/10 px-3 py-1.5 rounded border border-white/20">
            <span>Naviqasiya: Tab, Enter və ya Ox düymələri</span>
          </div>
        </div>
      </header>

      {/* Sticky Top Control Toolbar: Tək / Cüt Buttons Always Centered at Top + 1-1024 Combination Selector */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md border-b border-neutral-300 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-2.5">
          {/* Row 1: Action Controls, with TƏK / CÜT centered */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {/* Təmizlə & Aktivləşdir Button */}
            <button
              type="button"
              onClick={() => clearTable(1)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all shadow-2xs ${
                isManualInputActive
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 ring-2 ring-red-200'
              }`}
              title="1-ci cədvəli sıfırla və əllə daxiletmə rejimini aç"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Təmizlə & Aktivləşdir</span>
            </button>

            <div className="h-6 w-px bg-neutral-200 hidden sm:block"></div>

            {/* DEAD CENTER: TƏK and CÜT Buttons */}
            <div className="flex items-center justify-center gap-2 bg-neutral-100/90 p-1 rounded-xl border border-neutral-300/80 shadow-inner">
              {/* TƏK Button */}
              <button
                type="button"
                disabled={!isManualInputActive || (tables.find((t) => t.id === 1)?.data[0].filter((c) => c.trim() !== '').length ?? 0) >= 10}
                onClick={() => appendTekCut('Tək')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-black rounded-lg transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-yellow-950 border-2 border-yellow-500 ring-2 ring-yellow-200 focus:outline-hidden"
                title="1-ci sətrin növbəti xanasına Tək yaz"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-800"></span>
                <span>TƏK</span>
              </button>

              {/* CÜT Button */}
              <button
                type="button"
                disabled={!isManualInputActive || (tables.find((t) => t.id === 1)?.data[0].filter((c) => c.trim() !== '').length ?? 0) >= 10}
                onClick={() => appendTekCut('Cüt')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-black rounded-lg transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 active:scale-95 text-white border-2 border-blue-700 ring-2 ring-blue-300 focus:outline-hidden"
                title="1-ci sətrin növbəti xanasına Cüt yaz"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                <span>CÜT</span>
              </button>

              {/* Geri Al (Undo) */}
              {isManualInputActive && (tables.find((t) => t.id === 1)?.data[0].filter((c) => c.trim() !== '').length ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={undoLastTekCut}
                  className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors ml-1 shadow-2xs"
                  title="Son daxil ediləni geri al"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Geri Al</span>
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-neutral-200 hidden sm:block"></div>

            {/* 1-dən 1024-ə Qədər Rəqəm Seçimi və OK Düyməsi */}
            <form
              onSubmit={handleComboSubmit}
              className="flex items-center gap-1.5 bg-neutral-50 p-1 rounded-xl border border-neutral-300 shadow-2xs"
            >
              <div className="flex items-center gap-1 pl-2 text-xs font-bold text-neutral-700">
                <Hash className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Kombinasiya:</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => stepCombination(-1)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200 rounded transition-colors"
                  title="Əvvəlki (-1)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  min={1}
                  max={1024}
                  value={comboInput}
                  onChange={handleComboInputChange}
                  className="w-16 sm:w-20 px-2 py-1.5 text-center font-bold text-sm bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-[#107c41]"
                  placeholder="1-1024"
                  title="1-dən 1024-ə qədər rəqəm daxil edin"
                />

                <button
                  type="button"
                  onClick={() => stepCombination(1)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200 rounded transition-colors"
                  title="Növbəti (+1)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold bg-[#107c41] hover:bg-[#0d6535] active:scale-95 text-white rounded-lg transition-all shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                  title="Daxil edilən nömrəni təsdiqlə və tətbiq et"
                >
                  <span>OK</span>
                </button>
              </div>
            </form>

            <div className="h-6 w-px bg-neutral-200 hidden sm:block"></div>

            {/* Random Button */}
            <button
              type="button"
              onClick={() => randomizeFirstRow(1)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-2xs"
              title="Təsadüfi olaraq doldur"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#107c41]" />
              <span className="hidden sm:inline">Random</span>
            </button>
          </div>

          {/* Row 2: Status, Tracker, and Explanation */}
          {(() => {
            const row0 = tables.find((t) => t.id === 1)?.data[0] || [];
            const filledCount = row0.filter((c) => c.trim() !== '').length;
            const nextColIdx = row0.findIndex((c) => c.trim() === '');
            const detectedCombo = getCombinationNumberFromRow(row0);

            return (
              <div className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-neutral-600 pt-1.5 border-t border-neutral-200/80">
                {/* 10-column pill tracker */}
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500 font-medium hidden sm:inline">1-ci Cədvəl (1-ci Sətir):</span>
                  <div className="flex items-center gap-1">
                    {COLUMN_HEADERS.map((col, idx) => {
                      const val = row0[idx]?.trim();
                      const isNext = idx === nextColIdx && isManualInputActive;
                      return (
                        <div
                          key={col}
                          className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] border transition-all ${
                            val === 'Tək'
                              ? 'bg-yellow-200 text-yellow-950 border-yellow-400'
                              : val === 'Cüt'
                              ? 'bg-blue-600 text-white border-blue-700'
                              : isNext
                              ? 'bg-emerald-100 text-emerald-900 border-[#107c41] ring-2 ring-emerald-300 animate-pulse'
                              : 'bg-neutral-100 text-neutral-400 border-neutral-300'
                          }`}
                          title={`Sütun ${col}: ${val || (isNext ? 'Növbəti xana' : 'Boş')}`}
                        >
                          {val === 'Tək' ? 'T' : val === 'Cüt' ? 'C' : col}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Combination Info Badge */}
                <div className="flex items-center gap-2">
                  {detectedCombo !== null ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                      <Sparkles className="w-3 h-3 text-[#107c41]" />
                      <span>Kombinasiya: #{detectedCombo} / 1024</span>
                    </span>
                  ) : (
                    <span className="text-neutral-500 font-medium">
                      Doldurulub: <strong className="text-neutral-800">{filledCount} / 10</strong>
                    </span>
                  )}
                  <span className="text-neutral-400 hidden md:inline">
                    (1 = 10 Tək, 2 = 9 Tək / 1 Cüt, ..., 1024 = 10 Cüt)
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-4 sm:pt-6">

        <div className="space-y-8 sm:space-y-10">
          {tables.map((table) => {
            const table1FirstRow = tables.find((t) => t.id === 1)?.data[0] || [];
            const table1SecondRow = tables.find((t) => t.id === 1)?.data[1] || [];
            const table5Row0 = tables.find((t) => t.id === 5)?.data[0] || [];
            const activeCellVal =
              table.activeCell !== null
                ? table.data[table.activeCell.row][table.activeCell.col]
                : '';
            const activeCellName =
              table.activeCell !== null
                ? `${COLUMN_HEADERS[table.activeCell.col]}${table.activeCell.row + 1}`
                : '';

            return (
              <section
                key={table.id}
                className="bg-white rounded-lg shadow-sm border border-neutral-300 overflow-hidden"
              >
                {/* Table Header Bar */}
                <div className="bg-neutral-50 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-neutral-800 text-base tracking-wide flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#107c41]"></span>
                      {table.title}
                    </span>
                    <span className="text-xs text-neutral-500 font-normal">
                      ({table.data.length} Sətir × 10 Sütun)
                    </span>
                  </div>

                  {/* Table Control Buttons */}
                  <div className="flex items-center gap-2">
                    {table.id === 1 && (
                      <>
                        <div className="hidden md:flex items-center gap-2 mr-1">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-200 text-yellow-950 border border-yellow-400">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            Tək (Sarı)
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-200 text-blue-950 border border-blue-400">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Cüt (Göy)
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-950 border border-emerald-300">
                            eyni
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-950 border border-indigo-300">
                            əks
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => randomizeFirstRow(1)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition-colors"
                          title="1-ci sətrə təsadüfi Tək və ya Cüt yaz"
                        >
                          <Shuffle className="w-3.5 h-3.5" />
                          Random Tək/Cüt
                        </button>
                      </>
                    )}
                    {table.id === 2 && (
                      <div className="hidden sm:flex items-center gap-2 mr-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-white"></span>
                          1-ci cədvələ uyğun (Yaşıl)
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-neutral-200 text-neutral-700 border border-neutral-300">
                          Dəyişilməz şablon
                        </span>
                      </div>
                    )}
                    {table.id === 3 && (
                      <div className="hidden sm:flex items-center gap-2 mr-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-white"></span>
                          1-ci cədvəlin 2-ci sətrinə uyğun (Yaşıl)
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-neutral-200 text-neutral-700 border border-neutral-300">
                          Dəyişilməz şablon
                        </span>
                      </div>
                    )}
                    {table.id === 4 && (
                      <div className="hidden sm:flex items-center gap-2 mr-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-neutral-800 text-white shadow-2xs">
                          Yaşıl Sətir Nömrələri (1 / 2)
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-neutral-200 text-neutral-700 border border-neutral-300">
                          Sətir 1: 2-ci cədvəldən | Sətir 2: 3-cü cədvəldən
                        </span>
                      </div>
                    )}
                    {table.id === 5 && (
                      <div className="hidden sm:flex items-center gap-2 mr-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-[#107c41] text-white shadow-2xs">
                          4-cü cədvələ əsasən (1, 2, 3, 4)
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-neutral-200 text-neutral-700 border border-neutral-300">
                          (1,1)→1 | (1,2)→2 | (2,1)→3 | (2,2)→4
                        </span>
                      </div>
                    )}
                    {table.id === 6 && (
                      <div className="hidden sm:flex items-center gap-2 mr-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-white"></span>
                          5-ci cədvələ uyğun (Yaşıl)
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-neutral-200 text-neutral-700 border border-neutral-300">
                          Dəyişilməz şablon (Sətir 1→1, 2→2, 3→3, 4→4)
                        </span>
                      </div>
                    )}
                    {table.id === 7 && (
                      <div className="hidden sm:flex items-center gap-2 mr-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-white"></span>
                          5-ci cədvələ uyğun (Hər sütunda 2 xana Yaşıl)
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-neutral-200 text-neutral-700 border border-neutral-300">
                          Dəyişilməz şablon (1 2 / 1 3 / 2 4 / 3 4)
                        </span>
                      </div>
                    )}
                    {table.id !== 2 && table.id !== 3 && table.id !== 4 && table.id !== 5 && table.id !== 6 && table.id !== 7 && (
                      <button
                        type="button"
                        onClick={() => clearTable(table.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-red-700 bg-white hover:bg-red-50 border border-neutral-300 rounded transition-colors"
                        title="Cədvəli təmizlə"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Təmizlə
                      </button>
                    )}
                    {table.id === 7 ? (
                      <button
                        type="button"
                        onClick={exportTable7AsImage}
                        disabled={isGeneratingImage}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-700 rounded shadow-xs transition-all hover:scale-[1.02]"
                        title="Şəkil kimi telefonun galeriyasına yüklə"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        {isGeneratingImage ? 'Hazırlanır...' : 'Şəkil Yüklə'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => exportTableCSV(table)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-neutral-300 rounded transition-colors"
                        title="CSV formatında yüklə"
                      >
                        <Download className="w-3.5 h-3.5" />
                        CSV Yüklə
                      </button>
                    )}
                  </div>
                </div>

                {/* Formula / Cell Bar */}
                <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-2 flex items-center gap-2 text-xs">
                  <div className="flex items-center justify-center font-mono font-bold bg-white text-neutral-700 border border-neutral-300 rounded px-2.5 py-1 min-w-[54px] text-center shadow-2xs">
                    {activeCellName || '--'}
                  </div>
                  <div className="text-neutral-400 font-serif italic text-sm select-none px-1">
                    fx
                  </div>
                  <div className="h-4 w-px bg-neutral-300 mx-1"></div>
                  <input
                    type="text"
                    disabled={
                      table.activeCell === null ||
                      table.id === 2 ||
                      table.id === 3 ||
                      table.id === 4 ||
                      table.id === 5 ||
                      table.id === 6 ||
                      table.id === 7
                    }
                    value={activeCellVal}
                    onChange={(e) => {
                      if (
                        table.activeCell &&
                        table.id !== 2 &&
                        table.id !== 3 &&
                        table.id !== 4 &&
                        table.id !== 5 &&
                        table.id !== 6 &&
                        table.id !== 7
                      ) {
                        updateCellValue(
                          table.id,
                          table.activeCell.row,
                          table.activeCell.col,
                          e.target.value
                        );
                      }
                    }}
                    placeholder={
                      table.activeCell === null
                        ? 'Xananı seçərək dəyər yazın...'
                        : table.id === 2 || table.id === 3
                        ? 'Dəyişilməz şablon xanası'
                        : table.id === 4
                        ? 'Hesablanmış sətir nömrəsi'
                        : table.id === 5
                        ? '4-cü cədvələ əsasən hesablanmış dəyər (1-4)'
                        : table.id === 6
                        ? 'Dəyişilməz şablon xanası (1-4)'
                        : table.id === 7
                        ? 'Dəyişilməz şablon xanası (1 və 2 / 1 və 3 / 2 və 4 / 3 və 4)'
                        : 'Seçilmiş xananın dəyəri...'
                    }
                    className="flex-1 bg-white border border-neutral-300 rounded px-3 py-1 text-neutral-800 text-xs focus:outline-hidden focus:border-[#107c41] focus:ring-1 focus:ring-[#107c41] disabled:bg-neutral-100 disabled:text-neutral-400"
                  />
                </div>

                {/* Excel Grid Container - Fit 100% to screen without horizontal scrolling */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full table-fixed border-collapse border border-neutral-300 text-xs">
                    <thead>
                      <tr className="bg-[#f2f4f7] text-neutral-700 select-none">
                        {/* Top-left corner cell */}
                        <th className="w-12 sm:w-16 md:w-20 border border-neutral-300 px-1 py-1 sm:py-2 text-center font-semibold text-[10px] sm:text-[11px] text-neutral-600 bg-neutral-200/80">
                          <span className="hidden sm:inline">Sətir \ Sütun</span>
                          <span className="sm:hidden">S\S</span>
                        </th>

                        {/* Column Headers (10 columns: Sütun A, Sütun B, ... Sütun J) */}
                        {COLUMN_HEADERS.map((colLetter, colIdx) => (
                          <th
                            key={colLetter}
                            className={`border border-neutral-300 px-0.5 sm:px-1 py-1 sm:py-1.5 text-center font-semibold transition-colors ${
                              table.activeCell?.col === colIdx
                                ? 'bg-emerald-100 text-emerald-900 border-b-2 border-b-[#107c41]'
                                : 'bg-[#eef1f5] hover:bg-[#e4e8ee]'
                            }`}
                          >
                            <div className="font-bold text-[11px] sm:text-xs md:text-sm text-neutral-800 leading-tight truncate">
                              <span className="hidden md:inline">Sütun </span>{colLetter}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-neutral-500 font-mono">
                              ({colIdx + 1})
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Rows (Table 1-4: 2 Rows, Table 5: 1 Row, Table 6: 4 Rows) */}
                      {table.data.map((row, rowIdx) => {
                        const rowName = (rowIdx + 1).toString();
                        return (
                          <tr key={rowName} className="hover:bg-neutral-50/50">
                            {/* Row Header Cell */}
                            <th
                              className={`w-12 sm:w-16 md:w-20 border border-neutral-300 px-0.5 sm:px-1 py-1 text-center font-semibold select-none transition-colors ${
                                table.activeCell?.row === rowIdx
                                  ? 'bg-emerald-100 text-emerald-900 border-r-2 border-r-[#107c41]'
                                  : 'bg-[#eef1f5] hover:bg-[#e4e8ee] text-neutral-700'
                              }`}
                            >
                              <span className="font-bold text-neutral-800 text-[10px] sm:text-xs">
                                <span className="hidden sm:inline">Sətir </span>{rowName}
                              </span>
                            </th>

                            {/* 10 Data Cells */}
                            {COLUMN_HEADERS.map((colLetter, colIdx) => {
                              const cellKey = `${table.id}-${rowIdx}-${colIdx}`;
                              const isSelected =
                                table.activeCell?.row === rowIdx &&
                                table.activeCell?.col === colIdx;
                              const value = table.data[rowIdx][colIdx];
                              const { tdClass, inputClass } = getCellStyles(value, isSelected);

                              // Check Table 2, Table 3, Table 4, Table 5, Table 6, and Table 7 logic
                              const isTable2 = table.id === 2;
                              const isTable3 = table.id === 3;
                              const isTable4 = table.id === 4;
                              const isTable5 = table.id === 5;
                              const isTable6 = table.id === 6;
                              const isTable7 = table.id === 7;

                              // Table 2 logic based on Table 1's Row 1
                              const table1ColOutcome = table1FirstRow[colIdx]?.trim().toLowerCase();
                              const isTable2Green =
                                isTable2 &&
                                Boolean(table1ColOutcome) &&
                                value.trim().toLowerCase() === table1ColOutcome;

                              // Table 3 logic based on Table 1's Row 2
                              // 3-cü cədvəl 1-ci sütun həmişə boş qalır
                              const isTable3EmptyCol = isTable3 && colIdx === 0;
                              const table1Row2ColOutcome = table1SecondRow[colIdx]?.trim().toLowerCase();
                              const isTable3Green =
                                isTable3 &&
                                colIdx > 0 &&
                                Boolean(table1Row2ColOutcome) &&
                                value.trim().toLowerCase() === table1Row2ColOutcome;

                              // 4-cü cədvəl: 2-ci sətrin 1-ci sütunu boş qalır
                              const isTable4Row2Col1 = isTable4 && rowIdx === 1 && colIdx === 0;

                              // 5-ci cədvəl: 1-ci sütun boş qalır
                              const isTable5EmptyCol = isTable5 && colIdx === 0;

                              // 6-cı cədvəl logic: 5-ci cədvəldə olan rəqəmə müvafiq xana yaşıl olsun
                              const table5ColOutcome = table5Row0[colIdx]?.trim();
                              const isTable6Green =
                                isTable6 &&
                                Boolean(table5ColOutcome) &&
                                value.trim() === table5ColOutcome;

                              // 7-ci cədvəl logic: 5-ci cədvəldəki rəqəm bu xanada varsa (məs. '1' -> '1 və 2', '1 və 3'), həmin xanalar yaşıl olsun
                              // Qeyd: 5-ci cədvəlin 1-ci sütunu boşdur. Hər hansı rəqəm (1, 2, 3, 4) üçün dəqiq 2 sətir uyğun gəlir.
                              const isTable7Green =
                                isTable7 &&
                                Boolean(table5ColOutcome) &&
                                (table5ColOutcome === '1'
                                  ? rowIdx === 0 || rowIdx === 1 // '1 və 2', '1 və 3'
                                  : table5ColOutcome === '2'
                                  ? rowIdx === 0 || rowIdx === 2 // '1 və 2', '2 və 4'
                                  : table5ColOutcome === '3'
                                  ? rowIdx === 1 || rowIdx === 3 // '1 və 3', '3 və 4'
                                  : table5ColOutcome === '4'
                                  ? rowIdx === 2 || rowIdx === 3 // '2 və 4', '3 və 4'
                                  : false);

                              const isTable1Row2Col1 =
                                table.id === 1 && rowIdx === 1 && colIdx === 0;
                              const placeholderText =
                                isTable1Row2Col1 || isTable3EmptyCol || isTable4Row2Col1 || isTable5EmptyCol
                                  ? '(boş)'
                                  : `${colLetter}${rowName}`;

                              let finalTdClass = tdClass;
                              let finalInputClass = inputClass;

                              if (isTable2) {
                                if (isTable2Green) {
                                  finalTdClass = isSelected
                                    ? 'bg-emerald-600 ring-2 ring-emerald-950 ring-inset z-10 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white';
                                  finalInputClass =
                                    'text-white font-extrabold text-center drop-shadow-xs cursor-default select-none';
                                } else {
                                  finalTdClass = isSelected
                                    ? 'bg-neutral-100 ring-2 ring-[#107c41] ring-inset z-10 text-neutral-400'
                                    : 'bg-neutral-50/90 hover:bg-neutral-100 text-neutral-400';
                                  finalInputClass =
                                    'text-neutral-400 font-medium text-center cursor-default select-none';
                                }
                              } else if (isTable3) {
                                if (isTable3EmptyCol) {
                                  finalTdClass = isSelected
                                    ? 'bg-neutral-100 ring-2 ring-[#107c41] ring-inset z-10'
                                    : 'bg-neutral-100/70 hover:bg-neutral-100';
                                  finalInputClass =
                                    'text-neutral-400 italic text-center placeholder:text-neutral-400 cursor-default select-none';
                                } else if (isTable3Green) {
                                  finalTdClass = isSelected
                                    ? 'bg-emerald-600 ring-2 ring-emerald-950 ring-inset z-10 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white';
                                  finalInputClass =
                                    'text-white font-extrabold text-center drop-shadow-xs cursor-default select-none';
                                } else {
                                  finalTdClass = isSelected
                                    ? 'bg-neutral-100 ring-2 ring-[#107c41] ring-inset z-10 text-neutral-400'
                                    : 'bg-neutral-50/90 hover:bg-neutral-100 text-neutral-400';
                                  finalInputClass =
                                    'text-neutral-400 font-medium text-center cursor-default select-none';
                                }
                              } else if (isTable4) {
                                if (isTable4Row2Col1) {
                                  finalTdClass = isSelected
                                    ? 'bg-neutral-100 ring-2 ring-[#107c41] ring-inset z-10'
                                    : 'bg-neutral-100/70 hover:bg-neutral-100';
                                  finalInputClass =
                                    'text-neutral-400 italic text-center placeholder:text-neutral-400 cursor-default select-none';
                                } else {
                                  finalTdClass = isSelected
                                    ? 'bg-neutral-100 ring-2 ring-[#107c41] ring-inset z-10'
                                    : 'bg-white hover:bg-neutral-50';
                                  finalInputClass =
                                    'text-neutral-900 font-mono font-bold text-sm text-center cursor-default select-none';
                                }
                              } else if (isTable5) {
                                if (isTable5EmptyCol) {
                                  finalTdClass = isSelected
                                    ? 'bg-neutral-100 ring-2 ring-[#107c41] ring-inset z-10'
                                    : 'bg-neutral-100/70 hover:bg-neutral-100';
                                  finalInputClass =
                                    'text-neutral-400 italic text-center placeholder:text-neutral-400 cursor-default select-none';
                                } else {
                                  finalTdClass = isSelected
                                    ? 'bg-emerald-50 ring-2 ring-[#107c41] ring-inset z-10'
                                    : 'bg-white hover:bg-neutral-50';
                                  finalInputClass =
                                    'text-neutral-900 font-mono font-black text-sm text-center cursor-default select-none';
                                }
                              } else if (isTable6) {
                                if (isTable6Green) {
                                  finalTdClass = isSelected
                                    ? 'bg-emerald-600 ring-2 ring-emerald-950 ring-inset z-10 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white';
                                  finalInputClass =
                                    'text-white font-extrabold text-sm text-center drop-shadow-xs cursor-default select-none';
                                } else {
                                  finalTdClass = isSelected
                                    ? 'bg-neutral-100 ring-2 ring-[#107c41] ring-inset z-10 text-neutral-400'
                                    : 'bg-neutral-50/90 hover:bg-neutral-100 text-neutral-400';
                                  finalInputClass =
                                    'text-neutral-400 font-medium text-sm text-center cursor-default select-none';
                                }
                              } else if (isTable7) {
                                if (isTable7Green) {
                                  finalTdClass = isSelected
                                    ? 'bg-emerald-600 ring-2 ring-emerald-950 ring-inset z-10 text-white font-bold'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold';
                                  finalInputClass =
                                    'text-white font-extrabold text-xs sm:text-sm text-center drop-shadow-xs cursor-default select-none';
                                } else {
                                  finalTdClass = isSelected
                                    ? 'bg-neutral-100 ring-2 ring-[#107c41] ring-inset z-10 text-neutral-400'
                                    : 'bg-neutral-50/90 hover:bg-neutral-100 text-neutral-400';
                                  finalInputClass =
                                    'text-neutral-400 font-medium text-xs sm:text-sm text-center cursor-default select-none';
                                }
                              } else if (isTable1Row2Col1 && !value) {
                                finalTdClass = isSelected
                                  ? 'bg-neutral-100 ring-2 ring-[#107c41] ring-inset z-10'
                                  : 'bg-neutral-100/70 hover:bg-neutral-100';
                                finalInputClass =
                                  'text-neutral-400 italic text-center placeholder:text-neutral-400';
                              }

                              return (
                                <td
                                  key={colLetter}
                                  className={`border border-neutral-300 p-0 relative transition-all ${finalTdClass}`}
                                  onClick={() => {
                                    setActiveCell(table.id, rowIdx, colIdx);
                                    cellInputRefs.current[cellKey]?.focus();
                                  }}
                                >
                                  <input
                                    ref={(el) => {
                                      cellInputRefs.current[cellKey] = el;
                                    }}
                                    type="text"
                                    readOnly={
                                      isTable2 ||
                                      isTable3 ||
                                      isTable4 ||
                                      isTable5 ||
                                      isTable6 ||
                                      isTable7
                                    }
                                    value={value}
                                    onFocus={() => setActiveCell(table.id, rowIdx, colIdx)}
                                    onChange={(e) =>
                                      updateCellValue(table.id, rowIdx, colIdx, e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                      handleKeyDown(e, table.id, rowIdx, colIdx)
                                    }
                                    placeholder={placeholderText}
                                    className={`w-full h-8 sm:h-9 md:h-10 px-0.5 sm:px-1 text-center text-[10px] sm:text-xs md:text-sm font-semibold truncate outline-hidden focus:placeholder:text-transparent ${finalInputClass}`}
                                  />
                                  {isSelected && (
                                    <div
                                      className={`absolute bottom-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 ${
                                        isTable2Green || isTable3Green || isTable6Green || isTable7Green
                                          ? 'bg-white'
                                          : 'bg-[#107c41]'
                                      } pointer-events-none`}
                                    />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Status / Count */}
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-neutral-500">
                  <div className="flex items-center gap-4">
                    <span>
                      Dolu xanalar:{' '}
                      <strong className="text-neutral-700">
                        {table.data.flat().filter((v) => v.trim() !== '').length} / {table.data.length * 10}
                      </strong>
                    </span>
                    <span>
                      Cədvəl ölçüsü:{' '}
                      <strong className="text-neutral-700">{table.data.length} sətir × 10 sütun</strong>
                    </span>
                  </div>
                  <div>
                    {table.activeCell !== null ? (
                      <span className="text-emerald-700 font-medium">
                        Aktiv xana: {COLUMN_HEADERS[table.activeCell.col]}
                        {ROW_HEADERS[table.activeCell.row]} (Sətir{' '}
                        {table.activeCell.row + 1}, Sütun {COLUMN_HEADERS[table.activeCell.col]}
                        )
                      </span>
                    ) : (
                      <span>Heç bir xana seçilməyib</span>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Image Preview & Save Modal for Table 7 */}
      {showImageModal && imagePreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-neutral-200">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 bg-[#107c41] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">Cədvəl 7 — Şəkil Hazırlandı</h3>
                  <p className="text-[11px] text-emerald-100">Telefonun galeriyasına saxlamaq üçün hazırdır</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Bağla"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-neutral-800">
              {/* Mobile tip */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-3.5 flex items-start gap-3 text-xs text-emerald-950">
                <Smartphone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Telefonda birbaşa Galeriyaya saxlamaq üçün:</span>
                  <p className="text-emerald-800 mt-0.5">
                    Aşağıdakı <strong>«Galeriyaya Saxla / Paylaş»</strong> düyməsini basıb açılan menyuda <strong>«Save Image / Şəkli Saxla»</strong> seçin, yaxud şəklin üzərinə <strong>1-2 saniyə basıb saxlayaraq</strong> telefonunuzun galeriyasına əlavə edin.
                  </p>
                </div>
              </div>

              {/* Image Preview */}
              <div className="bg-neutral-100 rounded-xl p-2 border border-neutral-200 flex items-center justify-center overflow-hidden">
                <img
                  src={imagePreviewUrl}
                  alt="Cədvəl 7"
                  className="w-full h-auto rounded-lg shadow-sm max-h-[50vh] object-contain select-all cursor-pointer"
                  title="Telefonda basıb saxlayaraq birbaşa galeriyaya saxlaya bilərsiniz"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-[11px] text-neutral-500">
                Format: <strong>PNG (Yüksək keyfiyyət)</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualShare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-all shadow-xs"
                >
                  <Share2 className="w-4 h-4" />
                  Galeriyaya Saxla / Paylaş
                </button>
                <button
                  type="button"
                  onClick={handleDirectDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Yüklə (PNG)
                </button>
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-3 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 rounded-lg transition-colors"
                >
                  Bağla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating notification toast if any */}
      {imageNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900/90 text-white px-4 py-2.5 rounded-xl shadow-lg border border-neutral-700 flex items-center gap-2 text-xs animate-in slide-in-from-bottom duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{imageNotification}</span>
        </div>
      )}
    </div>
  );
}
