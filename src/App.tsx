import Scene from './components/Scene'

function App() {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      <Scene />
    </div>
  )
}

export default App