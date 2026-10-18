import React, { useRef, useEffect } from 'react';

/**
 * OtpInput — 6 separate digit boxes.
 * Props:
 *   value      – string of digits (up to 6)
 *   onChange   – (newValue: string) => void
 *   disabled   – bool
 *   error      – string
 *   length     – number of boxes (default 6)
 */
const OtpInput = ({ value = '', onChange, disabled = false, error, length = 6 }) => {
  const inputs = useRef([]);

  // Split string value into per-box array
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const focusBox = (index) => {
    if (inputs.current[index]) inputs.current[index].focus();
  };

  // Auto-focus first box on mount
  useEffect(() => {
    focusBox(0);
  }, []);

  const handleChange = (e, index) => {
    const raw = e.target.value;
    // Allow only last character typed (handles paste of single digit)
    const digit = raw.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    onChange(newDigits.join(''));

    if (digit && index < length - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      } else if (index > 0) {
        focusBox(index - 1);
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusBox(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusBox(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted.padEnd(length, '').slice(0, length).replace(/ /g, ''));
      focusBox(Math.min(pasted.length, length - 1));
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '0.625rem',
          justifyContent: 'center',
        }}
        role="group"
        aria-label="OTP input"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-label={`Digit ${i + 1}`}
            style={{
              width: '3rem',
              height: '3.25rem',
              textAlign: 'center',
              fontSize: '1.375rem',
              fontWeight: 700,
              border: `2px solid ${error ? 'var(--color-error)' : digit ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              background: disabled ? 'var(--color-bg)' : 'var(--color-white)',
              color: 'var(--color-text)',
              transition: 'var(--transition)',
              caretColor: 'transparent',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-primary)';
              e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(192,57,43,0.10)' : 'rgba(26,107,26,0.12)'}`;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
            }}
          />
        ))}
      </div>
      {error && (
        <p className="form-error" style={{ textAlign: 'center', marginTop: '0.5rem' }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default OtpInput;
