/**
 * DotMatrix.jsx
 * Dot-Matrix loading animation components, inspired by dotmatrix.zzzzshawn.cloud
 * Ported from the open-source shadcn registry source to plain React/JSX.
 */

import { useState, useEffect, useMemo } from 'react';
import './dotmatrix.css';

// ─── Constants ───────────────────────────────────────────────────────────────

const MATRIX_SIZE = 5;
const CENTER = Math.floor(MATRIX_SIZE / 2);
const RANGE = Array.from({ length: MATRIX_SIZE }, (_, i) => i);
const MAX_RADIUS = Math.hypot(CENTER, CENTER);
const CELLS = MATRIX_SIZE * MATRIX_SIZE;

// ─── Index Helpers ────────────────────────────────────────────────────────────

function rowMajorIndex(row, col) {
  return row * MATRIX_SIZE + col;
}

function indexToCoord(index) {
  return {
    row: Math.floor(index / MATRIX_SIZE),
    col: index % MATRIX_SIZE,
  };
}

function distanceFromCenter(index) {
  const { row, col } = indexToCoord(index);
  return Math.hypot(row - CENTER, col - CENTER);
}

// ─── Spiral Inward Order ─────────────────────────────────────────────────────

function buildSpiralInwardOrder() {
  const N = MATRIX_SIZE;
  const order = new Array(N * N);
  let top = 0,
    bottom = N - 1,
    left = 0,
    right = N - 1,
    t = 0;

  while (top <= bottom && left <= right) {
    for (let col = left; col <= right; col++) order[rowMajorIndex(top, col)] = t++;
    for (let row = top + 1; row <= bottom; row++) order[rowMajorIndex(row, right)] = t++;
    if (top < bottom) for (let col = right - 1; col >= left; col--) order[rowMajorIndex(bottom, col)] = t++;
    if (left < right) for (let row = bottom - 1; row > top; row--) order[rowMajorIndex(row, left)] = t++;
    top++;
    bottom--;
    left++;
    right--;
  }
  return order;
}

const SPIRAL_ORDER = buildSpiralInwardOrder();

// ─── Pattern Index Sets ───────────────────────────────────────────────────────

const FULL_INDEXES = new Set(
  RANGE.flatMap((row) => RANGE.map((col) => rowMajorIndex(row, col)))
);

const DIAMOND_INDEXES = new Set(
  RANGE.flatMap((row) =>
    RANGE.filter((col) => Math.abs(row - CENTER) + Math.abs(col - CENTER) <= 2).map((col) =>
      rowMajorIndex(row, col)
    )
  )
);

const OUTLINE_INDEXES = new Set(
  RANGE.flatMap((row) =>
    RANGE.filter(
      (col) => row === 0 || row === MATRIX_SIZE - 1 || col === 0 || col === MATRIX_SIZE - 1
    ).map((col) => rowMajorIndex(row, col))
  )
);

const CROSS_INDEXES = new Set(
  RANGE.flatMap((row) =>
    RANGE.filter((col) => row === CENTER || col === CENTER).map((col) =>
      rowMajorIndex(row, col)
    )
  )
);

const PATTERNS = {
  full: FULL_INDEXES,
  diamond: DIAMOND_INDEXES,
  outline: OUTLINE_INDEXES,
  cross: CROSS_INDEXES,
};

// ─── Hook: Reduced Motion ─────────────────────────────────────────────────────

function usePrefersReducedMotion() {
  const [pref, setPref] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPref(mq.matches);
    const handler = () => setPref(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return pref;
}

// ─── Layout Helper ────────────────────────────────────────────────────────────

function getGap(size, dotSize) {
  return Math.max(1, Math.floor((size - dotSize * 5) / 4));
}

// ─── DotmSpiral — Core Spiral (clockwise inward spiral animation) ─────────────

export function DotmSpiral({
  size = 36,
  dotSize = 5,
  color = 'currentColor',
  speed = 1.35,
  pattern = 'full',
  animated = true,
  className = '',
  opacityBase,
  opacityMid,
  opacityPeak,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const patternSet = PATTERNS[pattern] || FULL_INDEXES;
  const safeSpeed = speed > 0 ? speed : 1;
  const gap = getGap(size, dotSize);

  const rootStyle = {
    width: size,
    height: size,
    '--dmx-speed': 1 / safeSpeed,
    '--dmx-dot-size': `${dotSize}px`,
    '--dmx-dot-fill': color,
    color,
    ...(opacityBase !== undefined && { '--dmx-opacity-base': opacityBase }),
    ...(opacityMid !== undefined && { '--dmx-opacity-mid': opacityMid }),
    ...(opacityPeak !== undefined && { '--dmx-opacity-peak': opacityPeak }),
  };

  const dots = Array.from({ length: CELLS }, (_, index) => {
    const isActive = patternSet.has(index);
    if (!isActive) {
      return (
        <span
          key={index}
          className="dmx-dot dmx-inactive"
          style={{ width: dotSize, height: dotSize }}
        />
      );
    }
    const spiralOrder = SPIRAL_ORDER[index];
    const pathNorm = spiralOrder / (CELLS - 1);
    const dotStyle = { width: dotSize, height: dotSize, '--dmx-spiral-order': spiralOrder };

    if (reducedMotion || !animated) {
      dotStyle.opacity = 0.16 + pathNorm * 0.78;
      return <span key={index} aria-hidden="true" className="dmx-dot" style={dotStyle} />;
    }

    return (
      <span
        key={index}
        aria-hidden="true"
        className="dmx-dot dmx-spiral-snake"
        style={dotStyle}
      />
    );
  });

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`dmx-root dmx-dot-shape-circle${className ? ' ' + className : ''}`}
      style={rootStyle}
    >
      <div className="dmx-grid" style={{ gap }}>
        {dots}
      </div>
    </div>
  );
}

// ─── DotmRipple — Radial Ripple (rings pulse outward from center) ─────────────

export function DotmRipple({
  size = 36,
  dotSize = 5,
  color = 'currentColor',
  speed = 1,
  pattern = 'diamond',
  animated = true,
  className = '',
  opacityBase,
  opacityMid,
  opacityPeak,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const patternSet = PATTERNS[pattern] || DIAMOND_INDEXES;
  const safeSpeed = speed > 0 ? speed : 1;
  const gap = getGap(size, dotSize);

  const rootStyle = {
    width: size,
    height: size,
    '--dmx-speed': 1 / safeSpeed,
    '--dmx-dot-size': `${dotSize}px`,
    '--dmx-dot-fill': color,
    color,
    ...(opacityBase !== undefined && { '--dmx-opacity-base': opacityBase }),
    ...(opacityMid !== undefined && { '--dmx-opacity-mid': opacityMid }),
    ...(opacityPeak !== undefined && { '--dmx-opacity-peak': opacityPeak }),
  };

  const dots = Array.from({ length: CELLS }, (_, index) => {
    const isActive = patternSet.has(index);
    if (!isActive) {
      return (
        <span
          key={index}
          className="dmx-dot dmx-inactive"
          style={{ width: dotSize, height: dotSize }}
        />
      );
    }
    const dist = distanceFromCenter(index);
    const dotStyle = { width: dotSize, height: dotSize, '--dmx-ripple-ring': Math.round(dist) };

    if (reducedMotion || !animated) {
      dotStyle.opacity = 0.2 + (1 - dist / MAX_RADIUS) * 0.7;
      return <span key={index} aria-hidden="true" className="dmx-dot" style={dotStyle} />;
    }

    return (
      <span
        key={index}
        aria-hidden="true"
        className="dmx-dot dmx-center-origin-ripple"
        style={{ ...dotStyle, '--dmx-center-ripple-ring': Math.round(dist) }}
      />
    );
  });

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`dmx-root dmx-dot-shape-circle${className ? ' ' + className : ''}`}
      style={rootStyle}
    >
      <div className="dmx-grid" style={{ gap }}>
        {dots}
      </div>
    </div>
  );
}

// ─── DotmDisplay — Static decorative display (no animation) ──────────────────

export function DotmDisplay({
  size = 36,
  dotSize = 5,
  color = 'currentColor',
  pattern = 'full',
  className = '',
}) {
  const patternSet = PATTERNS[pattern] || FULL_INDEXES;
  const gap = getGap(size, dotSize);

  const rootStyle = {
    width: size,
    height: size,
    '--dmx-dot-fill': color,
    color,
    '--dmx-opacity-base': 0.1,
    '--dmx-opacity-mid': 0.3,
    '--dmx-opacity-peak': 0.9,
  };

  const dots = Array.from({ length: CELLS }, (_, index) => {
    const isActive = patternSet.has(index);
    if (!isActive) {
      return (
        <span
          key={index}
          className="dmx-dot dmx-inactive"
          style={{ width: dotSize, height: dotSize }}
        />
      );
    }
    const spiralOrder = SPIRAL_ORDER[index];
    const pathNorm = spiralOrder / (CELLS - 1);
    return (
      <span
        key={index}
        aria-hidden="true"
        className="dmx-dot"
        style={{ width: dotSize, height: dotSize, opacity: 0.1 + pathNorm * 0.75 }}
      />
    );
  });

  return (
    <div
      aria-hidden="true"
      className={`dmx-root dmx-dot-shape-circle${className ? ' ' + className : ''}`}
      style={rootStyle}
    >
      <div className="dmx-grid" style={{ gap }}>
        {dots}
      </div>
    </div>
  );
}
