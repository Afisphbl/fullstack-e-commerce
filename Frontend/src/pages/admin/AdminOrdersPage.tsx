import { useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchOrders, Order, updateOrder } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { formatCurrency } from "@/lib/formatters";

const AdminOrdersPage = () => {
  const { t } = useTranslation(["admin", "common"]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: fetchOrders,
  });

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrder(id, { orderStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      toast.success(t("admin:orders.statusUpdated"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("admin:orders.statusUpdateFailed"));
    },
  });

  if (isError) {
    return (
      <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-lg">
        <h2 className="text-lg font-bold text-destructive mb-2">
          {t("admin:orders.errorTitle")}
        </h2>
        <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["adminOrders"] })
          }
        >
          {t("admin:common.tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-foreground">
          {t("admin:orders.title")} ({filteredOrders.length})
        </h1>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("admin:orders.filterPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin:orders.allOrders")}</SelectItem>
              <SelectItem value="placed">
                {t("admin:orders.statuses.placed")}
              </SelectItem>
              <SelectItem value="processing">
                {t("admin:orders.statuses.processing")}
              </SelectItem>
              <SelectItem value="shipped">
                {t("admin:orders.statuses.shipped")}
              </SelectItem>
              <SelectItem value="delivered">
                {t("admin:orders.statuses.delivered")}
              </SelectItem>
              <SelectItem value="cancelled">
                {t("admin:orders.statuses.cancelled")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px] md:min-w-0">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                {t("admin:orders.orderId")}
              </th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                {t("admin:orders.user")}
              </th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                {t("admin:orders.date")}
              </th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                {t("admin:orders.items")}
              </th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                {t("admin:orders.total")}
              </th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                {t("admin:orders.status")}
              </th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                {t("admin:orders.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton rows={8} columns={7} />
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-muted-foreground"
                >
                  {statusFilter !== "all"
                    ? t("admin:orders.noOrdersWithStatus", {
                        status: statusFilter,
                      })
                    : t("admin:orders.noOrders")}
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-border hover:bg-muted/50"
                >
                  <td className="p-3 text-sm font-medium text-foreground">
                    {o.id}
                  </td>
                  <td className="p-3">
                    <div className="text-sm font-medium text-foreground">
                      {o.user?.name || t("admin:common.unknown")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {o.user?.email || t("admin:common.noEmail")}
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {o.date}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {t("admin:orders.itemCount", { count: o.items.length })}
                  </td>
                  <td className="p-3 text-sm font-medium text-foreground">
                    {formatCurrency(o.total)}
                  </td>
                  <td className="p-3">
                    <Select
                      value={o.status}
                      onValueChange={(v) =>
                        updateStatusMutation.mutate({ id: o.id, status: v })
                      }
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "placed",
                          "processing",
                          "shipped",
                          "delivered",
                          "cancelled",
                        ].map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {t(`admin:orders.statuses.${s}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(o)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {selected?.id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {t("admin:orders.customer_label")}
                  </span>{" "}
                  <span className="text-foreground block">
                    {selected.user?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selected.user?.email}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {t("admin:orders.date_label")}
                  </span>{" "}
                  <span className="text-foreground block">{selected.date}</span>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">
                  {t("admin:orders.address_label")}
                </span>{" "}
                <span className="text-foreground block">
                  {selected.shippingAddress}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  {t("admin:orders.items")}
                </h4>
                {selected.items.map((i) => (
                  <div
                    key={i.productId}
                    className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                  >
                    <img
                      src={i.image}
                      alt={i.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{i.name}</p>
                      <p className="text-xs text-muted-foreground">
                        x{i.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(i.price * i.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-display font-bold text-foreground pt-2 border-t border-border">
                <span>{t("admin:orders.total")}</span>
                <span>{formatCurrency(selected.total)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrdersPage;
