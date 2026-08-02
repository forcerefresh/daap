import { useState } from "react";

type UseConfirmDeleteResult = {
  isOpen: boolean;
  isLoading: boolean;
  pendingId: string | null;
  requestDelete: (id: string) => void;
  confirmDelete: (deleteFn: () => Promise<void>) => void;
  cancelDelete: () => void;
};

export function useConfirmDelete(): UseConfirmDeleteResult {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const requestDelete = (id: string) => {
    setPendingId(id);
    setIsOpen(true);
  };

  const confirmDelete = (deleteFn: () => Promise<void>) => {
    setIsLoading(true);
    deleteFn().then(() => {
      setIsOpen(false);
      setIsLoading(false);
      setPendingId(null);
    });
  };

  const cancelDelete = () => {
    setIsOpen(false);
    setIsLoading(false);
    setPendingId(null);
  };

  return { isOpen, isLoading, pendingId, requestDelete, confirmDelete, cancelDelete };
}
