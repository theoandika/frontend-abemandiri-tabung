import { MenuItem, Viewer } from "@/types/types";

export const leftMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    icon: "NiHome",
    label: "Dashboard",
    color: "text-primary",
    href: "/dashboard",
  },
  {
    id: "site",
    icon: "NiBuilding",
    label: "Cabang",
    color: "text-primary",
    canAccess: [Viewer.ADMINISTRATOR],
    children: [
      {
        id: "site-list",
        icon: "NiList",
        label: "Daftar Cabang",
        color: "text-primary",
        href: "/cabang",
      },
      {
        id: "add-site",
        icon: "NiPlusSquare",
        label: "Tambah Cabang",
        color: "text-primary",
        href: "/tambah-cabang",
      }
    ]
  },
  {
    id: "supplier",
    icon: "NiUsers",
    label: "Supplier",
    color: "text-primary",
    permissions: ["view-supplier","create-supplier"],
    children: [
      {
        id: "supplier-list",
        icon: "NiList",
        label: "Daftar Supplier",
        color: "text-primary",
        href: "/supplier",
        permissions: ["view-supplier"]
      },
      {
        id: "add-supplier",
        icon: "NiPlusSquare",
        label: "Tambah Supplier",
        color: "text-primary",
        href: "/tambah-supplier",
        permissions: ["create-supplier"]
      }
    ]
  },
  {
    id: "member",
    icon: "NiUsers",
    label: "Member",
    color: "text-primary",
    permissions: ["view-member","create-member"],
    children: [
      {
        id: "member-list",
        icon: "NiList",
        label: "Daftar Member",
        color: "text-primary",
        href: "/member",
        permissions: ["view-member"],
      },
      {
        id: "add-member",
        icon: "NiPlusSquare",
        label: "Tambah Member",
        color: "text-primary",
        href: "/tambah-member",
        permissions: ["create-member"],
      }
    ]
  },
  {
    id: "tube-content",
    icon: "NiSparkle",
    label: "Jenis Isi Tabung",
    color: "text-primary",
    permissions: ["view-tube-content-type","create-tube-content-type"],
    children: [
      {
        id: "tube-content-list",
        icon: "NiList",
        label: "Jenis Isi",
        color: "text-primary",
        href: "/jenis-isi",
        permissions: ["view-tube-content-type"],
      },
      {
        id: "add-tube-content",
        icon: "NiPlusSquare",
        label: "Tambah Jenis Isi",
        color: "text-primary",
        href: "/tambah-jenis-isi",
        permissions: ["create-tube-content-type"],
      }
    ]
  },
  {
    id: "tube",
    icon: "NiTubes",
    label: "Tabung",
    color: "text-primary",
    permissions: ["view-tube","create-tube","view-tube-barcode"],
    children: [
      {
        id: "tube-list",
        icon: "NiList",
        label: "Daftar Tabung",
        color: "text-primary",
        href: "/tabung",
        permissions: ["view-tube"],
      },
      {
        id: "add-tube",
        icon: "NiPlusSquare",
        label: "Tambah Tabung",
        color: "text-primary",
        href: "/tambah-tabung",
        permissions: ["create-tube"],
      },
      {
        id: "change-tube-barcode",
        icon: "NiBarcode",
        label: "Ubah Barcode",
        color: "text-primary",
        href: "/ubah-barcode",
        permissions: ["view-tube-barcode"],
      }
    ]
  },
  {
    id: "transaction",
    icon: "NiCartEmpty",
    label: "Transaksi Member",
    color: "text-primary",
    permissions: ["view-transaction","create-transaction"],
    children: [
      {
        id: "transaction-list",
        icon: "NiList",
        label: "Daftar Transaksi",
        color: "text-primary",
        href: "/transaksi-member",
        permissions: ["view-transaction"],
      },
      {
        id: "transaction-draft-list",
        icon: "NiPullRequestDraft",
        label: "Draft",
        color: "text-primary",
        href: "/draft-transaksi",
        permissions: ["create-transaction"],
      },
      {
        id: "add-transaction",
        icon: "NiPlusSquare",
        label: "Transaksi Baru",
        color: "text-primary",
        href: "/transaksi-baru",
        permissions: ["create-transaction"],
      }
    ]
  },
  {
    id: "supplier-transaction",
    icon: "NiCartEmpty",
    label: "Transaksi Supplier",
    color: "text-primary",
    permissions: ["view-supplier-transaction","create-supplier-transaction"],
    children: [
      {
        id: "supplier-transaction-list",
        icon: "NiList",
        label: "Daftar Transaksi",
        color: "text-primary",
        href: "/transaksi-supplier",
        permissions: ["view-supplier-transaction"],
      },
      {
        id: "add-transaction-supplier",
        icon: "NiPlusSquare",
        label: "Transaksi Baru",
        color: "text-primary",
        href: "/transaksi-supplier-baru",
        permissions: ["create-supplier-transaction"],
      }
    ]
  },
  {
    id: "stock-opname",
    icon: "NiDocumentCheck",
    label: "Stock Opname",
    color: "text-primary",
    permissions: ["view-stock-opname","create-stock-opname"],
    children: [
      {
        id: "stock-opname-list",
        icon: "NiList",
        label: "Riwayat",
        color: "text-primary",
        href: "/stock-opname",
        permissions: ["view-stock-opname"],
      },
      {
        id: "add-stock-opname",
        icon: "NiPlusSquare",
        label: "Submit",
        color: "text-primary",
        href: "/submit-stock-opname",
        permissions: ["create-stock-opname"],
      }
    ]
  },
  {
    id: "reports",
    icon: "NiDocumentArchive",
    label: "Laporan",
    color: "text-primary",
    permissions: ["view-tube-activity","view-tube-stock-opname"],
    children: [
      {
        id: "tube-activity",
        icon: "NiDocumentFull",
        label: "Aktivitas Tabung",
        color: "text-primary",
        href: "/aktivitas-tabung",
        permissions: ["view-tube-activity"],
      },
      {
        id: "tube-stock-opname",
        icon: "NiListCheck",
        label: "Stock Opname Tabung",
        color: "text-primary",
        href: "/stock-opname-tabung",
        permissions: ["view-tube-stock-opname"],
      },
    ]
  },
];

export const leftMenuBottomItems: MenuItem[] = [
  {
    id: "role",
    label: "Role",
    href: "/role",
    icon: "NiUserCheck",
    color: "text-primary",
    canAccess: [Viewer.ADMINISTRATOR],
    children: [
      {
        id: "role-list",
        icon: "NiList",
        label: "Daftar Role",
        color: "text-primary",
        href: "/role",
      },
      {
        id: "add-role",
        icon: "NiPlusSquare",
        label: "Tambah Role",
        color: "text-primary",
        href: "/tambah-role",
      }
    ]
  },
  {
    id: "users",
    label: "User",
    href: "/settings",
    icon: "NiUser",
    canAccess: [Viewer.ADMINISTRATOR],
    children: [
      {
        id: "user-list",
        icon: "NiList",
        label: "Daftar User",
        color: "text-primary",
        href: "/user",
      },
      {
        id: "add-user",
        icon: "NiPlusSquare",
        label: "Tambah User",
        color: "text-primary",
        href: "/tambah-user",
      }
    ]
  },
];
