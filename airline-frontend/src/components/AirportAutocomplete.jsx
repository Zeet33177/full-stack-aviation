import React, { useState, useRef, useEffect } from 'react';
import { searchAirports } from '../data/airports';

/**
 * Airport search field with suggestions. Emits the plain city name via onChange
 * (the backend matches flights on city), while suggestions also match IATA codes.
 */
export default function AirportAutocomplete({ icon, label, value, onChange, placeholder, error }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const boxRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function handleInput(text) {
    onChange(text);
    const list = searchAirports(text);
    setSuggestions(list);
    setActive(0);
    setOpen(list.length > 0);
  }

  function pick(airport) {
    onChange(airport.city);
    setOpen(false);
  }

  function handleKey(e) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % suggestions.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + suggestions.length) % suggestions.length); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(suggestions[active]); }
    else if (e.key === 'Escape') { setOpen(false); }
  }

  return (
    <div className={`tlp-field tlp-ac ${error ? 'tlp-field-err' : ''}`} ref={boxRef}>
      {icon}
      <div>
        <span>{label}</span>
        <input
          placeholder={placeholder}
          value={value}
          autoComplete="off"
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { if (value) { const l = searchAirports(value); setSuggestions(l); setOpen(l.length > 0); } }}
          onKeyDown={handleKey}
        />
      </div>

      {open && (
        <ul className="tlp-ac-menu" role="listbox">
          {suggestions.map((a, i) => (
            <li
              key={a.iata}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(a); }}
            >
              <span className="tlp-ac-city">{a.city}</span>
              <span className="tlp-ac-sub">{a.country}</span>
              <span className="tlp-ac-code">{a.iata}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
