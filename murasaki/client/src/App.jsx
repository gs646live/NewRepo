import { BrowserRouter, Route, Routes } from 'react-router';
import { UserProvider } from './context/UserContext.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LevelSelect from './pages/LevelSelect.jsx';
import Quiz from './pages/Quiz.jsx';
import Study from './pages/Study.jsx';
import Progress from './pages/Progress.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="progress" element={<Progress />} />
            <Route path=":alphabet" element={<LevelSelect />} />
            <Route path=":alphabet/:level" element={<Quiz />} />
            <Route path=":alphabet/:level/study" element={<Study />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
