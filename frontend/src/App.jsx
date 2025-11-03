import { useState, useEffect } from 'react'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then(response => response.json())
      .then(data => {
        setMessage(data.message)
      })
      .catch(error => {
        setMessage('Error connecting to API')
        console.error(error)
      })
  }, [])

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Hello World</h1>
      <p>{message}</p>
    </div>
  )
}

export default App