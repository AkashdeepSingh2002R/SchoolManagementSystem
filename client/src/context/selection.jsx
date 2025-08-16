import { createContext, useContext, useState } from 'react'
export const SelectionCtx = createContext(null)
export function SelectionProvider({ children }){
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  return (
    <SelectionCtx.Provider value={{ selectedClassId, setSelectedClassId, selectedStudentId, setSelectedStudentId, selectedTeacherId, setSelectedTeacherId }}>
      {children}
    </SelectionCtx.Provider>
  )
}
export const useSelection = () => useContext(SelectionCtx)
