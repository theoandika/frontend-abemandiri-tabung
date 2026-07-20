const ApiEndpoint = {
    // auth
    LOGIN: 'auth/login',
    LOGOUT: 'auth/logout',

    // account
    ACCOUNT: 'account/detail',

    // member
    MEMBER_ALL: "members",
    MEMBER_INDEX: "members/index",

    // site
    SITE_ALL: 'sites',
    SITE_INDEX: 'sites/index',

    // supplier
    SUPPLIER: 'suppliers',
    SUPPLIER_INDEX: 'suppliers/index',

    // tube
    TUBE_INDEX: 'tubes/index',
    CREATE_TUBE: 'tubes',

    // tube content
    TUBE_CONTENT_ALL: 'tube-content-types',
    TUBE_CONTENT_INDEX: 'tube-content-types/index',

    // member transaction
    TRANSACTION_MEMBER_INDEX: 'transactions/index',
    CREATE_MEMBER_TRANSACTION: 'transactions',

    // tube barcodes
    TUBE_BARCODES_INDEX: 'tube-barcodes/index',
    TUBE_BARCODES_UPDATE: 'tube-barcodes/update',

    // supplier transaction
    SUPPLIER_TRANSACTION: 'supplier-transactions',
    SUPPLIER_TRANSACTION_INDEX: 'supplier-transactions/index',

    // report
    TUBE_ACTIVITY_REPORT: 'reports/tube-activities',
}

export default ApiEndpoint