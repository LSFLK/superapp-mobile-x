import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { usePaySlips } from "./hooks/usePaySlips";
import { useUsers } from "./hooks/useUsers";
import { PaySlipList } from "./views/PaySlipList";
import { AllUsersView } from "./views/AllUsersView";
import { AdminUserDetailView } from "./views/AdminUserDetailView";
import { AdminPaySlipList } from "./views/AdminPaySlipList";
import { UploadModal } from "./components/UploadModal";
import { Modal, Button } from "./components/UI.tsx";
import { User } from "./types";
import { api } from "./api/client";
import {
  Loader2,
  AlertTriangle,
  Users,
  FileText,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

type View = "list" | "admin-users" | "admin-user-detail";

const App: React.FC = () => {
  const {
    user,
    token,
    isAdmin,
    loading: authLoading,
    error: authError,
  } = useAuth();
  const {
    payslips,
    loading: payslipsLoading,
    error: payslipsError,
    refresh: refreshPayslips,
  } = usePaySlips({
    token,
    isAdmin,
  });

  // Admin-only hooks
  const {
    users,
    loading: usersLoading,
    error: usersError,
    refresh: refreshUsers,
  } = useUsers({
    token,
    isAdmin,
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingPayslip, setDeletingPayslip] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [uploadTargetUserId, setUploadTargetUserId] = useState<
    string | undefined
  >();
  const {
    payslips: userPayslips,
    loading: userPayslipsLoading,
    error: userPayslipsError,
    refresh: refreshUserPayslips,
  } = usePaySlips({
    token,
    isAdmin,
    userId: selectedUser?.id || null,
  });

  const [currentView, setCurrentView] = useState<View>("list");

  const openDeleteConfirm = (id: string) => {
    setDeleteError(null);
    setDeleteConfirmId(id);
  };

  const closeDeleteConfirm = () => {
    if (deletingPayslip) return;
    setDeleteConfirmId(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!token || !deleteConfirmId) return;

    try {
      setDeletingPayslip(true);
      setDeleteError(null);
      await api.deletePayslip(token, deleteConfirmId);
      await refreshUserPayslips();
      await refreshPayslips();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Failed to delete pay slip:", error);
      setDeleteError("Failed to delete pay slip. Please try again.");
    } finally {
      setDeletingPayslip(false);
    }
  };

  // Handle the two-step upload process
  const handleUpload = async (data: {
    userId: string;
    month: number;
    year: number;
    file: File;
  }) => {
    if (!token) throw new Error("No authentication token");

    // Step 1: Upload file to backend via /api/upload
    const { fileUrl } = await api.uploadFile(token, data.file);

    // Step 2: Create pay slip record with metadata
    await api.createPayslip(token, {
      userId: data.userId,
      month: data.month,
      year: data.year,
      fileUrl,
    });

    // Always refresh the global payslip list so "All pay slips" stays up-to-date.
    await refreshPayslips();

    // If we're currently viewing a specific user's detail, refresh that list too.
    if (selectedUser?.id === data.userId) {
      await refreshUserPayslips();
    }
  };

  // Set initial view based on user role
  React.useEffect(() => {
    if (user?.role === "admin") {
      setCurrentView("admin-users");
    } else {
      setCurrentView("list");
    }
  }, [user?.role]);

  // Loading state: auth not ready
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary-600 w-8 h-8 mx-auto mb-4" />
          <p className="text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state: auth failed
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-slate-600 text-sm mb-4">{authError}</p>
          <p className="text-slate-500 text-xs">
            Please ensure you have a valid token and the backend is running.
          </p>
        </div>
      </div>
    );
  }

  // Error state: not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Not Authenticated
          </h2>
          <p className="text-slate-600 text-sm">
            Please log in through the super app to continue.
          </p>
        </div>
      </div>
    );
  }

  // Main app render
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900 text-white px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentView === "admin-user-detail" && (
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setCurrentView("admin-users");
                  }}
                  className="text-slate-300 hover:text-white"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-lg font-bold">
                {currentView === "admin-users" && "Pay Slip"}
                {currentView === "admin-user-detail" && selectedUser?.email}
                {currentView === "list" &&
                  (user?.role === "admin" ? "All Pay Slips" : "My Pay Slips")}
              </h1>
            </div>
            {currentView === "list" && user?.role === "admin" && (
              <button
                onClick={refreshPayslips}
                className="text-slate-300 hover:text-white"
                aria-label="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {currentView === "admin-users" && (
            <AllUsersView
              users={users}
              loading={usersLoading}
              error={usersError}
              onRetry={refreshUsers}
              onSelectUser={(u) => {
                setSelectedUser(u);
                setCurrentView("admin-user-detail");
              }}
            />
          )}

          {currentView === "admin-user-detail" && selectedUser && (
            <AdminUserDetailView
              user={selectedUser}
              payslips={userPayslips}
              loading={userPayslipsLoading}
              error={userPayslipsError}
              onRetry={refreshUserPayslips}
              onUpload={() => {
                setUploadTargetUserId(selectedUser.id);
                setShowUploadModal(true);
              }}
              onDeletePayslip={(id) => {
                openDeleteConfirm(id);
              }}
            />
          )}

          {currentView === "list" && user?.role === "admin" && (
            <AdminPaySlipList
              payslips={payslips}
              loading={payslipsLoading}
              error={payslipsError}
              onRetry={refreshPayslips}
            />
          )}

          {currentView === "list" && user?.role !== "admin" && (
            <PaySlipList
              payslips={payslips}
              loading={payslipsLoading}
              error={payslipsError}
              onRetry={refreshPayslips}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        {user?.role === "admin" ? (
          <div className="sticky bottom-0 z-20 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-around">
            <button
              onClick={() => {
                setSelectedUser(null);
                setCurrentView("admin-users");
              }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                currentView === "admin-users"
                  ? "text-primary-600 bg-primary-50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs">Users</span>
            </button>
            <button
              onClick={() => setCurrentView("list")}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                currentView === "list"
                  ? "text-primary-600 bg-primary-50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs">Pay Slips</span>
            </button>
          </div>
        ) : (
          <div className="sticky bottom-0 z-20 bg-white border-t border-slate-200 px-4 py-3 flex justify-center">
            <button
              onClick={() => setCurrentView("list")}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-primary-600 bg-primary-50"
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs">Pay Slips</span>
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        users={users}
        payslips={uploadTargetUserId && selectedUser ? userPayslips : payslips}
        preselectedUserId={uploadTargetUserId}
        onClose={() => {
          setShowUploadModal(false);
          setUploadTargetUserId(undefined);
        }}
        onUpload={handleUpload}
      />

      <Modal
        isOpen={!!deleteConfirmId}
        onClose={closeDeleteConfirm}
        title="Delete Pay Slip"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete this pay slip? This action cannot be
            undone.
          </p>

          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{deleteError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={closeDeleteConfirm}
              disabled={deletingPayslip}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deletingPayslip}
              className="flex-1"
            >
              {deletingPayslip ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
