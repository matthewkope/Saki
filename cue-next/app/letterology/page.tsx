'use client';

import { useState, useRef } from 'react';
import { calculate } from '@/lib/letterology';
import type { CalcResult } from '@/lib/letterology';

export default function LetterologyPage() {
  const [currentCase, setCurrentCase] = useState<'lower' | 'upper'>('lower');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [word, setWord] = useState('');
  const [result, setResult] = useState<CalcResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleCaseChange(mode: 'lower' | 'upper') {
    setCurrentCase(mode);
    if (word.trim()) {
      setResult(calculate(word, caseSensitive, mode));
    }
  }

  function handleCaseSensitiveChange(checked: boolean) {
    setCaseSensitive(checked);
    if (word.trim()) {
      setResult(calculate(word, checked, currentCase));
    }
  }

  function handleInput(val: string) {
    setWord(val);
    if (val.trim()) {
      setResult(calculate(val, caseSensitive, currentCase));
    } else {
      setResult(null);
    }
  }

  function clearInput() {
    setWord('');
    setResult(null);
    inputRef.current?.focus();
  }

  // Build letter grid
  const gridLetters = currentCase === 'lower'
    ? 'abcdefghijklmnopqrstuvwxyz'.split('')
    : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const inputChars = word.split('').filter((c) => /[a-zA-Z]/.test(c));
  const usedLetters: Set<string> = caseSensitive
    ? new Set(inputChars.filter((c) => currentCase === 'lower' ? c === c.toLowerCase() : c === c.toUpperCase()))
    : new Set(inputChars.map((c) => c.toLowerCase()));

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div className="app-title">Letterology</div>
        <div className="app-subtitle">Letter · Value · Meaning</div>
      </div>

      {/* Case Toggle */}
      <div className="case-toggle">
        <button
          className={`case-btn${currentCase === 'lower' ? ' active' : ''}`}
          onClick={() => handleCaseChange('lower')}
        >Lowercase a–z</button>
        <button
          className={`case-btn${currentCase === 'upper' ? ' active' : ''}`}
          onClick={() => handleCaseChange('upper')}
        >Uppercase A–Z</button>
      </div>

      {/* Letter Grid */}
      <div className="letter-grid">
        {gridLetters.map((ch, i) => {
          const val = currentCase === 'lower' ? i + 1 : i + 27;
          const highlighted = caseSensitive ? usedLetters.has(ch) : usedLetters.has(ch.toLowerCase());
          return (
            <div key={ch} className={`letter-cell${highlighted ? ' highlight' : ''}`}>
              <span className="lc-letter">{ch}</span>
              <span className="lc-value">{val}</span>
            </div>
          );
        })}
      </div>

      {/* Word Input */}
      <div className="word-input-wrap">
        <input
          ref={inputRef}
          className="word-input"
          type="text"
          placeholder="Enter a word or name…"
          value={word}
          onChange={(e) => handleInput(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {word && (
          <button className="clear-btn visible" onClick={clearInput}>×</button>
        )}
      </div>

      {/* Case Sensitive */}
      <label className="case-sensitive-label">
        <input
          type="checkbox"
          checked={caseSensitive}
          onChange={(e) => handleCaseSensitiveChange(e.target.checked)}
        />
        <span>Case Sensitive — capital letters use uppercase values (A=27…Z=52)</span>
      </label>

      {/* Results */}
      <div className="results-wrap">
        {!result ? (
          <div className="empty-state">Enter a word above to see letter values</div>
        ) : (
          <>
            {/* Steps - Reduced */}
            <div className="result-card">
              <div className="result-card-title">Steps — Reduced</div>
              <div className="steps-row">
                {result.letterData.map((d, i) => (
                  <>
                    <div key={i} className="step-chip">
                      <span className="chip-letter">{d.ch}</span>
                      <span className="chip-val">{d.red}</span>
                    </div>
                    {i < result.letterData.length - 1 && (
                      <span key={`p${i}`} className="step-plus">+</span>
                    )}
                  </>
                ))}
                <span className="step-equals">=</span>
                {result.reducedSum !== result.reducedFinal && (
                  <>
                    <span className="step-total" style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                      {result.reducedSum}
                    </span>
                    <span className="step-equals">→</span>
                  </>
                )}
                <span className="step-total">{result.reducedFinal}</span>
              </div>
            </div>

            {/* Steps - Non-Reduced */}
            <div className="result-card">
              <div className="result-card-title">Steps — Non-Reduced</div>
              <div className="steps-row">
                {result.letterData.map((d, i) => (
                  <>
                    <div key={i} className="step-chip">
                      <span className="chip-letter">{d.ch}</span>
                      <span className="chip-val">{d.raw}</span>
                    </div>
                    {i < result.letterData.length - 1 && (
                      <span key={`p${i}`} className="step-plus">+</span>
                    )}
                  </>
                ))}
                <span className="step-equals">=</span>
                <span className="step-total">{result.nonReducedSum}</span>
              </div>
            </div>

            {/* Additional Values */}
            <div className="result-card">
              <div className="result-card-title">Additional Values</div>
              <table className="add-table">
                <tbody>
                  <tr>
                    <td className="td-label">Total Reduced</td>
                    <td className="td-vals">{result.totalReduced}<span className="val-raw">({result.reducedSum})</span></td>
                  </tr>
                  <tr>
                    <td className="td-label">First Letter</td>
                    <td className="td-vals">{result.firstLetter.red}<span className="val-raw">({result.firstLetter.raw})</span></td>
                  </tr>
                  <tr>
                    <td className="td-label">First Vowel</td>
                    <td className="td-vals">
                      {result.firstVowel ? result.firstVowel.red : '—'}
                      <span className="val-raw">({result.firstVowel ? result.firstVowel.raw : '—'})</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="td-label">Vowel Sum</td>
                    <td className="td-vals">{result.vowelSumReduced}<span className="val-raw">({result.vowelRawSum})</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="result-card">
              <div className="result-card-title">Summary</div>
              <div className="summary-grid">
                <div className="summary-cell">
                  <div className="sc-label">Reduced</div>
                  <div className="sc-main">{result.reducedFinal}</div>
                  <div className="sc-raw">{result.reducedSum}</div>
                </div>
                <div className="summary-cell">
                  <div className="sc-label">Non-Reduced</div>
                  <div className="sc-main">{result.nonReducedFinal}</div>
                  <div className="sc-raw">{result.nonReducedSum}</div>
                </div>
                <div className="summary-cell final-cell">
                  <div className="sc-label">Final</div>
                  <div className="sc-main">{result.finalVal}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
