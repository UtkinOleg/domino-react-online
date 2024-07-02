export const loadState = () => {
  // We need the try block because user may not permit our accessing localStorage.
  try {
    const serializedState = localStorage.getItem('state')
    if (serializedState === null) { // The key 'state' does not exist.
      return undefined // Let our reducer initialize the app.
    }
    return JSON.parse(serializedState)
  } catch (error) {
    console.log(error)
    return undefined // Let our reducer initialize the app.
  }
}

export const saveState = (state) => {
  try {
    // Serialize the state. Redux store is recommended to be serializable.
    const serializedState = JSON.stringify(state)
    localStorage.setItem('state', serializedState)
  } catch (error) {
    console.log(error)
  }
}

export const clearState = () => {
  try {
    localStorage.removeItem('state')
  } catch (error) {
    console.log(error)
  }
}

export const loadStateOnline = () => {
  // We need the try block because user may not permit our accessing localStorage.
  try {
    const serializedState = localStorage.getItem('state_online')
    if (serializedState === null) { // The key 'state' does not exist.
      return undefined // Let our reducer initialize the app.
    }
    return JSON.parse(serializedState)
  } catch (error) {
    console.log(error)
    return undefined // Let our reducer initialize the app.
  }
}

export const saveStateOnline = (state) => {
  try {
    // Serialize the state. Redux store is recommended to be serializable.
    const serializedState = JSON.stringify(state)
    localStorage.setItem('state_online', serializedState)
  } catch (error) {
    console.log(error)
  }
}

export const clearStateOnline = () => {
  try {
    localStorage.removeItem('state_online')
  } catch (error) {
    console.log(error)
  }
}
