import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { ClientsPage } from './pages/ClientsPage';
import { TrainingPage } from './pages/TrainingPage';
import { SettingsPage } from './pages/SettingsPage';
import { PresentationWizard } from './components/PresentationWizard';
import { IdeaToPptx } from './components/IdeaToPptx';

function WizardWrapper() {
  const navigate = useNavigate();
  return <PresentationWizard onClose={() => navigate('/')} />;
}

function IdeaToPptxWrapper() {
  const navigate = useNavigate();
  return <IdeaToPptx onClose={() => navigate('/')} />;
}

function AppLayout() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-phantom-50 to-phantom-100/50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/wizard" element={<WizardWrapper />} />
          <Route path="/idea-to-pptx" element={<IdeaToPptxWrapper />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
