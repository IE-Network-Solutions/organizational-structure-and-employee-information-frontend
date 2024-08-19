import create from 'zustand';
import { Branch } from '@/store/server/features/organizationStructure/branchs/interface';

interface BranchStore {
  formOpen: boolean;
  editingBranch: Branch | null;
  selectedBranch: Branch | null;
  deleteModalVisible: boolean;
  branchToDelete: Branch | null;
  setFormOpen: (open: boolean) => void;
  setEditingBranch: (branch: Branch | null) => void;
  setSelectedBranch: (branch: Branch | null) => void;
  setDeleteModalVisible: (visible: boolean) => void;
  setBranchToDelete: (branch: Branch | null) => void;
}

export const useBranchStore = create<BranchStore>((set) => ({
  formOpen: false,
  editingBranch: null,
  selectedBranch: null,
  deleteModalVisible: false,
  branchToDelete: null,
  setFormOpen: (open) => set({ formOpen: open }),
  setEditingBranch: (branch) => set({ editingBranch: branch }),
  setSelectedBranch: (branch) => set({ selectedBranch: branch }),
  setDeleteModalVisible: (visible) => set({ deleteModalVisible: visible }),
  setBranchToDelete: (branch) => set({ branchToDelete: branch }),
}));
