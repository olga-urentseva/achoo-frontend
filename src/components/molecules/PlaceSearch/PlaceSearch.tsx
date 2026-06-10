import { useEffect, useId, useRef, useState } from "react";
import searchPlaces from "../../../api/searchPlaces";
import { useDebounced } from "../../../hooks/useDebounced";
import { Input } from "../../atoms/Input/Input";
import type { Place } from "../../../types";
import styles from "./PlaceSearch.module.css";

interface Props {
  onSelect: (place: Place) => void;
  /** Pre-fill the box with this place's label (e.g. a restored location). */
  initialPlace?: Place | null;
}

/** "City, Admin1, Country" — shown in the dropdown and as the picked value. */
function placeLabel(p: Place): string {
  return `${p.name}${p.admin1 ? `, ${p.admin1}` : ""}, ${p.country}`;
}

export function PlaceSearch({ onSelect, initialPlace }: Props) {
  const [query, setQuery] = useState(
    initialPlace ? placeLabel(initialPlace) : "",
  );
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  // The restored label seeds the box but isn't a search — only look up once the
  // user edits it, so a pre-filled location doesn't fire a query on every load.
  const edited = useRef(false);
  const listId = useId();

  const debounced = useDebounced(query, 250);

  useEffect(() => {
    if (!edited.current) return;
    const q = debounced.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    searchPlaces(q)
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
    setQuery(placeLabel(place));
    setOpen(false);
  }

  const showList = open && results.length > 0;

  return (
    <div className={styles.search} ref={boxRef}>
      <Input
        placeholder="Start typing your city…"
        value={query}
        onChange={(e) => {
          edited.current = true;
          setQuery(e.target.value);
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
      />
      {loading && <span className={styles.hint}>searching…</span>}

      {showList && (
        <ul className={styles.dropdown} id={listId} role="listbox">
          {results.map((p) => {
            const rollsUp = p.region.name !== p.name;
            return (
              <li
                key={p.placeId}
                className={styles.option}
                role="option"
                aria-selected={false}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(p);
                }}
              >
                <span className={styles.optionPlace}>{placeLabel(p)}</span>
                {rollsUp && (
                  <span className={styles.optionRegion}>→ {p.region.name}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
