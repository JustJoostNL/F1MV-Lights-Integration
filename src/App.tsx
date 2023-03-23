import Update from '@/components/update'
import ButtonAppBar from './components/navbar'
import './App.scss'

console.log('[App.tsx]', `Hello world from Electron ${process.versions.electron}!`)

function App() {
  return (
    <div>
        <ButtonAppBar/>
        {/*<Update/>*/}
    </div>
  )
}

export default App
