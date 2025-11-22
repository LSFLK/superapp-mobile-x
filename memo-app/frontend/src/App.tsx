import { useState, useCallback } from 'react';
import { MemoProvider, useMemoContext } from './context/MemoContext';
import { Layout } from './components/layout/Layout';
import { FeedPage } from './pages/FeedPage';
import { SentPage } from './pages/SentPage';
import { ArchivePage } from './pages/ArchivePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ComposePage } from './pages/ComposePage';
import { MorePage } from './pages/MorePage';
import { GroupsPage } from './pages/GroupsPage';
import { TABS, TabType, UI_TEXT } from './constants';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TABS.RECEIVED);
  const {
    refreshReceived,
    refreshSent,
    loadingReceived,
    loadingSent,
    receivedMemos,
    favoriteMemoIds
  } = useMemoContext();

  // Navigation handler
  const handleTabSwitch = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    if (activeTab === TABS.RECEIVED) {
      refreshReceived();
    } else if (activeTab === TABS.SENT) {
      refreshSent();
    }
  }, [activeTab, refreshReceived, refreshSent]);

  // Back button handler
  const handleBack = useCallback(() => {
    setActiveTab(TABS.MORE);
  }, []);

  // Determine title and back button visibility
  let title: string = UI_TEXT.TAB_RECEIVED;
  let showBack = false;

  switch (activeTab) {
    case TABS.RECEIVED:
      title = UI_TEXT.TAB_RECEIVED;
      break;
    case TABS.SENT:
      title = 'Sent';
      showBack = true;
      break;
    case TABS.SEND:
      title = 'New Message';
      showBack = true;
      break;
    case TABS.ARCHIVE:
      title = 'Archive';
      showBack = true;
      break;
    case TABS.FAVORITES:
      title = UI_TEXT.TAB_FAVORITES;
      break;
    case TABS.MORE:
      title = UI_TEXT.TAB_MORE;
      break;
    case TABS.GROUPS:
      title = 'Groups';
      showBack = true;
      break;
  }

  // Determine if refreshing
  const isRefreshing = (activeTab === TABS.RECEIVED && loadingReceived) || (activeTab === TABS.SENT && loadingSent);

  // Render active page
  const renderContent = () => {
    switch (activeTab) {
      case TABS.RECEIVED:
        return <FeedPage />;
      case TABS.SENT:
        return <SentPage />;
      case TABS.ARCHIVE:
        return <ArchivePage />;
      case TABS.FAVORITES:
        return <FavoritesPage />;
      case TABS.SEND:
        return (
          <ComposePage
            onSuccess={() => {
              setActiveTab(TABS.SENT);
              // Refresh sent memos after a short delay to allow backend to process
              setTimeout(() => refreshSent(), 500);
            }}
          />
        );
      case TABS.MORE:
        return <MorePage onNavigate={handleTabSwitch} />;
      case TABS.GROUPS:
        return <GroupsPage />;
      default:
        return <FeedPage />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabSwitch={handleTabSwitch}
      onRefresh={activeTab === TABS.RECEIVED || activeTab === TABS.SENT ? handleRefresh : undefined}
      isRefreshing={isRefreshing}
      title={title}
      showBack={showBack}
      onBack={handleBack}
      receivedCount={receivedMemos.length}
      favoritesCount={favoriteMemoIds.size}
    >
      {renderContent()}
    </Layout>
  );
};

export default function App() {
  return (
    <MemoProvider>
      <AppContent />
    </MemoProvider>
  );
}
