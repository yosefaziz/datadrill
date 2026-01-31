import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { HomePage } from '@/pages/HomePage';
import { SkillPage } from '@/pages/SkillPage';
import { QuestionPage } from '@/pages/QuestionPage';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:skill" element={<SkillPage />} />
            <Route path="/:skill/question/:id" element={<QuestionPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
