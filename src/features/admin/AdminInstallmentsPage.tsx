import { useState } from "react";
import { CheckCircleOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Pagination } from "@mui/material";
import { useSnackbar } from "notistack";
import { AdminQueryState } from "./components/AdminQueryState";
import {
  useAdminInstallments,
  useConfirmAdminInstallmentPayment,
} from "./installment-queries";
import type { AdminInstallment } from "./installments-api";
import { InstallmentStatusChip } from "../../components/InstallmentStatusChip";
import { formatDate, formatMoney } from "../../utils/formatters";
import { getErrorMessage } from "../../services/api-client";

const pageSizeOptions = [10, 20, 50];

export function AdminInstallmentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState("all");
  const [dueBefore, setDueBefore] = useState("");
  const [selected, setSelected] = useState<AdminInstallment | null>(null);
  const query = useAdminInstallments({
    status: status === "all" ? undefined : (status as "pending" | "overdue"),
    dueBefore: dueBefore || undefined,
    page,
    limit,
  });
  const confirmMutation = useConfirmAdminInstallmentPayment();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const installments = query.data?.data ?? [];

  const confirmPayment = async () => {
    if (!selected) return;
    try {
      await confirmMutation.mutateAsync(selected.id);
      enqueueSnackbar("دریافت قسط تأیید شد.", { variant: "success" });
      setSelected(null);
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, "تأیید دریافت قسط انجام نشد."), {
        variant: "error",
      });
    }
  };

  const columns: GridColDef<AdminInstallment>[] = [
    {
      field: "installmentNumber",
      headerName: "شماره قسط",
      width: 110,
      valueFormatter: (value) =>
        new Intl.NumberFormat("fa-IR").format(Number(value)),
    },
    {
      field: "user",
      headerName: "کاربر",
      flex: 1,
      minWidth: 150,
      valueGetter: (_value, row) => row.user?.fullName ?? row.userName ?? "—",
    },
    {
      field: "phone",
      headerName: "شماره موبایل",
      flex: 1,
      minWidth: 150,
      valueGetter: (_value, row) => row.user?.phone ?? row.userName ?? "—",
    },
    {
      field: "amount",
      headerName: "مبلغ",
      width: 140,
      valueFormatter: (value) => formatMoney(value as string | number),
    },
    {
      field: "dueDate",
      headerName: "تاریخ سررسید",
      width: 140,
      valueFormatter: (value) => formatDate(value as string),
    },
    {
      field: "status",
      headerName: "وضعیت",
      width: 130,
      renderCell: ({ row }) => <InstallmentStatusChip status={row.status} />,
    },
    {
      field: "actions",
      headerName: "عملیات",
      sortable: false,
      filterable: false,
      width: 170,
      renderCell: ({ row }) =>
        row.status !== "paid" ? (
          <Button
            size="small"
            startIcon={<CheckCircleOutlined />}
            onClick={() => setSelected(row)}
          >
            تایید دریافت وجه
          </Button>
        ) : (
          "—"
        ),
    },
  ];

  const changePagination = (model: GridPaginationModel) => {
    if (model.pageSize !== limit) {
      setLimit(model.pageSize);
      setPage(1);
    } else setPage(model.page + 1);
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          مدیریت اقساط
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          بررسی سررسیدها و ثبت دریافت وجه
        </Typography>
      </Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <TextField
          select
          label="وضعیت"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          sx={{ minWidth: { sm: 190 } }}
        >
          <MenuItem value="all">همه</MenuItem>
          <MenuItem value="pending">در انتظار پرداخت</MenuItem>
          <MenuItem value="overdue">معوق</MenuItem>
        </TextField>
        <TextField
          type="date"
          label="سررسید تا"
          value={dueBefore}
          onChange={(event) => {
            setDueBefore(event.target.value);
            setPage(1);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: { sm: 210 } }}
        />
        {dueBefore && (
          <Button
            onClick={() => {
              setDueBefore("");
              setPage(1);
            }}
          >
            پاک‌کردن تاریخ
          </Button>
        )}
      </Stack>
      {query.error && (
        <AdminQueryState
          loading={false}
          error={query.error}
          empty={false}
          onRetry={() => void query.refetch()}
        />
      )}
      {!query.error && query.isLoading && (
        <AdminQueryState
          loading
          error={null}
          empty={false}
          onRetry={() => void query.refetch()}
        />
      )}
      {!query.error && !query.isLoading && installments.length === 0 && (
        <AdminQueryState
          loading={false}
          error={null}
          empty
          onRetry={() => void query.refetch()}
          emptyTitle="قسطی مطابق فیلترها پیدا نشد."
        />
      )}
      {!query.error && !query.isLoading && installments.length > 0 && (
        <>
          {isDesktop ? (
            <Paper
              variant="outlined"
              sx={{ height: 620, width: "100%", overflow: "hidden" }}
            >
              <DataGrid
                aria-label="فهرست اقساط"
                rows={installments}
                columns={columns}
                rowCount={query.data?.total ?? 0}
                loading={query.isFetching}
                paginationMode="server"
                paginationModel={{ page: page - 1, pageSize: limit }}
                onPaginationModelChange={changePagination}
                pageSizeOptions={pageSizeOptions}
                disableRowSelectionOnClick
                localeText={{ noRowsLabel: "قسطی برای نمایش نیست." }}
              />
            </Paper>
          ) : (
            <>
              <Stack spacing={1.5}>
                {installments.map((item) => (
                  <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={1.25}>
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography sx={{ fontWeight: 700 }}>
                          قسط{" "}
                          {new Intl.NumberFormat("fa-IR").format(
                            item.installmentNumber,
                          )}
                        </Typography>
                        <InstallmentStatusChip status={item.status} />
                      </Stack>
                      <Typography variant="body2">
                        کاربر: {item.user?.fullName ?? item.userName ?? "—"}
                      </Typography>
                      <Typography variant="body2">
                        مبلغ: {formatMoney(item.amount)}
                      </Typography>
                      <Typography variant="body2">
                        سررسید: {formatDate(item.dueDate)}
                      </Typography>
                      {item.status !== "paid" && (
                        <Button
                          startIcon={<CheckCircleOutlined />}
                          onClick={() => setSelected(item)}
                          sx={{ alignSelf: "flex-start" }}
                        >
                          تایید دریافت وجه
                        </Button>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {new Intl.NumberFormat("fa-IR").format(
                    query.data?.total ?? 0,
                  )}{" "}
                  قسط
                </Typography>
                <Pagination
                  page={page}
                  count={query.data?.totalPages ?? 1}
                  onChange={(_, nextPage) => setPage(nextPage)}
                  color="primary"
                />
              </Stack>
            </>
          )}
        </>
      )}
      <Dialog
        open={Boolean(selected)}
        onClose={
          confirmMutation.isPending ? undefined : () => setSelected(null)
        }
        dir="rtl"
      >
        <DialogTitle>تأیید دریافت وجه</DialogTitle>
        <DialogContent>
          <DialogContentText>
            آیا از تایید دریافت این قسط اطمینان دارید؟
          </DialogContentText>
          {confirmMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {getErrorMessage(
                confirmMutation.error,
                "تأیید دریافت قسط انجام نشد.",
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            disabled={confirmMutation.isPending}
            onClick={() => setSelected(null)}
          >
            انصراف
          </Button>
          <Button
            variant="contained"
            disabled={confirmMutation.isPending}
            onClick={() => void confirmPayment()}
          >
            {confirmMutation.isPending ? "در حال ثبت..." : "تأیید دریافت"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
