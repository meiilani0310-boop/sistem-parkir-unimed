import React, { useMemo, useState } from "react";
import "./App.css";

const PARKING_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

const EDGE_PARKINGS = [1, 2, 7, 8];
const CENTER_PARKINGS = [3, 4, 5, 6];

const DIAGONAL_COUNT = 20;
const DIAGONAL_SLOTS = 3;
const STRAIGHT_SLOTS = 35;
const MIDDLE_ROWS = ["A", "B"]; // Baris A dan B untuk parkir tepi
const CENTER_ROWS = ["A", "B", "C", "D"];

// Status slot berupa simulasi
function getStatus(slotId) {
  let total = 0;
  for (let i = 0; i < slotId.length; i++) {
    total += slotId.charCodeAt(i) * (i + 1);
  }
  return total % 5 === 0 ? "occupied" : "available";
}

function createSlot(id, label, type) {
  return {
    id,
    label,
    type,
    status: getStatus(id),
  };
}

// Membuat slot parkir serong
function createDiagonalSlots(parkingNumber, position) {
  return Array.from({ length: DIAGONAL_COUNT }, (_, rowIndex) => {
    const rowNumber = rowIndex + 1;
    return Array.from({ length: DIAGONAL_SLOTS }, (_, slotIndex) => {
      const slotNumber = slotIndex + 1;
      const id = `P${parkingNumber}-${position}-S${rowNumber}-${slotNumber}`;
      return createSlot(id, slotNumber, "diagonal");
    });
  });
}

// Membuat baris lurus tengah A dan B
function createMiddleSlots(parkingNumber, rowLetter) {
  return Array.from({ length: STRAIGHT_SLOTS }, (_, index) => {
    const number = index + 1;
    return createSlot(
      `P${parkingNumber}-${rowLetter}${number}`,
      number,
      "straight"
    );
  });
}

// Membuat empat baris parkir lurus untuk Parkir 3–6
function createCenterRows(parkingNumber) {
  return CENTER_ROWS.map((rowLetter) => ({
    letter: rowLetter,
    slots: Array.from({ length: STRAIGHT_SLOTS }, (_, index) => {
      const number = index + 1;
      return createSlot(
        `P${parkingNumber}-${rowLetter}${number}`,
        number,
        "straight"
      );
    }),
  }));
}

// Membuat slot jalur samping
function createSideLaneSlots(startNumber = 1) {
  return Array.from({ length: 20 }, (_, index) => {
    const number = startNumber + index;
    return createSlot(`J${number}`, `J${number}`, "lane");
  });
}

// Komponen satu slot parkir
function Slot({ slot, searchedSlot, onSelect }) {
  const isSearched = searchedSlot === slot.id;

  return (
    <button
      type="button"
      id={slot.id} // ID Unik untuk keperluan Auto-Scroll
      className={[
        "parking-slot",
        `slot-${slot.status}`,
        `slot-${slot.type}`,
        isSearched ? "slot-searched" : "",
      ].join(" ")}
      title={`${slot.id} — ${
        slot.status === "available" ? "Tersedia" : "Terisi"
      }`}
      onClick={() => onSelect(slot)}
    >
      {slot.label}
    </button>
  );
}

// Tampilan parkir serong
function DiagonalParking({ parkingNumber, position, searchedSlot, onSelect }) {
  const rows = useMemo(
    () => createDiagonalSlots(parkingNumber, position),
    [parkingNumber, position]
  );

  return (
    <div className="diagonal-section">
      <div className="diagonal-grid">
        {rows.map((row, rowIndex) => (
          <div className="diagonal-column" key={rowIndex}>
            {row.map((slot) => (
              <Slot
                key={slot.id}
                slot={slot}
                searchedSlot={searchedSlot}
                onSelect={onSelect}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Tampilan baris lurus tengah A dan B
function MiddleStraightParking({ parkingNumber, rowLetter, searchedSlot, onSelect }) {
  const slots = useMemo(
    () => createMiddleSlots(parkingNumber, rowLetter),
    [parkingNumber, rowLetter]
  );

  return (
    <div className="straight-section">
      <h3 className="middle-row-heading">Baris Lurus {rowLetter}</h3>
      <div className="straight-grid">
        {slots.map((slot) => (
          <Slot
            key={slot.id}
            slot={slot}
            searchedSlot={searchedSlot}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

// Tampilan empat baris parkir lurus A–D
function CenterStraightParking({ parkingNumber, searchedSlot, onSelect }) {
  const rows = useMemo(
    () => createCenterRows(parkingNumber),
    [parkingNumber]
  );

  return (
    <div className="center-straight-section">
      {rows.map((row) => (
        <div className="center-row" key={row.letter}>
          <span className="center-row-label">{row.letter}</span>
          <div className="center-row-content">
            <div className="straight-grid">
              {row.slots.map((slot) => (
                <Slot
                  key={slot.id}
                  slot={slot}
                  searchedSlot={searchedSlot}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Kartu masing-masing area parkir
function ParkingCard({ parkingNumber, searchedSlot, onSelect }) {
  const isEdgeParking = EDGE_PARKINGS.includes(parkingNumber);

  return (
    <section className="parking-card">
      <h2>Parkir {parkingNumber}</h2>

      {isEdgeParking ? (
        <div className="edge-parking-layout">
          <DiagonalParking
            parkingNumber={parkingNumber}
            position="AT"
            searchedSlot={searchedSlot}
            onSelect={onSelect}
          />
          <MiddleStraightParking
            parkingNumber={parkingNumber}
            rowLetter="A"
            searchedSlot={searchedSlot}
            onSelect={onSelect}
          />
          <MiddleStraightParking
            parkingNumber={parkingNumber}
            rowLetter="B"
            searchedSlot={searchedSlot}
            onSelect={onSelect}
          />
          <DiagonalParking
            parkingNumber={parkingNumber}
            position="BW"
            searchedSlot={searchedSlot}
            onSelect={onSelect}
          />
        </div>
      ) : (
        <CenterStraightParking
          parkingNumber={parkingNumber}
          searchedSlot={searchedSlot}
          onSelect={onSelect}
        />
      )}
    </section>
  );
}

// Jalur samping
function SideLane({ side, slots, searchedSlot, onSelect }) {
  return (
    <aside className={`side-lane side-lane-${side}`}>
      {slots.map((slot) => (
        <div className="lane-slot-wrap" key={`${side}-${slot.id}`}>
          <Slot
            slot={slot}
            searchedSlot={searchedSlot}
            onSelect={onSelect}
          />
        </div>
      ))}
    </aside>
  );
}

export default function App() {
  const [searchText, setSearchText] = useState("");
  const [searchedSlot, setSearchedSlot] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Membuat seluruh slot pada area parkir
  const allSlots = useMemo(() => {
    const slots = [];
    PARKING_NUMBERS.forEach((parkingNumber) => {
      if (EDGE_PARKINGS.includes(parkingNumber)) {
        ["AT", "BW"].forEach((position) => {
          createDiagonalSlots(parkingNumber, position)
            .flat()
            .forEach((slot) => slots.push(slot));
        });

        MIDDLE_ROWS.forEach((rowLetter) => {
          createMiddleSlots(parkingNumber, rowLetter).forEach((slot) =>
            slots.push(slot)
          );
        });
      } else {
        createCenterRows(parkingNumber).forEach((row) => {
          row.slots.forEach((slot) => slots.push(slot));
        });
      }
    });
    return slots;
  }, []);

  const leftSideLaneSlots = useMemo(() => createSideLaneSlots(1), []);
  const rightSideLaneSlots = useMemo(() => createSideLaneSlots(21), []);

  const searchableSlots = useMemo(
    () => [...allSlots, ...leftSideLaneSlots, ...rightSideLaneSlots],
    [allSlots, leftSideLaneSlots, rightSideLaneSlots]
  );

  const allAvailableCount = searchableSlots.filter(
    (slot) => slot.status === "available"
  ).length;

  const allOccupiedCount = searchableSlots.length - allAvailableCount;

  // Function Pencarian Slot dengan Jeda 600ms
  function findSlot() {
    const query = searchText.trim().toUpperCase();

    if (!query) {
      setSearchMessage("Masukkan kode slot yang ingin dicari.");
      setSearchedSlot("");
      setSelectedSlot(null);
      return;
    }

    const found = searchableSlots.find(
      (slot) => slot.id.toUpperCase() === query
    );

    if (!found) {
      setSearchMessage(
        `Slot "${query}" tidak ditemukan. Periksa kembali kode slot.`
      );
      setSearchedSlot("");
      setSelectedSlot(null);
      return;
    }

    // Tampilkan informasi slot terlebih dahulu
    setSelectedSlot(found);
    setSearchMessage(
      `${found.id} — ${
        found.status === "available" ? "Tersedia (Hijau)" : "Terisi (Merah)"
      }`
    );

    // Jeda 600ms agar pengguna sempat membaca info sebelum layar bergulir
    setTimeout(() => {
      setSearchedSlot(found.id); // Aktifkan highlight kuning & animasi pulse
      const element = document.getElementById(found.id);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }, 600);
  }

  // Clear Input Search
  function handleClearSearch() {
    setSearchText("");
    setSearchedSlot("");
    setSelectedSlot(null);
    setSearchMessage("");
  }

  // Klik manual pada denah slot
  function handleSlotSelect(slot) {
    setSearchText(slot.id);
    setSearchedSlot("");
    setSelectedSlot(null);
    setSearchMessage(
      `Kode slot ${slot.id} telah dimasukkan ke pencarian. Klik "Cari Slot" untuk mencari.`
    );
  }

  return (
    <main className="app">
      <header className="hero">
        <div className="hero-title">
          <h1>Sistem Informasi Ketersediaan Slot Parkir</h1>
          <p>Area Parkir Depan Auditorium UNIMED</p>
          <span className="vehicle-badge">Kendaraan Roda Dua</span>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon blue">P</div>
            <div>
              <p>Total Slot</p>
              <strong>{searchableSlots.length}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon green">✓</div>
            <div>
              <p>Slot Tersedia</p>
              <strong className="green-text">{allAvailableCount}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon red">×</div>
            <div>
              <p>Slot Terisi</p>
              <strong className="red-text">{allOccupiedCount}</strong>
            </div>
          </div>
        </div>
      </header>

      <div className="content">
        {/* PENCARIAN SLOT */}
        <section className="search-panel">
          <div className="input-wrapper">
            <input
              type="text"
              value={searchText}
              placeholder="Cari slot, contoh: J1, P1-AT-S1-1, P1-BW-S1-1, P1-A10, P1-B10, P3-A20"
              onChange={(event) => setSearchText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  findSlot();
                }
              }}
            />
            {searchText && (
              <button
                type="button"
                className="clear-btn"
                onClick={handleClearSearch}
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>

          <button type="button" className="search-btn" onClick={findSlot}>
            Cari Slot
          </button>
        </section>

        {/* KETERANGAN WARNA */}
        <section className="legend-panel">
          <strong>Keterangan warna:</strong>

          <div className="legend-item">
            <span className="legend-color available" />
            Tersedia
          </div>

          <div className="legend-item">
            <span className="legend-color occupied" />
            Terisi
          </div>

          <div className="legend-item">
            <span className="legend-color searched" />
            Slot Dicari
          </div>
        </section>

        {/* HASIL PENCARIAN */}
        {searchMessage && (
          <div className="search-message">
            <strong>{searchMessage}</strong>
            {selectedSlot && (
              <p>
                Kode slot: <b>{selectedSlot.id}</b>
                {" · "}
                Status:{" "}
                <b>
                  {selectedSlot.status === "available" ? "Tersedia" : "Terisi"}
                </b>
              </p>
            )}
          </div>
        )}

        {/* ARTI CONTOH KODE SLOT */}
        <section className="code-guide">
          <h2>Arti Contoh Kode Slot</h2>
          <div className="code-guide-grid">
            <div>
              <code>J1</code>
              <p>
                <b>J</b> = jalur samping.
                <br />
                <b>1</b> = nomor slot.
              </p>
            </div>
            <div>
              <code>P1-AT-S1-1</code>
              <p>
                <b>P1</b> = area Parkir 1.
                <br />
                <b>AT</b> = serong atas.
                <br />
                <b>S1</b> = baris serong 1.
                <br />
                <b>1</b> = slot ke-1.
              </p>
            </div>
            <div>
              <code>P1-BW-S1-1</code>
              <p>
                <b>P1</b> = area Parkir 1.
                <br />
                <b>BW</b> = serong bawah.
                <br />
                <b>S1</b> = baris serong 1.
                <br />
                <b>1</b> = slot ke-1.
              </p>
            </div>
            <div>
              <code>P1-A10</code>
              <p>
                <b>P1</b> = area Parkir 1.
                <br />
                <b>A</b> = baris lurus A.
                <br />
                <b>10</b> = slot nomor 10.
              </p>
            </div>
            <div>
              <code>P1-B10</code>
              <p>
                <b>P1</b> = area Parkir 1.
                <br />
                <b>B</b> = baris lurus B.
                <br />
                <b>10</b> = slot nomor 10.
              </p>
            </div>
            <div>
              <code>P3-A20</code>
              <p>
                <b>P3</b> = area Parkir 3.
                <br />
                <b>A</b> = baris A.
                <br />
                <b>20</b> = slot nomor 20.
              </p>
            </div>
          </div>

          <p className="simulation-note">
            Catatan: data ketersediaan pada prototype ini masih berupa simulasi.
          </p>
        </section>

        {/* JALAN MASUK / KELUAR (ATAS) */}
        <div className="road-label road-label-top">
          <span />
          <strong> JALAN MASUK / KELUAR </strong>
          <span />
        </div>

        {/* AREA PARKIR UTAMA */}
        <div className="parking-area">
          <SideLane
            side="left"
            slots={leftSideLaneSlots}
            searchedSlot={searchedSlot}
            onSelect={handleSlotSelect}
          />

          <div className="parking-grid">
            {PARKING_NUMBERS.map((parkingNumber) => (
              <ParkingCard
                key={parkingNumber}
                parkingNumber={parkingNumber}
                searchedSlot={searchedSlot}
                onSelect={handleSlotSelect}
              />
            ))}
          </div>

          <SideLane
            side="right"
            slots={rightSideLaneSlots}
            searchedSlot={searchedSlot}
            onSelect={handleSlotSelect}
          />
        </div>

        {/* JALAN MASUK / KELUAR (BAWAH) */}
        <div className="road-label road-label-bottom">
          <span />
          <strong> JALAN MASUK / KELUAR </strong>
          <span />
        </div>
      </div>
    </main>
  );
}