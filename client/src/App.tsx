import Scene from './sim/Scene'
import Dashboard from './dashboard/Dashboard'
import TitleBar from './dashboard/TitleBar'
import './kinematics/solverTwin'

function App() {
  return (
    <div id="app">
      <Scene />
      <TitleBar />
      <Dashboard />
    </div>
  )
}

export default App
