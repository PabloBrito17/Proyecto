import { createContext, useContext, useState, useEffect } from 'react'

const TerritoryContext = createContext(null)

export function TerritoryProvider({ children }) {
  const [territorios, setTerritorios] = useState([])
  const [territorioActual, setTerritorioActual] = useState(1)

  useEffect(() => {
    fetch('/api/territorios').then(r => r.json()).then(setTerritorios).catch(() => setTerritorios([]))
  }, [])

  return (
    <TerritoryContext.Provider value={{ territorios, territorioActual, setTerritorioActual }}>
      {children}
    </TerritoryContext.Provider>
  )
}

export function useTerritorio() {
  return useContext(TerritoryContext)
}
