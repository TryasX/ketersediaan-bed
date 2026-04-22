import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [pages, setPages] = useState([]) // Sekarang kita simpen per "Halaman"
  const [uniqueClasses, setUniqueClasses] = useState([]) // Buat indikator titik di bawah
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [time, setTime] = useState(new Date())

  const MAX_CARDS = 10; // Pas 10 kartu biar bentuknya rapi 5 atas 5 bawah

  // FUNGSI: Tarik Data & Potong jadi beberapa Halaman (Swipe)
  const fetchBedData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/bed')
      const rawData = response.data?.data

      if (!Array.isArray(rawData)) {
        setIsLoading(false)
        return
      }

      // 1. Grupkan berdasarkan Kelas
      const initialGroups = rawData.reduce((acc, curr) => {
        if (!acc[curr.Kelas]) acc[curr.Kelas] = []
        acc[curr.Kelas].push(curr)
        return acc
      }, {})

      // 2. Pecah jadi Halaman (Pages)
      const newPages = [];
      Object.keys(initialGroups).forEach(kelas => {
        const rooms = initialGroups[kelas];
        for (let i = 0; i < rooms.length; i += MAX_CARDS) {
          newPages.push({
            kelas: kelas, // Nama kelas aslinya tetep disimpen
            rooms: rooms.slice(i, i + MAX_CARDS) // Diambil per 10 data
          });
        }
      });

      setPages(newPages)
      setUniqueClasses(Object.keys(initialGroups)) // Simpen nama kelas unik buat footer
      setIsLoading(false)
    } catch (error) {
      console.error("Gagal narik data:", error)
      setIsLoading(false)
    }
  }

  // EFEK: Auto-Refresh Data & Jam
  useEffect(() => {
    fetchBedData()
    const apiInterval = setInterval(() => fetchBedData(), 30000)
    const clockInterval = setInterval(() => setTime(new Date()), 1000)
    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'
    return () => {
      clearInterval(apiInterval)
      clearInterval(clockInterval)
    }
  }, [])

  // EFEK: Auto-Slide (Ganti Halaman)
  useEffect(() => {
    if (pages.length > 0) {
      const slideInterval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === pages.length - 1 ? 0 : prevIndex + 1
        )
      }, 8000) // Animasi swipe tiap 8 detik
      return () => clearInterval(slideInterval)
    }
  }, [pages])

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#F8FAFC', color: '#0284C7' }}>
        <motion.h2 animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          Menyiapkan Dashboard...
        </motion.h2>
      </div>
    )
  }

  if (pages.length === 0) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Data Kosong</div>

  const currentPage = pages[currentIndex];
  const currentClass = currentPage.kelas;
  const currentRooms = currentPage.rooms;
  const bgImage = "bg.png"

  // KUNCI ANIMASI SWIPE UP KAYAK DI SCROLL
  const containerVariants = {
    hidden: { y: 200, opacity: 0 }, // Kartu baru datang dari bawah (y: 200)
    show: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", bounce: 0.3, staggerChildren: 0.05 }
    },
    exit: {
      y: -200, // Kartu lama ngacir ke atas (y: -200) kaya discroll
      opacity: 0,
      transition: { duration: 0.4 }
    }
  }

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      boxSizing: 'border-box',
      backgroundImage: `url('${bgImage}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', inset: 0 }}></div>

      {/* HEADER STATIC (Nggak Ikut Gerak Pas Di-Scroll) */}
      <header style={{
        position: 'relative',
        zIndex: 1,
        padding: '20px 40px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderBottom: '2px solid rgba(2, 132, 199, 0.2)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Logo RS" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        {/* NAMA KELAS TETAP STAY, CUMA GANTI KALAU KELASNYA BEDA */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#0284C7', fontWeight: '700', letterSpacing: '2px' }}>INFORMASI KETERSEDIAAN KAMAR RAWAT INAP</p>
          <motion.h1
            key={currentClass} // Animasi cuma jalan kalau nama Kelas-nya berubah
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ margin: '0', fontSize: '2.5rem', fontWeight: '900', color: '#0F172A', letterSpacing: '1px' }}
          >
            KELAS {currentClass}
          </motion.h1>
        </div>

        <div style={{ textAlign: 'right', color: '#0F172A' }}>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: '#0284C7' }}>
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>
            {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </header>

      {/* AREA KARTU (YANG MENGALAMI ANIMASI SWIPE UP) */}
      <main style={{
        position: 'relative',
        zIndex: 1,
        flex: 1,
        padding: '15px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden' // Biar pas kartunya naik nggak keluar layar/header
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex} // Key-nya pakai Index Halaman biar ke-trigger animasinya
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              width: '100%',
              maxWidth: '1400px',
              alignContent: 'center'
            }}
          >
            {currentRooms.map((ruangan, idx) => {
              const isAvailable = ruangan.Tersedia > 0;
              return (
                <motion.div
                  variants={cardVariants}
                  whileHover={{ scale: 1.05 }}
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    padding: '15px',
                    boxShadow: '0 8px 25px rgba(2, 132, 199, 0.1)',
                    border: '1px solid rgba(2, 132, 199, 0.15)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 10px 0', color: '#0F172A', textAlign: 'center', borderBottom: '2px solid #F1F5F9', paddingBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ruangan.Ruangan}
                  </h3>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>KAPASITAS</p>
                      <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#334155' }}>{ruangan["Jumlah Bed"]}</p>
                    </div>
                    <div style={{ width: '1px', backgroundColor: '#E2E8F0', margin: '0 5px' }}></div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>TERISI</p>
                      <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#F59E0B' }}>{ruangan.Terisi}</p>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: isAvailable ? '#ECFDF5' : '#FEF2F2',
                    border: `1px solid ${isAvailable ? '#6EE7B7' : '#FCA5A5'}`,
                    borderRadius: '10px',
                    padding: '8px',
                    textAlign: 'center',
                    marginTop: 'auto',
                  }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: isAvailable ? '#059669' : '#E11D48', fontWeight: '700' }}>
                      {isAvailable ? 'SISA BED' : 'SISA BED'}
                    </p>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: isAvailable ? '#10B981' : '#E11D48', lineHeight: '1' }}>
                      {isAvailable ? `${ruangan.Tersedia} BED` : 'TIDAK TERSEDIA'}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* SMART FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, padding: '15px', display: 'flex', justifyContent: 'center', gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
        {uniqueClasses.map((cls, idx) => {
          const isActive = cls === currentClass; // Titik nyala selama kelasnya sama!
          return (
            <motion.div
              key={idx}
              animate={{ width: isActive ? '15px' : '5px', backgroundColor: isActive ? '#0284C7' : '#94A3B8' }}
              style={{ height: '6px', borderRadius: '4px' }}
            />
          )
        })}
      </footer>
    </div>
  )
}

export default App