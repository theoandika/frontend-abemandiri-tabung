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
    children: [
      {
        id: "supplier-list",
        icon: "NiList",
        label: "Daftar Supplier",
        color: "text-primary",
        href: "/supplier",
      },
      {
        id: "add-supplier",
        icon: "NiPlusSquare",
        label: "Tambah Supplier",
        color: "text-primary",
        href: "/tambah-supplier",
      }
    ]
  },
  {
    id: "member",
    icon: "NiUsers",
    label: "Member",
    color: "text-primary",
    children: [
      {
        id: "member-list",
        icon: "NiList",
        label: "Daftar Member",
        color: "text-primary",
        href: "/member",
      },
      {
        id: "add-member",
        icon: "NiPlusSquare",
        label: "Tambah Member",
        color: "text-primary",
        href: "/tambah-member",
      }
    ]
  },
  {
    id: "tube-content",
    icon: "NiSparkle",
    label: "Jenis Isi Tabung",
    color: "text-primary",
    children: [
      {
        id: "tube-content-list",
        icon: "NiList",
        label: "Jenis Isi",
        color: "text-primary",
        href: "/jenis-isi",
      },
      {
        id: "add-tube-content",
        icon: "NiPlusSquare",
        label: "Tambah Jenis Isi",
        color: "text-primary",
        href: "/tambah-jenis-isi",
      }
    ]
  },
  {
    id: "tube",
    icon: "NiTubes",
    label: "Tabung",
    color: "text-primary",
    children: [
      {
        id: "tube-list",
        icon: "NiList",
        label: "Daftar Tabung",
        color: "text-primary",
        href: "/tabung",
      },
      {
        id: "add-tube",
        icon: "NiPlusSquare",
        label: "Tambah Tabung",
        color: "text-primary",
        href: "/tambah-tabung",
      },
      {
        id: "change-tube-barcode",
        icon: "NiPenSquare",
        label: "Ubah Barcode",
        color: "text-primary",
        href: "/ubah-barcode",
      }
    ]
  },
  {
    id: "transaction",
    icon: "NiCartEmpty",
    label: "Transaksi Member",
    color: "text-primary",
    children: [
      {
        id: "transaction-list",
        icon: "NiList",
        label: "Daftar Transaksi",
        color: "text-primary",
        href: "/transaksi-member",
      },
      {
        id: "add-transaction",
        icon: "NiPlusSquare",
        label: "Transaksi Baru",
        color: "text-primary",
        href: "/transaksi-baru",
      }
    ]
  },
  {
    id: "supplier-transaction",
    icon: "NiCartEmpty",
    label: "Transaksi Supplier",
    color: "text-primary",
    children: [
      {
        id: "supplier-transaction-list",
        icon: "NiList",
        label: "Daftar Transaksi",
        color: "text-primary",
        href: "/transaksi-supplier",
      },
      {
        id: "add-transaction-supplier",
        icon: "NiPlusSquare",
        label: "Transaksi Baru",
        color: "text-primary",
        href: "/transaksi-supplier-baru",
      }
    ]
  },
];

export const leftMenuBottomItems: MenuItem[] = [
  {
    id: "role",
    label: "Role",
    href: "/docs",
    icon: "NiUserCheck",
    color: "text-primary",
    children: [
      {
        id: "role-list",
        label: "menu-welcome",
        href: "/docs/welcome",
        hideInMenu: true,
        children: [
          {
            id: "docs-introduction",
            label: "docs-introduction",
            href: "/docs/welcome/introduction",
          },
          {
            id: "docs-faq",
            label: "docs-faq",
            href: "/docs/welcome/faq",
          },
          {
            id: "docs-changelog",
            label: "docs-changelog",
            href: "/docs/welcome/changelog",
          },
        ],
      },
      {
        id: "docs-getting-started",
        label: "docs-getting-started",
        href: "/docs/getting-started",
        hideInMenu: true,
        children: [
          {
            id: "docs-installation",
            label: "docs-installation",
            href: "/docs/getting-started/installation",
          },
          {
            id: "docs-file-structure",
            label: "docs-file-structure",
            href: "/docs/getting-started/file-structure",
          },
          {
            id: "docs-routing-and-menu",
            label: "docs-routing-and-menu",
            href: "/docs/getting-started/routing-and-menu",
          },
          {
            id: "docs-multi-language",
            label: "docs-multi-language",
            href: "/docs/getting-started/multi-language",
          },
        ],
      },
      {
        id: "docs-theme",
        label: "menu-theme",
        href: "/docs/theme",
        hideInMenu: true,
        children: [
          {
            id: "docs-settings",
            label: "docs-settings",
            href: "/docs/theme/settings",
          },
          {
            id: "docs-theme-provider",
            label: "docs-theme-provider",
            href: "/docs/theme/theme-provider",
          },
          {
            id: "docs-styling",
            label: "docs-styling",
            href: "/docs/theme/styling",
          },
        ],
      },
    ],
  },
  { id: "users", label: "User", href: "/settings", icon: "NiUser" },
];
