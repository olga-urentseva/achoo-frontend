import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import type { Place } from "../api/types";
import { useDebounced } from "../hooks/useDebounced";

interface Props {
  onSelect: (place: Place) => void;
}

export function PlaceSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const debounced = useDebounced(query, 250);

  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    api
      .searchPlaces(q)
      .then((r) => {
        if (cancelled) return;
        setResults(r);
        setOpen(true);
      })
      .catch(() => !cancelled && setResults([]))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pick(place: Place) {
    onSelect(place);
    setQuery(place.name);
    setOpen(false);
  }

  return (
    <div className="search" ref={boxRef}>
      <input
        className="input"
        placeholder="Start typing your city…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        autoComplete="off"
      />
      {loading && <span className="search-hint">searching…</span>}

      {open && results.length > 0 && (
        <ul className="dropdown">
          {results.map((p) => {
            const rollsUp = p.region.name !== p.name;
            return (
              <li
                key={p.placeId}
                className="option"
                onMouseDown={() => pick(p)}
              >
                <span className="option-place">
                  {p.name}
                  {p.admin1 ? `, ${p.admin1}` : ""}, {p.country}
                </span>
                {rollsUp && (
                  <span className="option-region">→ {p.region.name}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
