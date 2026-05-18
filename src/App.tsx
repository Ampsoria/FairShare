import { AnimatePresence, motion } from 'motion/react';
import { useStore } from './store';
import Onboarding from './pages/Onboarding';
import WorkspaceList from './pages/WorkspaceList';
import WorkspaceSetup from './pages/WorkspaceSetup';
import TaskInput from './pages/TaskInput';
import ReviewDraft from './pages/ReviewDraft';
import Dashboard from './pages/Dashboard';
import ThemeToggle from './components/ThemeToggle';
import Particles from './components/Particles';
import Credit from './components/Credit';

const PAGES = {
  onboarding: Onboarding,
  list: WorkspaceList,
  setup: WorkspaceSetup,
  tasks: TaskInput,
  review: ReviewDraft,
  dashboard: Dashboard,
} as const;

export default function App() {
  const step = useStore((s) => s.step);
  const Page = PAGES[step];

  return (
    <>
      <Particles />
      <ThemeToggle />
      <Credit />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Page />
        </motion.div>
      </AnimatePresence>
    </>
  );
}
