import React, { useState, useEffect } from "react";
import { AdminUser } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

interface DeleteUserDialogProps {
  user: AdminUser | null;
  onConfirm: (userId: string) => void;
  onCancel: () => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  user,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation("admin");
  const [isConfirming, setIsConfirming] = useState(false);

  // Reset the flag when dialog opens
  useEffect(() => {
    if (user) {
      setIsConfirming(false);
    }
  }, [user]);

  const handleConfirm = () => {
    if (user) {
      setIsConfirming(true);
      onConfirm(user.id);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isConfirming) {
      onCancel();
    }
    // Reset flag after dialog closes
    if (!open) {
      setIsConfirming(false);
    }
  };

  return (
    <AlertDialog open={!!user} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="rounded-[24px] border-none max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteUserQuestion")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteUserConfirm", { name: user?.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleConfirm}
          >
            {t("deleteUser")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
