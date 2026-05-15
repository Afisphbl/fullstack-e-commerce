import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  MailOpen,
  Archive,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Clock,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  fetchAdminMessages,
  markMessageAsRead,
  archiveMessage,
  deleteMessage,
  ContactMessage,
  MessageStatus,
} from "@/lib/api";

const STATUS_COLORS: Record<MessageStatus, string> = {
  unread: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  read: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  archived: "bg-muted text-muted-foreground",
};

const STATUS_ICONS: Record<MessageStatus, React.ReactNode> = {
  unread: <Mail className="h-3.5 w-3.5" />,
  read: <MailOpen className="h-3.5 w-3.5" />,
  archived: <Archive className="h-3.5 w-3.5" />,
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminMessagesPage = () => {
  const { t } = useTranslation(["admin", "common"]);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const limit = 10;

  const queryParams: Record<string, string | number> = {
    page,
    limit,
    sort: "-createdAt",
  };
  if (statusFilter && statusFilter !== "all") queryParams.status = statusFilter;
  if (search.trim()) queryParams.search = search.trim();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-messages", page, statusFilter, search],
    queryFn: () => fetchAdminMessages(queryParams),
    refetchInterval: 60000,
  });

  const messages = data?.messages || [];
  const total = data?.total || 0;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const countsByStatus = data?.countsByStatus || {
    unread: 0,
    read: 0,
    archived: 0,
  };
  const unreadCount = countsByStatus.unread;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    queryClient.invalidateQueries({ queryKey: ["unreadMessagesCount"] });
  };

  const readMutation = useMutation({
    mutationFn: (id: string) => markMessageAsRead(id),
    onSuccess: () => {
      toast.success(t("admin:messages.markedAsRead"));
      invalidate();
    },
    onError: () => toast.error(t("admin:messages.failedToMarkRead")),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveMessage(id),
    onSuccess: () => {
      toast.success(t("admin:messages.messageArchived"));
      invalidate();
    },
    onError: () => toast.error(t("admin:messages.failedToArchive")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: () => {
      toast.success(t("admin:messages.messageDeleted"));
      setDeleteTarget(null);
      if (sheetOpen) setSheetOpen(false);
      invalidate();
    },
    onError: () => toast.error(t("admin:messages.failedToDelete")),
  });

  const openDetails = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setSheetOpen(true);
    if (msg.status === "unread") {
      readMutation.mutate(msg._id);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            {t("admin:messages.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {total === 1
              ? t("admin:messages.subtitle_one", { count: total })
              : t("admin:messages.subtitle_other", { count: total })}
            {unreadCount > 0 && (
              <span className="font-semibold text-primary">
                {" "}
                {t("admin:messages.unreadBadge", { count: unreadCount })}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-xl gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          {t("admin:messages.refresh")}
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {(["unread", "read", "archived"] as MessageStatus[]).map((s) => {
          const count = countsByStatus[s];
          return (
            <button
              key={s}
              onClick={() =>
                setStatusFilter((prev) => (prev === s ? "all" : s))
              }
              className={`flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all hover:shadow-sm ${
                statusFilter === s
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <span className="flex items-center gap-2">
                {STATUS_ICONS[s]}
                <span className="text-xs font-medium capitalize text-muted-foreground">
                  {t(`admin:messages.${s}`)}
                </span>
              </span>
              <span className="text-2xl font-bold text-foreground">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t("admin:messages.searchPlaceholder")}
            className="pl-9 rounded-xl"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px] rounded-xl">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder={t("admin:messages.filterStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("admin:messages.allStatuses")}
            </SelectItem>
            <SelectItem value="unread">{t("admin:messages.unread")}</SelectItem>
            <SelectItem value="read">{t("admin:messages.read")}</SelectItem>
            <SelectItem value="archived">
              {t("admin:messages.archived")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-card">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-muted/60"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {t("admin:messages.failedToLoad")}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              {t("admin:common.tryAgain")}
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Mail className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-lg font-medium text-foreground">
              {t("admin:messages.noMessages")}
            </p>
            <p className="text-sm text-muted-foreground">
              {statusFilter !== "all" || search
                ? t("admin:messages.adjustFilters")
                : t("admin:messages.noMessagesHint")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] md:min-w-0 text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-muted/30">
                  <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">
                    {t("admin:messages.sender")}
                  </th>
                  <th className="hidden px-5 py-3.5 text-left font-medium text-muted-foreground md:table-cell">
                    {t("admin:messages.subject")}
                  </th>
                  <th className="hidden px-5 py-3.5 text-left font-medium text-muted-foreground lg:table-cell">
                    {t("admin:messages.time")}
                  </th>
                  <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">
                    {t("admin:messages.status")}
                  </th>
                  <th className="px-5 py-3.5 text-right font-medium text-muted-foreground">
                    {t("admin:messages.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {messages.map((msg) => (
                  <tr
                    key={msg._id}
                    className={`group transition-colors hover:bg-muted/30 ${
                      msg.status === "unread" ? "bg-primary/[0.02]" : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                          {msg.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`font-medium text-foreground truncate ${msg.status === "unread" ? "font-semibold" : ""}`}
                          >
                            {msg.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {msg.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <p className="truncate max-w-[240px] text-foreground">
                        {msg.subject}
                      </p>
                      <p className="truncate max-w-[240px] text-xs text-muted-foreground mt-0.5">
                        {msg.message.substring(0, 60)}
                        {msg.message.length > 60 ? "..." : ""}
                      </p>
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Clock className="h-3 w-3" />
                        {formatDate(msg.createdAt)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[msg.status]}`}
                      >
                        {STATUS_ICONS[msg.status]}
                        <span className="capitalize">
                          {t(`admin:messages.${msg.status}`)}
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          title={t("admin:messages.viewMessage")}
                          onClick={() => openDetails(msg)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {msg.status !== "read" && msg.status !== "archived" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            title={t("admin:messages.markAsRead")}
                            onClick={() => readMutation.mutate(msg._id)}
                            disabled={readMutation.isPending}
                          >
                            <MailOpen className="h-4 w-4" />
                          </Button>
                        )}
                        {msg.status !== "archived" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            title={t("admin:messages.archive")}
                            onClick={() => archiveMutation.mutate(msg._id)}
                            disabled={archiveMutation.isPending}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                          title={t("admin:messages.delete")}
                          onClick={() => setDeleteTarget(msg)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && messages.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {t("admin:messages.page", {
              page,
              total: totalPages,
              count: total,
            })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Message Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedMessage && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl font-display">
                  {selectedMessage.subject}
                </SheetTitle>
                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[selectedMessage.status]}`}
                >
                  {STATUS_ICONS[selectedMessage.status]}
                  <span className="capitalize">
                    {t(`admin:messages.${selectedMessage.status}`)}
                  </span>
                </span>
              </SheetHeader>

              {/* Sender Info */}
              <div className="mb-6 rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {selectedMessage.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("admin:messages.contactPerson")}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="hover:text-primary transition-colors"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary" />
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    {formatDate(selectedMessage.createdAt)}
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("admin:messages.message")}
                </p>
                <div className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="default" className="rounded-xl flex-1">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                  >
                    <Mail className="mr-2 h-4 w-4" />{" "}
                    {t("admin:messages.reply")}
                  </a>
                </Button>
                {selectedMessage.status !== "archived" && (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      archiveMutation.mutate(selectedMessage._id);
                      setSheetOpen(false);
                    }}
                    disabled={archiveMutation.isPending}
                  >
                    <Archive className="mr-2 h-4 w-4" />{" "}
                    {t("admin:messages.archive")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="rounded-xl text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
                  onClick={() => setDeleteTarget(selectedMessage)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />{" "}
                  {t("admin:messages.delete")}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin:messages.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin:messages.deleteDescription", {
                name: deleteTarget?.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common:buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget._id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? t("common:buttons.loading")
                : t("admin:messages.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMessagesPage;
